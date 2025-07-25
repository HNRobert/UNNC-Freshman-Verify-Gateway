import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ identity: string; locale: string }> }
) {
  const params = await context.params;
  try {
    const identity = params.identity.toLowerCase();
    const locale = params.locale;

    const identityLocalesDir = path.resolve(
      process.cwd(),
      "user-data",
      identity,
      "locales"
    );

    // 尝试多种文件扩展名
    const possibleFiles = [`${locale}.yml`, `${locale}.yaml`];

    let localeFile = null;
    for (const fileName of possibleFiles) {
      const filePath = path.join(identityLocalesDir, fileName);
      if (fs.existsSync(filePath)) {
        localeFile = filePath;
        break;
      }
    }

    if (!localeFile) {
      return NextResponse.json(
        { error: "Identity locale file not found" },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(localeFile, "utf-8");
    const parsed = yaml.load(fileContent);

    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json(
        { error: "Invalid YAML format" },
        { status: 400 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(
      `Error loading identity locale ${params.identity}/${params.locale}:`,
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
