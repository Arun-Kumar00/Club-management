// lib/models/Student.js
import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
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
    enum: ["GS", "DGS", "Executive", "Volunteer"],
  },
  phone: {
    type: String,
    trim: true,
    default: null,
    // Optional for all, stored as string to handle +91 etc.
  },
  imageUrl: {
    type: String,
    default: null,
    // Stored path like "/Photos/tc_john_doe_GS.jpg"
    // Required for GS, DGS, Executive — optional for Volunteer
  },
  clubCode: {
    type: String,
    required: true,
    lowercase: true,
  },
  clubName: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
