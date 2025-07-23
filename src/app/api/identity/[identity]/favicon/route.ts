import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getIdentityPath } from "@/utils/userDataPath";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ identity: string }> }
) {
  const params = await context.params;
  try {
    const identity = params.identity.toLowerCase();
    const identityPath = getIdentityPath(identity);

    if (!identityPath) {
      // Fallback to default favicon
      const defaultFaviconPath = path.join(
        process.cwd(),
        "public",
        "favicon.ico"
      );
      if (fs.existsSync(defaultFaviconPath)) {
        const fileBuffer = fs.readFileSync(defaultFaviconPath);
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": "image/x-icon",
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
      return NextResponse.json({ error: "Favicon not found" }, { status: 404 });
    }

    // Try to find favicon for the specific identity
    if (!fs.existsSync(identityPath)) {
      return NextResponse.json(
        { error: "Identity not found" },
        { status: 404 }
      );
    }

    const files = fs.readdirSync(identityPath);
    const faviconFile = files.find((file) =>
      file.toLowerCase().includes("favicon")
    );

    if (!faviconFile) {
      return NextResponse.json(
        { error: "Favicon not found for identity" },
        { status: 404 }
      );
    }

    const faviconPath = path.join(identityPath, faviconFile);
    const fileBuffer = fs.readFileSync(faviconPath);

    // Determine content type based on file extension
    const ext = path.extname(faviconFile).toLowerCase();
    let contentType = "image/x-icon";

    switch (ext) {
      case ".png":
        contentType = "image/png";
        break;
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".svg":
        contentType = "image/svg+xml";
        break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error serving favicon:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
