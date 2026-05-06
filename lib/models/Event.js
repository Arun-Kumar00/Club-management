import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  date: {
    type: String,
    required: [true, "Date is required"],
    // stored as "YYYY-MM-DD" string for easy display
  },
  time: {
    type: String,
    required: [true, "Time is required"],
    // stored as "HH:MM" string e.g. "14:30"
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  bannerPath: {
    type: String,
    default: null,
    // Physical path on disk: uploads/events/tc_event_2025-06-01_auditorium.jpg
    // NOT stored in public/ — served via /api/files?path=...
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

export default mongoose.models.Event || mongoose.model("Event", EventSchema);