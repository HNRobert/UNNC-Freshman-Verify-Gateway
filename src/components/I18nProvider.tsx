"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import parseYaml from "../plugins/yaml";

// 动态导入 YAML 文件内容
import zhCNContent from "../locales/zh-CN.yml";
import enUSContent from "../locales/en-US.yml";
import enUKContent from "../locales/en-UK.yml";

// 解析 YAML 内容
const zhCN = parseYaml(zhCNContent);
const enUS = parseYaml(enUSContent);
const enUK = parseYaml(enUKContent);

type Locale = "zh-CN" | "en-US" | "en-UK";
type TranslationKey = string;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
  mounted: boolean;
  loadIdentityTranslations: (
    translations: Record<string, Record<string, unknown>>
  ) => void;
  clearIdentityTranslations: () => void;
}

const defaultTranslations = {
  "zh-CN": zhCN,
  "en-US": enUS,
  "en-UK": enUK,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh-CN");
  const [mounted, setMounted] = useState(false);
  // Use ref to avoid re-renders when translations change
  const identityTranslationsRef = useRef<Record<
    string,
    Record<string, unknown>
  > | null>(null);
  const [translationVersion, setTranslationVersion] = useState(0);

  useEffect(() => {
    // 标记组件已挂载
    setMounted(true);

    // 获取用户首选语言
    const savedLocale = localStorage.getItem("locale");
    if (savedLocale && ["zh-CN", "en-US", "en-UK"].includes(savedLocale)) {
      setLocaleState(savedLocale as Locale);
    }
  }, []);

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
    (translations: Record<string, Record<string, unknown>>) => {
      identityTranslationsRef.current = translations;
      setTranslationVersion((v) => v + 1); // Force re-render of translations
    },
    []
  );

  const clearIdentityTranslations = useCallback(() => {
    identityTranslationsRef.current = null;
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
        // console.warn(
        //   `Translation key "${key}" not found for locale "${locale}"`
        // );
        return "";
      }

      if (params) {
        return value.replace(/\{(\w+)\}/g, (match: string, param: string) => {
          return params[param] || match;
        });
      }

      return value;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, translationVersion] // translationVersion ensures callback updates when translations change
  );

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        mounted,
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
      changeLanguage: (locale: string) => context.setLocale(locale as Locale),
    },
    mounted: context.mounted,
    loadIdentityTranslations: context.loadIdentityTranslations,
    clearIdentityTranslations: context.clearIdentityTranslations,
  };
}

export { type Locale };
export const SUPPORT_LOCALES: Locale[] = ["zh-CN", "en-US", "en-UK"];

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
