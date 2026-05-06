import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Serve files from /uploads folder (which is outside /public)
// Usage: GET /api/files?path=events/tc_event_2025-06-01_auditorium.jpg
//
// Frontend uses this URL in <img src="/api/files?path=events/filename.jpg" />
// This way photos are NOT publicly accessible directly — only through this API.

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Map extensions to MIME types
const MIME = {
  jpg: "image/jpeg", jpeg: "image/jpeg",
  png: "image/png", gif: "image/gif",
  webp: "image/webp", avif: "image/avif",
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json({ message: "path param is required" }, { status: 400 });
    }

    // Security: prevent path traversal attacks (e.g. ../../etc/passwd)
    const normalized = path.normalize(filePath).replace(/^(\.\.[/\\])+/, "");
    const fullPath = path.join(UPLOADS_DIR, normalized);

    // Make sure the resolved path is still inside uploads dir
    if (!fullPath.startsWith(UPLOADS_DIR)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const fileBuffer = await readFile(fullPath);
    const ext = fullPath.split(".").pop().toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000", // cache for 1 year
      },
    });
  } catch {
    return NextResponse.json({ message: "File not found" }, { status: 404 });
  }
}