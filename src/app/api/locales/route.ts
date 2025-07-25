import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // 获取 src/locales 目录中的所有 .yml 文件
    const localesDir = path.resolve(process.cwd(), "src/locales");

    if (!fs.existsSync(localesDir)) {
      return NextResponse.json(["zh-CN"], { status: 200 });
    }

    const files = fs.readdirSync(localesDir);
    const locales = files
      .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
      .map((file) => path.basename(file, path.extname(file)))
      .sort();

    // 如果没有找到任何语言文件，返回默认的中文
    if (locales.length === 0) {
      return NextResponse.json(["zh-CN"], { status: 200 });
    }

    return NextResponse.json(locales);
  } catch (error) {
    console.error("Error reading locales directory:", error);
    return NextResponse.json(["zh-CN"], { status: 200 });
  }
}
