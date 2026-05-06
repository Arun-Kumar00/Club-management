// scripts/seedClubAccess.js
// Run with: node scripts/seedClubAccess.js

const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const ClubAccessSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  clubCode: { type: String, required: true },
  clubName: { type: String, required: true },
});

const ClubAccess = mongoose.models.ClubAccess || mongoose.model("ClubAccess", ClubAccessSchema);

const seedData = [
  { email: "admin.technical@college.edu", clubCode: "tc", clubName: "Technical Club" },
  { email: "admin.cultural@college.edu",  clubCode: "cc", clubName: "Cultural Club" },
  // Add more emails here as needed
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  for (const entry of seedData) {
    await ClubAccess.findOneAndUpdate(
      { email: entry.email },
      entry,
      { upsert: true, new: true }
    );
    console.log(`✅ Seeded: ${entry.email} → ${entry.clubCode}`);
  }

  await mongoose.disconnect();
  console.log("Done!");
}

seed().catch(console.error);
