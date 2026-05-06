// lib/models/Teacher.js
import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  role: {
    type: String,
    required: [true, "Role is required"],
    enum: ["coordinator", "cocoordinator"],
  },
  clubCode: {
    type: String,
    required: [true, "Club code is required"],
    lowercase: true,
    // e.g. "tc", "cc"
  },
  clubName: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.Teacher || mongoose.model("Teacher", TeacherSchema);
