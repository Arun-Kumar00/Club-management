// app/api/teachers/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Teacher from "@/lib/models/Teacher";

// GET /api/teachers/:id
export async function GET(request, { params }) {
  try {
    await connectDB();
    const teacher = await Teacher.findById(params.id);

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: teacher });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/teachers/:id
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const body = await request.json();

    const teacher = await Teacher.findByIdAndUpdate(
      params.id,
      { ...body },
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: teacher });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/teachers/:id
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const teacher = await Teacher.findByIdAndDelete(params.id);

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
