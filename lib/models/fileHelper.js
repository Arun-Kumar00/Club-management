import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

// Base uploads directory — inside /app folder, outside /public
// Structure:
//   uploads/
//     events/    ← event banners
//     gallery/   ← gallery photos and banners
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

/**
 * Generate a clean filename following the naming convention:
 * {clubCode}_{type}_{date}_{location}_{index}.{ext}
 *
 * Examples:
 *   tc_event_2025-06-01_auditorium.jpg
 *   cc_gallery_2025-06-01_stage_1.jpg
 *   tc_gallery-banner_2025-06-01_courtyard.png
 */
export function generateFileName({ clubCode, type, date, location, index = null, originalName }) {
  const ext = originalName.split(".").pop().toLowerCase();
  const safeDate = (date || new Date().toISOString().slice(0, 10));
  const safeLoc = (location || "general").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const safeClub = clubCode.toLowerCase();
  const indexPart = index !== null ? `_${index}` : "";

  return `${safeClub}_${type}_${safeDate}_${safeLoc}${indexPart}.${ext}`;
}

/**
 * Save a file to the uploads folder.
 * Returns the relative path stored in DB: "uploads/events/filename.jpg"
 */
export async function saveFile(file, subFolder, fileName) {
  const dir = path.join(UPLOADS_DIR, subFolder);
  await mkdir(dir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fullPath = path.join(dir, fileName);
  await writeFile(fullPath, buffer);

  // Return relative path for DB storage (used by /api/files to serve)
  return `${subFolder}/${fileName}`;
}

/**
 * Delete a file from uploads folder by its relative path.
 * e.g. deleteFile("events/tc_event_2025-06-01_auditorium.jpg")
 */
export async function deleteFile(relativePath) {
  if (!relativePath) return;
  try {
    const fullPath = path.join(UPLOADS_DIR, relativePath.replace(/^uploads\//, ""));
    await unlink(fullPath);
  } catch {
    console.warn("Could not delete file:", relativePath);
  }
}