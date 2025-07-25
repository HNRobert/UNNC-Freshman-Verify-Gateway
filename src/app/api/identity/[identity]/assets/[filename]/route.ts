import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getIdentityPath } from "@/utils/userDataPath";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ identity: string; filename: string }> }
) {
  const params = await context.params;
  try {
    const identity = params.identity.toLowerCase();
    const filename = params.filename;
    const identityPath = getIdentityPath(identity);

    if (!identityPath) {
      return NextResponse.json(
        { error: "User data root not configured" },
        { status: 404 }
      );
    }

    const filePath = path.join(identityPath, filename);

    // Check if file exists and is within the identity directory
    if (!fs.existsSync(filePath) || !filePath.startsWith(identityPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
      case ".ico":
        contentType = "image/x-icon";
        break;
      case ".svg":
        contentType = "image/svg+xml";
        break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving asset:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
