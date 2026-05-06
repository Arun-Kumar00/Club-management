// app/api/clubs/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ClubAccess from "@/lib/models/ClubAccess";

// GET /api/clubs?code=tc&email=user@example.com
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const email = searchParams.get("email");

    if (!code || !email) {
      return NextResponse.json(
        { success: false, message: "Club code and email are required" },
        { status: 400 }
      );
    }

    // Check if this email has access to this club
    const access = await ClubAccess.findOne({
      email: email.toLowerCase(),
      clubCode: code.toLowerCase(),
    });

    if (!access) {
      return NextResponse.json(
        { success: false, message: "Access denied for this club" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        clubCode: access.clubCode,
        clubName: access.clubName,
        email: access.email,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/clubs — Add new club access entry (admin use)
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, clubCode, clubName } = body;

    if (!email || !clubCode || !clubName) {
      return NextResponse.json(
        { success: false, message: "email, clubCode, and clubName are required" },
        { status: 400 }
      );
    }

    const existing = await ClubAccess.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "This email already has club access" },
        { status: 409 }
      );
    }

    const newAccess = await ClubAccess.create({ email, clubCode, clubName });
    return NextResponse.json({ success: true, data: newAccess }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
