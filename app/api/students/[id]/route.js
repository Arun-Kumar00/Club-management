// app/api/students/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

// GET /api/students/:id
export async function GET(request, { params }) {
  try {
    await connectDB();
    const student = await Student.findById(params.id);

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/students/:id  (supports image update too)
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const existingStudent = await Student.findById(params.id);
    if (!existingStudent) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // Check content type to handle both JSON and FormData
    const contentType = request.headers.get("content-type") || "";
    let updateData = {};
    let imageUrl = existingStudent.imageUrl; // keep existing by default

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      if (formData.get("name")) updateData.name = formData.get("name");
      if (formData.get("email")) updateData.email = formData.get("email");
      if (formData.get("role")) updateData.role = formData.get("role");
      if (formData.get("phone") !== null) updateData.phone = formData.get("phone");
      if (formData.get("clubCode")) updateData.clubCode = formData.get("clubCode");
      if (formData.get("clubName")) updateData.clubName = formData.get("clubName");

      const imageFile = formData.get("image");
      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const name = updateData.name || existingStudent.name;
        const role = updateData.role || existingStudent.role;
        const clubCode = updateData.clubCode || existingStudent.clubCode;

        const ext = imageFile.name.split(".").pop().toLowerCase();
        const safeName = name.toLowerCase().replace(/\s+/g, "_");
        const fileName = `${clubCode}_${safeName}_${role}.${ext}`;

        const photosDir = path.join(process.cwd(), "public", "Photos");
        await mkdir(photosDir, { recursive: true });

        await writeFile(path.join(photosDir, fileName), buffer);
        imageUrl = `/Photos/${fileName}`;
      }
    } else {
      // JSON body (no image update)
      updateData = await request.json();
    }

    updateData.imageUrl = imageUrl;

    const student = await Student.findByIdAndUpdate(
      params.id,
      { ...updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/students/:id
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const student = await Student.findByIdAndDelete(params.id);

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // Optionally delete the image file from disk
    if (student.imageUrl) {
      try {
        const filePath = path.join(process.cwd(), "public", student.imageUrl);
        await unlink(filePath);
      } catch {
        // Image already gone or path wrong — not critical
        console.warn("Could not delete image file:", student.imageUrl);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
