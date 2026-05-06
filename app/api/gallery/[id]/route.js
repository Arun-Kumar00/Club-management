import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Gallery from "@/lib/models/Gallery";
import Event from "@/lib/models/Event";
import { generateFileName, saveFile, deleteFile } from "@/lib/fileHelper";

// GET /api/gallery/:id
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const gallery = await Gallery.findById(params.id).populate("eventId", "title date location");
    if (!gallery) return NextResponse.json({ success: false, message: "Gallery not found" }, { status: 404 });

    const obj = gallery.toObject();
    return NextResponse.json({
      success: true,
      data: {
        ...obj,
        bannerUrl: obj.bannerPath ? `/api/files?path=${obj.bannerPath}` : null,
        photoUrls: (obj.photos || []).map(p => `/api/files?path=${p}`),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT /api/gallery/:id — multipart/form-data
// You can:
//   - Update title / eventId link
//   - Replace banner
//   - Add more photos (replaces current photo list — send all photos again)
//   - Remove all photos by sending removePhotos=true
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const existing = await Gallery.findById(params.id);
    if (!existing) return NextResponse.json({ success: false, message: "Gallery not found" }, { status: 404 });

    const formData = await request.formData();
    const updateData = {};

    const title    = formData.get("title");
    const eventId  = formData.get("eventId");
    if (title !== null) updateData.title = title;
    if (eventId !== null) updateData.eventId = eventId || null;

    // Verify new eventId if provided
    let eventData = null;
    const targetEventId = eventId !== null ? eventId : existing.eventId;
    if (targetEventId) {
      eventData = await Event.findById(targetEventId);
    }

    const nameDate     = eventData?.date || new Date().toISOString().slice(0, 10);
    const nameLocation = eventData?.location || "general";
    const clubCode     = existing.clubCode;

    // Replace banner if new one sent
    const banner = formData.get("banner");
    if (banner && banner.size > 0) {
      if (existing.bannerPath) await deleteFile(existing.bannerPath);
      const bannerName = generateFileName({
        clubCode, type: "gallery-banner",
        date: nameDate, location: nameLocation,
        originalName: banner.name,
      });
      updateData.bannerPath = await saveFile(banner, "gallery", bannerName);
    }

    // Replace photos if new ones sent
    // Count how many photo files are in this request
    const newPhotoFiles = [];
    for (let i = 1; i <= 6; i++) {
      const file = formData.get(`photo${i}`);
      if (file && file.size > 0) newPhotoFiles.push(file);
    }

    if (newPhotoFiles.length > 0) {
      // Delete old photos
      for (const oldPhoto of existing.photos) await deleteFile(oldPhoto);

      // Save new photos
      const savedPhotos = [];
      for (let i = 0; i < newPhotoFiles.length; i++) {
        const fileName = generateFileName({
          clubCode, type: "gallery",
          date: nameDate, location: nameLocation,
          index: i + 1,
          originalName: newPhotoFiles[i].name,
        });
        const savedPath = await saveFile(newPhotoFiles[i], "gallery", fileName);
        savedPhotos.push(savedPath);
      }
      updateData.photos = savedPhotos;
    }

    const gallery = await Gallery.findByIdAndUpdate(params.id, updateData, { new: true, runValidators: true })
      .populate("eventId", "title date location");

    const obj = gallery.toObject();
    return NextResponse.json({
      success: true,
      data: {
        ...obj,
        bannerUrl: obj.bannerPath ? `/api/files?path=${obj.bannerPath}` : null,
        photoUrls: (obj.photos || []).map(p => `/api/files?path=${p}`),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/gallery/:id
// Deletes gallery + all its photos from disk
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const gallery = await Gallery.findByIdAndDelete(params.id);
    if (!gallery) return NextResponse.json({ success: false, message: "Gallery not found" }, { status: 404 });

    // Clean up all files from disk
    if (gallery.bannerPath) await deleteFile(gallery.bannerPath);
    for (const photo of gallery.photos) await deleteFile(photo);

    return NextResponse.json({
      success: true,
      message: `Gallery deleted. Removed ${gallery.photos.length} photo(s) from disk.`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}