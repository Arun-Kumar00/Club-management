import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Event from "@/lib/models/Event";
import Gallery from "@/lib/models/Gallery";
import { generateFileName, saveFile, deleteFile } from "@/lib/fileHelper";

// GET /api/events/:id
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const event = await Event.findById(params.id);
    if (!event) return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        ...event.toObject(),
        bannerUrl: event.bannerPath ? `/api/files?path=${event.bannerPath}` : null,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT /api/events/:id — multipart/form-data
// Only send fields you want to update. Banner is optional.
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const existing = await Event.findById(params.id);
    if (!existing) return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });

    const formData = await request.formData();
    const updateData = {};

    // Only update fields that are sent
    const fields = ["title", "date", "time", "location", "description", "clubCode", "clubName"];
    for (const field of fields) {
      const val = formData.get(field);
      if (val !== null) updateData[field] = val;
    }

    const bannerFile = formData.get("banner");
    if (bannerFile && bannerFile.size > 0) {
      // Delete old banner
      if (existing.bannerPath) await deleteFile(existing.bannerPath);

      const fileName = generateFileName({
        clubCode: updateData.clubCode || existing.clubCode,
        type: "event",
        date: updateData.date || existing.date,
        location: updateData.location || existing.location,
        originalName: bannerFile.name,
      });
      updateData.bannerPath = await saveFile(bannerFile, "events", fileName);
    }

    const event = await Event.findByIdAndUpdate(params.id, updateData, { new: true, runValidators: true });

    return NextResponse.json({
      success: true,
      data: {
        ...event.toObject(),
        bannerUrl: event.bannerPath ? `/api/files?path=${event.bannerPath}` : null,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/events/:id
// Also deletes: event banner file + all linked gallery photos
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const event = await Event.findByIdAndDelete(params.id);
    if (!event) return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });

    // Delete event banner
    if (event.bannerPath) await deleteFile(event.bannerPath);

    // Delete all galleries linked to this event + their photos
    const galleries = await Gallery.find({ eventId: params.id });
    for (const gallery of galleries) {
      if (gallery.bannerPath) await deleteFile(gallery.bannerPath);
      for (const photo of gallery.photos) await deleteFile(photo);
    }
    await Gallery.deleteMany({ eventId: params.id });

    return NextResponse.json({
      success: true,
      message: `Event deleted. Removed ${galleries.length} linked gallery(s) and all their photos.`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}