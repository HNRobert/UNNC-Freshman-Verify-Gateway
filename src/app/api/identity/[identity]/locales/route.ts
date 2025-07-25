import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ identity: string }> }
) {
  const params = await context.params;
  try {
    const identity = params.identity.toLowerCase();

    // 获取 user-data/{identity}/locales 目录中的所有 .yml 文件
    const identityLocalesDir = path.resolve(
      process.cwd(),
      "user-data",
      identity,
      "locales"
    );

    if (!fs.existsSync(identityLocalesDir)) {
      // 如果 identity 的 locales 目录不存在，返回空数组
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(identityLocalesDir);
    const locales = files
      .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
      .map((file) => path.basename(file, path.extname(file)))
      .sort();

    return NextResponse.json(locales);
  } catch (error) {
    console.error(
      `Error reading identity locales directory for ${params.identity}:`,
      error
    );
    return NextResponse.json([]);
  }
}
