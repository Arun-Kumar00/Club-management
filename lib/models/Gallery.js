import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema({
  // If linked to an event — optional
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    default: null,
    // null = standalone/open gallery (not tied to any event)
  },

  // Required if standalone (no eventId), optional if linked to event
  title: {
    type: String,
    trim: true,
    default: null,
    // For standalone galleries this is required (validated in API)
    // For event-linked galleries this is optional (event title is used on frontend)
  },

  // Banner/cover photo for standalone galleries
  bannerPath: {
    type: String,
    default: null,
    // Required for standalone galleries, optional for event-linked
  },

  // Up to 6 photos stored as array of file paths
  photos: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) { return arr.length <= 6; },
      message: "Maximum 6 photos allowed per gallery",
    },
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

export default mongoose.models.Gallery || mongoose.model("Gallery", GallerySchema);