import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Gallery from "@/lib/models/Gallery";
import Event from "@/lib/models/Event";
import { generateFileName, saveFile } from "@/lib/fileHelper";

// GET /api/gallery?clubCode=tc
// GET /api/gallery?clubCode=tc&eventId=xxx   ← filter by event
// Returns galleries with ready-to-use photo URLs
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const clubCode = searchParams.get("clubCode") || session.user.clubCode;
    const eventId  = searchParams.get("eventId");

    const filter = { clubCode: clubCode.toLowerCase() };
    if (eventId) filter.eventId = eventId;

    const galleries = await Gallery.find(filter)
      .populate("eventId", "title date location") // pull event details
      .sort({ createdAt: -1 });

    // Add usable URLs for all stored paths
    const withUrls = galleries.map(g => {
      const obj = g.toObject();
      return {
        ...obj,
        bannerUrl: obj.bannerPath ? `/api/files?path=${obj.bannerPath}` : null,
        photoUrls: (obj.photos || []).map(p => `/api/files?path=${p}`),
      };
    });

    return NextResponse.json({ success: true, count: galleries.length, data: withUrls });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/gallery — multipart/form-data
//
// For EVENT-LINKED gallery:
//   eventId, clubCode, clubName, photo1..photo6 (files)
//   title and banner are optional
//
// For STANDALONE (open) gallery:
//   title (required), clubCode, clubName
//   banner (required), photo1..photo6 (files)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const formData = await request.formData();

    const eventId  = formData.get("eventId") || null;
    const title    = formData.get("title") || null;
    const clubCode = formData.get("clubCode");
    const clubName = formData.get("clubName");
    const banner   = formData.get("banner");

    if (!clubCode || !clubName) {
      return NextResponse.json({ success: false, message: "clubCode and clubName are required" }, { status: 400 });
    }

    // Standalone gallery needs title + banner
    const isStandalone = !eventId;
    if (isStandalone && !title) {
      return NextResponse.json({ success: false, message: "title is required for standalone gallery" }, { status: 400 });
    }
    if (isStandalone && (!banner || banner.size === 0)) {
      return NextResponse.json({ success: false, message: "banner photo is required for standalone gallery" }, { status: 400 });
    }

    // If eventId given, verify it exists
    let eventData = null;
    if (eventId) {
      eventData = await Event.findById(eventId);
      if (!eventData) return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    // Collect up to 6 photo files: photo1, photo2, ... photo6
    const photoFiles = [];
    for (let i = 1; i <= 6; i++) {
      const file = formData.get(`photo${i}`);
      if (file && file.size > 0) photoFiles.push(file);
    }
    if (photoFiles.length === 0 && !isStandalone) {
      return NextResponse.json({ success: false, message: "At least one photo is required" }, { status: 400 });
    }

    // Use event date/location for naming if linked, else today's date
    const nameDate     = eventData?.date || new Date().toISOString().slice(0, 10);
    const nameLocation = eventData?.location || "general";

    // Save banner (if present)
    let bannerPath = null;
    if (banner && banner.size > 0) {
      const bannerName = generateFileName({
        clubCode, type: "gallery-banner",
        date: nameDate, location: nameLocation,
        originalName: banner.name,
      });
      bannerPath = await saveFile(banner, "gallery", bannerName);
    }

    // Save each photo with index in name
    const savedPhotos = [];
    for (let i = 0; i < photoFiles.length; i++) {
      const fileName = generateFileName({
        clubCode, type: "gallery",
        date: nameDate, location: nameLocation,
        index: i + 1,
        originalName: photoFiles[i].name,
      });
      const savedPath = await saveFile(photoFiles[i], "gallery", fileName);
      savedPhotos.push(savedPath);
    }

    const gallery = await Gallery.create({
      eventId: eventId || null,
      title,
      bannerPath,
      photos: savedPhotos,
      clubCode,
      clubName,
    });

    // Return with ready URLs
    return NextResponse.json({
      success: true,
      data: {
        ...gallery.toObject(),
        bannerUrl: bannerPath ? `/api/files?path=${bannerPath}` : null,
        photoUrls: savedPhotos.map(p => `/api/files?path=${p}`),
      },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}