import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string }> }
) {
  const params = await context.params;
  try {
    const locale = params.locale;
    const localesDir = path.resolve(process.cwd(), "src/locales");

    // 尝试多种文件扩展名
    const possibleFiles = [`${locale}.yml`, `${locale}.yaml`];

    let localeFile = null;
    for (const fileName of possibleFiles) {
      const filePath = path.join(localesDir, fileName);
      if (fs.existsSync(filePath)) {
        localeFile = filePath;
        break;
      }
    }

    if (!localeFile) {
      return NextResponse.json(
        { error: "Locale file not found" },
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
    console.error(`Error loading locale ${params.locale}:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
