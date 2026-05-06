// lib/models/ClubAccess.js
import mongoose from "mongoose";

const ClubAccessSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  clubCode: {
    type: String,
    required: true,
    enum: ["tc", "cc", "sc", "rc"], // add more club codes as needed
    lowercase: true,
  },
  clubName: {
    type: String,
    required: true,
    // e.g. "Technical Club", "Cultural Club"
  },
}, { timestamps: true });

export default mongoose.models.ClubAccess || mongoose.model("ClubAccess", ClubAccessSchema);
