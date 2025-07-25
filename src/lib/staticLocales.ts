import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// Static locale loading functions that can be used at build time
export function getStaticAvailableLocales(): string[] {
  try {
    const localesDir = path.resolve(process.cwd(), "src/locales");
    
    if (!fs.existsSync(localesDir)) {
      return ["zh-CN"];
    }

    const files = fs.readdirSync(localesDir);
    const locales = files
      .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
      .map((file) => path.basename(file, path.extname(file)))
      .sort();

    return locales.length > 0 ? locales : ["zh-CN"];
  } catch (error) {
    console.error("Error reading static locales directory:", error);
    return ["zh-CN"];
  }
}

export function getStaticLocaleTranslations(): Record<string, Record<string, unknown>> {
  try {
    const locales = getStaticAvailableLocales();
    const translations: Record<string, Record<string, unknown>> = {};
    
    for (const locale of locales) {
      try {
        const localeFilePath = path.resolve(process.cwd(), "src/locales", `${locale}.yml`);
        
        if (fs.existsSync(localeFilePath)) {
          const localeContent = fs.readFileSync(localeFilePath, "utf-8");
          const parsed = yaml.load(localeContent);
          
          if (parsed && typeof parsed === "object") {
            translations[locale] = parsed as Record<string, unknown>;
          }
        }
      } catch (error) {
        console.error(`Error loading static locale ${locale}:`, error);
      }
    }
    
    return translations;
  } catch (error) {
    console.error("Error loading static locale translations:", error);
    return {};
  }
}
