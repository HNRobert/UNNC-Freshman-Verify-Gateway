import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getUserDataRoot } from "@/utils/userDataPath";

export async function GET() {
  try {
    const userDataRoot = getUserDataRoot();

    if (!userDataRoot) {
      return NextResponse.json([], { status: 200 });
    }

    // Check if the user data directory exists
    if (!fs.existsSync(userDataRoot)) {
      return NextResponse.json([], { status: 200 });
    }

    // Read all directories in the user data root
    const entries = fs.readdirSync(userDataRoot, { withFileTypes: true });
    const identities = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((identity) => {
        // Check if the identity directory has the required structure
        const identityPath = path.join(userDataRoot, identity);
        const hasLocales = fs.existsSync(path.join(identityPath, "locales"));
        const hasQrCode = fs
          .readdirSync(identityPath)
          .some((file) => file.toLowerCase().includes("qrcode"));
        const hasFavicon = fs
          .readdirSync(identityPath)
          .some((file) => file.toLowerCase().includes("favicon"));

        return hasLocales && hasQrCode && hasFavicon;
      });

    return NextResponse.json(identities);
  } catch (error) {
    console.error("Error reading identities:", error);
    return NextResponse.json([], { status: 500 });
  }
}
