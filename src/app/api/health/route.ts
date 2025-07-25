import { NextResponse } from "next/server";
import fs from "fs";
import { getUserDataRoot } from "@/utils/userDataPath";

export async function GET() {
  const userDataRoot = getUserDataRoot();
  let userDataStatus = "not_configured";
  let userDataContents: string[] = [];

  if (userDataRoot) {
    if (fs.existsSync(userDataRoot)) {
      userDataStatus = "exists";
      try {
        userDataContents = fs
          .readdirSync(userDataRoot, { withFileTypes: true })
          .map((entry) => `${entry.name}${entry.isDirectory() ? "/" : ""}`);
      } catch {
        userDataStatus = "read_error";
      }
    } else {
      userDataStatus = "not_found";
    }
  }

  return NextResponse.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      UNNC_VERIFY_USER_DATA_ROOT: process.env.UNNC_VERIFY_USER_DATA_ROOT,
      resolvedUserDataRoot: userDataRoot,
      userDataStatus,
      userDataContents,
      workingDirectory: process.cwd(),
    },
  });
}
