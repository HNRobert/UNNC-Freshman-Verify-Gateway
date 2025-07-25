"use server";

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { getUserDataRoot, getIdentityPath } from "@/utils/userDataPath";
import { cache } from "./cache";
import { withPerformanceTracking } from "./performance";

// Types
export interface IdentityConfig {
  identity: string;
  groupName: string;
  groupNames?: Record<string, string>;
  title: string;
  description: string;
  warningText: string;
  unableToVerifyMessage: string;
  qrCodeUrl: string;
  faviconUrl: string;
  locales: Record<string, Record<string, unknown>>;
}

export interface IdentityListItem {
  identity: string;
  groupName: string;
  groupNames?: Record<string, string>;
  faviconUrl: string;
}

// Server action to get all available identities
export const getAvailableIdentities = withPerformanceTracking(
  "getAvailableIdentities",
  async (): Promise<IdentityListItem[]> => {
    const cacheKey = "available_identities";

    // Check cache first
    const cached = cache.get<IdentityListItem[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const userDataRoot = getUserDataRoot();

      if (!userDataRoot || !fs.existsSync(userDataRoot)) {
        return [];
      }

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

      // Get detailed config for each identity
      const identityConfigs: IdentityListItem[] = [];

      for (const identity of identities) {
        try {
          const config = await getIdentityConfig(identity);
          if (config) {
            identityConfigs.push({
              identity: config.identity,
              groupName: config.groupName,
              groupNames: config.groupNames,
              faviconUrl: config.faviconUrl,
            });
          }
        } catch (error) {
          console.error(`Failed to get config for ${identity}:`, error);
          // Fallback config
          identityConfigs.push({
            identity,
            groupName: identity.toUpperCase(),
            faviconUrl: "/favicon.ico",
          });
        }
      }

      // Cache the result for 5 minutes
      cache.set(cacheKey, identityConfigs, 5 * 60 * 1000);

      return identityConfigs;
    } catch (error) {
      console.error("Error reading identities:", error);
      return [];
    }
  }
);

// Server action to get identity configuration
export const getIdentityConfig = withPerformanceTracking(
  "getIdentityConfig",
  async (identity: string): Promise<IdentityConfig | null> => {
    const cacheKey = `identity_config_${identity.toLowerCase()}`;

    // Check cache first
    const cached = cache.get<IdentityConfig>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const normalizedIdentity = identity.toLowerCase();
      const userDataRoot = getUserDataRoot();

      if (!userDataRoot) {
        return null;
      }

      const identityPath = getIdentityPath(normalizedIdentity);

      if (!identityPath || !fs.existsSync(identityPath)) {
        return null;
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

      if (!hasLocales || !qrCodeFile || !faviconFile) {
        return null;
      }

      // Load locale files
      const localesPath = path.join(identityPath, "locales");
      const localeFiles = fs.readdirSync(localesPath);
      const locales: Record<string, Record<string, unknown>> = {};

      for (const localeFile of localeFiles) {
        if (localeFile.endsWith(".yml") || localeFile.endsWith(".yaml")) {
          const localeName = path.basename(
            localeFile,
            path.extname(localeFile)
          );
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
      const qrCodeUrl = `/api/identity/${normalizedIdentity}/assets/${qrCodeFile}`;
      const faviconUrl = `/api/identity/${normalizedIdentity}/assets/${faviconFile}`;

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

      const config: IdentityConfig = {
        identity: normalizedIdentity,
        groupName: verifyConfig.groupName || normalizedIdentity.toUpperCase(),
        groupNames,
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
        faviconUrl,
        locales,
      };

      // Cache the result for 10 minutes
      cache.set(cacheKey, config, 10 * 60 * 1000);

      return config;
    } catch (error) {
      console.error("Error loading identity config:", error);
      return null;
    }
  }
);

// Server action to get identity-specific locales list
export async function getIdentityLocales(identity: string): Promise<string[]> {
  const cacheKey = `identity_locales_${identity.toLowerCase()}`;

  // Check cache first
  const cached = cache.get<string[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const normalizedIdentity = identity.toLowerCase();
    const identityLocalesDir = path.resolve(
      process.cwd(),
      "user-data",
      normalizedIdentity,
      "locales"
    );

    if (!fs.existsSync(identityLocalesDir)) {
      return [];
    }

    const files = fs.readdirSync(identityLocalesDir);
    const locales = files
      .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
      .map((file) => path.basename(file, path.extname(file)))
      .sort();

    // Cache the result for 10 minutes
    cache.set(cacheKey, locales, 10 * 60 * 1000);

    return locales;
  } catch (error) {
    console.error(
      `Error reading identity locales directory for ${identity}:`,
      error
    );
    return [];
  }
}

// Server action to get specific locale translations for an identity
export async function getIdentityLocaleTranslations(
  identity: string,
  locale: string
): Promise<Record<string, unknown> | null> {
  const cacheKey = `identity_translation_${identity.toLowerCase()}_${locale}`;

  // Check cache first
  const cached = cache.get<Record<string, unknown>>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const normalizedIdentity = identity.toLowerCase();
    const localeFilePath = path.resolve(
      process.cwd(),
      "user-data",
      normalizedIdentity,
      "locales",
      `${locale}.yml`
    );

    if (!fs.existsSync(localeFilePath)) {
      return null;
    }

    const localeContent = fs.readFileSync(localeFilePath, "utf-8");
    const parsed = yaml.load(localeContent);

    if (parsed && typeof parsed === "object") {
      const translation = parsed as Record<string, unknown>;

      // Cache the result for 15 minutes
      cache.set(cacheKey, translation, 15 * 60 * 1000);

      return translation;
    }

    return null;
  } catch (error) {
    console.error(
      `Error reading locale file for ${identity}/${locale}:`,
      error
    );
    return null;
  }
}
