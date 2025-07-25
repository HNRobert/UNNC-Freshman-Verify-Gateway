"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

type Locale = string; // 改为字符串类型以支持动态语言
type TranslationKey = string;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
  mounted: boolean;
  translationsLoaded: boolean;
  availableLocales: string[];
  loadIdentityTranslations: (
    translations: Record<string, Record<string, unknown>>,
    identityLocales?: string[]
  ) => void;
  clearIdentityTranslations: () => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh-CN");
  const [mounted, setMounted] = useState(false);
  const [availableLocales, setAvailableLocales] = useState<string[]>([]);
  const [defaultTranslations, setDefaultTranslations] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const [translationsLoaded, setTranslationsLoaded] = useState(false);
  // Use ref to avoid re-renders when translations change
  const identityTranslationsRef = useRef<Record<
    string,
    Record<string, unknown>
  > | null>(null);
  const [translationVersion, setTranslationVersion] = useState(0);
  // Store identity-specific available locales
  const [identityAvailableLocales, setIdentityAvailableLocales] = useState<
    string[] | null
  >(null);

  // 动态加载语言包
  const loadAvailableLocales = useCallback(async () => {
    try {
      // 获取可用的语言包
      const response = await fetch("/api/locales");
      if (response.ok) {
        const locales = await response.json();
        setAvailableLocales(locales);

        // 加载所有语言包的翻译
        const translations: Record<string, Record<string, unknown>> = {};
        await Promise.all(
          locales.map(async (locale: string) => {
            try {
              const localeResponse = await fetch(`/api/locales/${locale}`);
              if (localeResponse.ok) {
                const translation = await localeResponse.json();
                translations[locale] = translation;
              }
            } catch (error) {
              console.error(`Failed to load locale ${locale}:`, error);
            }
          })
        );

        setDefaultTranslations(translations);
        setTranslationsLoaded(true); // 标记翻译已加载
      }
    } catch (error) {
      console.error("Failed to load available locales:", error);
      // 回退到默认设置
      setAvailableLocales(["zh-CN", "en-US", "en-UK"]);
      setTranslationsLoaded(true); // 即使失败也标记为已加载，避免无限等待
    }
  }, []);

  useEffect(() => {
    // 标记组件已挂载
    setMounted(true);

    // 加载可用语言
    loadAvailableLocales();

    // 获取用户首选语言
    const savedLocale = localStorage.getItem("locale");
    if (savedLocale) {
      setLocaleState(savedLocale);
    }
  }, [loadAvailableLocales]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale);
      if (document.documentElement) {
        document.documentElement.lang = newLocale;
      }
    }
  }, []);

  // Stable functions that don't change on re-renders
  const loadIdentityTranslations = useCallback(
    (
      translations: Record<string, Record<string, unknown>>,
      identityLocales?: string[]
    ) => {
      identityTranslationsRef.current = translations;
      if (identityLocales) {
        setIdentityAvailableLocales(identityLocales);

        const currentLocale = locale;
        const availableLanguages = identityLocales;

        // 检查当前语言是否在身份支持的语言列表中
        if (!availableLanguages.includes(currentLocale)) {
          // 当前语言不支持，需要选择合适的语言
          // 优先选择中文
          let selectedLanguage: string;
          if (availableLanguages.includes("zh-CN")) {
            selectedLanguage = "zh-CN";
          } else if (availableLanguages.includes("en-US")) {
            selectedLanguage = "en-US";
          } else if (availableLanguages.includes("en-UK")) {
            selectedLanguage = "en-UK";
          } else {
            selectedLanguage = availableLanguages[0];
          }

          setLocale(selectedLanguage);
        }
      }
      setTranslationVersion((v) => v + 1); // Force re-render of translations
    },
    [locale, setLocale]
  );

  const clearIdentityTranslations = useCallback(() => {
    identityTranslationsRef.current = null;
    setIdentityAvailableLocales(null);
    setTranslationVersion((v) => v + 1); // Force re-render of translations
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string>): string => {
      const keys = key.split(".");
      // Use current translations (identity-specific or default)
      const currentTranslations =
        identityTranslationsRef.current || defaultTranslations;
      let value: unknown = currentTranslations[locale];

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          value = undefined;
          break;
        }
      }

      if (typeof value !== "string") {
        // 如果当前语言没找到，尝试回退到中文
        if (locale !== "zh-CN" && currentTranslations["zh-CN"]) {
          let fallbackValue: unknown = currentTranslations["zh-CN"];
          for (const k of keys) {
            if (
              fallbackValue &&
              typeof fallbackValue === "object" &&
              k in fallbackValue
            ) {
              fallbackValue = (fallbackValue as Record<string, unknown>)[k];
            } else {
              fallbackValue = undefined;
              break;
            }
          }
          if (typeof fallbackValue === "string") {
            value = fallbackValue;
          }
        }

        // 如果还是没找到，尝试英文作为最后的回退
        if (
          typeof value !== "string" &&
          locale !== "en-US" &&
          currentTranslations["en-US"]
        ) {
          let fallbackValue: unknown = currentTranslations["en-US"];
          for (const k of keys) {
            if (
              fallbackValue &&
              typeof fallbackValue === "object" &&
              k in fallbackValue
            ) {
              fallbackValue = (fallbackValue as Record<string, unknown>)[k];
            } else {
              fallbackValue = undefined;
              break;
            }
          }
          if (typeof fallbackValue === "string") {
            value = fallbackValue;
          }
        }

        // 如果所有回退都失败，返回键名作为最后的备用显示
        if (typeof value !== "string") {
          return "";
        }
      }

      // Enhanced interpolation function
      let result = value;

      // Handle simple parameter replacements
      if (params) {
        result = result.replace(
          /\{(\w+)\}/g,
          (match: string, param: string) => {
            return params[param] || match;
          }
        );
      }

      // Handle field references like {{verify.groupName}}
      result = result.replace(
        /\{\{([^}]+)\}\}/g,
        (match: string, fieldPath: string) => {
          const fieldKeys = fieldPath.split(".");
          let fieldValue: unknown = currentTranslations[locale];

          for (const fieldKey of fieldKeys) {
            if (
              fieldValue &&
              typeof fieldValue === "object" &&
              fieldKey in fieldValue
            ) {
              fieldValue = (fieldValue as Record<string, unknown>)[fieldKey];
            } else {
              fieldValue = undefined;
              break;
            }
          }

          return typeof fieldValue === "string" ? fieldValue : match;
        }
      );

      return result;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, translationVersion, defaultTranslations] // 添加 defaultTranslations 以确保翻译加载后触发更新
  );

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        mounted,
        translationsLoaded,
        availableLocales: identityAvailableLocales || availableLocales,
        loadIdentityTranslations,
        clearIdentityTranslations,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return {
    t: context.t,
    i18n: {
      language: context.locale,
      changeLanguage: (locale: string) => context.setLocale(locale),
    },
    mounted: context.mounted,
    translationsLoaded: context.translationsLoaded,
    availableLocales: context.availableLocales,
    loadIdentityTranslations: context.loadIdentityTranslations,
    clearIdentityTranslations: context.clearIdentityTranslations,
  };
}

export { type Locale };

// 简单的工具函数，仅用于静态获取，不建议在组件中使用
export const getLocale = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("locale") || "zh-CN";
  }
  return "zh-CN";
};

// 简单的工具函数，仅用于静态设置，不建议在组件中使用
export const setLocale = (locale: Locale) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("locale", locale);
    if (document.documentElement) {
      document.documentElement.lang = locale;
    }
  }
};
