import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { getUserDataRoot, getIdentityPath } from "@/utils/userDataPath";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ identity: string }> }
) {
  const params = await context.params;
  try {
    const identity = params.identity.toLowerCase();
    const userDataRoot = getUserDataRoot();

    if (!userDataRoot) {
      return NextResponse.json(
        { error: "User data root not configured" },
        { status: 404 }
      );
    }

    const identityPath = getIdentityPath(identity);

    if (!identityPath) {
      return NextResponse.json(
        { error: "Identity path not available" },
        { status: 404 }
      );
    }

    // Check if identity directory exists
    if (!fs.existsSync(identityPath)) {
      return NextResponse.json(
        { error: "Identity not found" },
        { status: 404 }
      );
    }

    // Check for required files
    const files = fs.readdirSync(identityPath);
    const hasLocales = fs.existsSync(path.join(identityPath, "locales"));
    const qrCodeFile = files.find((file) =>
      file.toLowerCase().includes("qrcode")
    );
    const faviconFile = files.find((file) =>
      file.toLowerCase().includes("favicon")
    );

    // Only require locales and QR code, favicon is optional
    if (!hasLocales || !qrCodeFile) {
      return NextResponse.json(
        { error: "Identity missing required files" },
        { status: 404 }
      );
    }

    // Load locale files
    const localesPath = path.join(identityPath, "locales");
    const localeFiles = fs.readdirSync(localesPath);
    const locales: Record<string, Record<string, unknown>> = {};

    for (const localeFile of localeFiles) {
      if (localeFile.endsWith(".yml") || localeFile.endsWith(".yaml")) {
        const localeName = path.basename(localeFile, path.extname(localeFile));
        const localeContent = fs.readFileSync(
          path.join(localesPath, localeFile),
          "utf-8"
        );
        try {
          const parsed = yaml.load(localeContent);
          if (parsed && typeof parsed === "object") {
            locales[localeName] = parsed as Record<string, unknown>;
          }
        } catch (error) {
          console.error(`Error parsing locale file ${localeFile}:`, error);
        }
      }
    }

    // Construct URLs for assets
    const qrCodeUrl = `/api/identity/${identity}/assets/${qrCodeFile}`;
    const faviconUrl = faviconFile
      ? `/api/identity/${identity}/assets/${faviconFile}`
      : undefined; // Use undefined if no favicon file found

    // Extract basic config from default locale (zh-CN or first available)
    const defaultLocale = (locales["zh-CN"] ||
      locales[Object.keys(locales)[0]] ||
      {}) as Record<string, Record<string, string>>;
    const verifyConfig = defaultLocale.verify || {};

    // Extract groupNames from all available locales
    const groupNames: Record<string, string> = {};
    Object.keys(locales).forEach((locale) => {
      const localeData = locales[locale] as Record<
        string,
        Record<string, string>
      >;
      const localeVerifyConfig = localeData.verify || {};
      if (localeVerifyConfig.groupName) {
        groupNames[locale] = localeVerifyConfig.groupName;
      }
    });

    const config = {
      identity,
      groupName: verifyConfig.groupName || identity.toUpperCase(),
      groupNames, // 添加所有语言的组名
      title: verifyConfig.title || "Identity Verification",
      description:
        verifyConfig.description ||
        "Please verify your identity to access the group QR code.",
      warningText:
        verifyConfig.warningText ||
        "This verification is required to prevent spam.",
      unableToVerifyMessage:
        verifyConfig.unableToVerifyMessage ||
        "If you cannot verify, please contact us.",
      qrCodeUrl,
      ...(faviconUrl && { faviconUrl }), // Only include faviconUrl if it exists
      locales,
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error loading identity config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
