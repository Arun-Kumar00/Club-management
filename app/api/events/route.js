import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Event from "@/lib/models/Event";
import { generateFileName, saveFile } from "@/lib/fileHelper";

// GET /api/events?clubCode=tc
// Returns all events for a club, newest first
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const clubCode = searchParams.get("clubCode") || session.user.clubCode;

    const events = await Event.find({ clubCode: clubCode.toLowerCase() }).sort({ date: -1 });

    // Add a ready-to-use image URL for each event's banner
    // Frontend uses: <img src={event.bannerUrl} />
    const withUrls = events.map(e => ({
      ...e.toObject(),
      bannerUrl: e.bannerPath ? `/api/files?path=${e.bannerPath}` : null,
    }));

    return NextResponse.json({ success: true, count: events.length, data: withUrls });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/events — multipart/form-data
// Fields: title, date, time, location, description, clubCode, clubName, banner(file)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const formData = await request.formData();

    const title       = formData.get("title");
    const date        = formData.get("date");        // "YYYY-MM-DD"
    const time        = formData.get("time");        // "HH:MM"
    const location    = formData.get("location");
    const description = formData.get("description") || "";
    const clubCode    = formData.get("clubCode");
    const clubName    = formData.get("clubName");
    const bannerFile  = formData.get("banner");      // File or null

    if (!title || !date || !time || !location || !clubCode || !clubName) {
      return NextResponse.json(
        { success: false, message: "title, date, time, location, clubCode, clubName are required" },
        { status: 400 }
      );
    }

    let bannerPath = null;
    if (bannerFile && bannerFile.size > 0) {
      // Naming: tc_event_2025-06-01_auditorium.jpg
      const fileName = generateFileName({
        clubCode, type: "event",
        date, location,
        originalName: bannerFile.name,
      });
      bannerPath = await saveFile(bannerFile, "events", fileName);
    }

    const event = await Event.create({ title, date, time, location, description, bannerPath, clubCode, clubName });

    return NextResponse.json({
      success: true,
      data: {
        ...event.toObject(),
        bannerUrl: bannerPath ? `/api/files?path=${bannerPath}` : null,
      },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}