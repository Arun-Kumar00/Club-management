// app/api/students/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET /api/students?clubCode=tc
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const clubCode = searchParams.get("clubCode");
    const role = searchParams.get("role"); // optional filter by role

    const filter = {};
    if (clubCode) filter.clubCode = clubCode.toLowerCase();
    if (role) filter.role = role;

    const students = await Student.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, count: students.length, data: students });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/students  (multipart/form-data for image upload)
export async function POST(request) {
  try {
    await connectDB();

    // Parse multipart form data
    const formData = await request.formData();

    const name = formData.get("name");
    const email = formData.get("email");
    const role = formData.get("role");
    const phone = formData.get("phone") || null;
    const clubCode = formData.get("clubCode");
    const clubName = formData.get("clubName");
    const imageFile = formData.get("image"); // File object or null

    // Validate required fields
    if (!name || !email || !role || !clubCode || !clubName) {
      return NextResponse.json(
        { success: false, message: "name, email, role, clubCode, clubName are required" },
        { status: 400 }
      );
    }

    // Photo is required for non-Volunteer roles
    const photoRequired = ["GS", "DGS", "Executive"].includes(role);
    if (photoRequired && !imageFile) {
      return NextResponse.json(
        { success: false, message: `Photo is required for role: ${role}` },
        { status: 400 }
      );
    }

    // Check duplicate student
    const existing = await Student.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Student with this email already exists" },
        { status: 409 }
      );
    }

    let imageUrl = null;

    // Handle image upload
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate clean filename: clubCode_name_role.ext
      // e.g. tc_john_doe_GS.jpg
      const ext = imageFile.name.split(".").pop().toLowerCase();
      const safeName = name.toLowerCase().replace(/\s+/g, "_");
      const fileName = `${clubCode.toLowerCase()}_${safeName}_${role}.${ext}`;

      // Ensure /public/Photos directory exists
      const photosDir = path.join(process.cwd(), "public", "Photos");
      await mkdir(photosDir, { recursive: true });

      const filePath = path.join(photosDir, fileName);
      await writeFile(filePath, buffer);

      // Store the public URL path (frontend accesses via /Photos/filename)
      imageUrl = `/Photos/${fileName}`;
    }

    const student = await Student.create({
      name,
      email,
      role,
      phone,
      imageUrl,
      clubCode,
      clubName,
    });

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
