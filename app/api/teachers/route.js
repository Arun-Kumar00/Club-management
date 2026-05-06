// app/api/teachers/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Teacher from "@/lib/models/Teacher";

// GET /api/teachers?clubCode=tc
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const clubCode = searchParams.get("clubCode");

    // If clubCode provided, filter by club — else return all
    const filter = clubCode ? { clubCode: clubCode.toLowerCase() } : {};
    const teachers = await Teacher.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, count: teachers.length, data: teachers });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/teachers
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, role, clubCode, clubName } = body;

    // Validate required fields
    if (!email || !role || !clubCode || !clubName) {
      return NextResponse.json(
        { success: false, message: "email, role, clubCode, and clubName are required" },
        { status: 400 }
      );
    }

    // Check duplicate
    const existing = await Teacher.findOne({ email: email.toLowerCase(), clubCode });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Teacher already exists in this club" },
        { status: 409 }
      );
    }

    const teacher = await Teacher.create({ email, role, clubCode, clubName });
    return NextResponse.json({ success: true, data: teacher }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
