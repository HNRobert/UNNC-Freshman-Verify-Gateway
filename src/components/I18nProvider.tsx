"use client";

import { createContext, useContext, useState, useEffect } from "react";
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
}

const translations = {
  "zh-CN": zhCN,
  "en-US": enUS,
  "en-UK": enUK,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh-CN");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 标记组件已挂载
    setMounted(true);

    // 获取用户首选语言
    const savedLocale = localStorage.getItem("locale");
    if (savedLocale && ["zh-CN", "en-US", "en-UK"].includes(savedLocale)) {
      setLocaleState(savedLocale as Locale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    const keys = key.split(".");
    let value: unknown = translations[locale];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        value = undefined;
        break;
      }
    }

    if (typeof value !== "string") {
      console.warn(`Translation key "${key}" not found for locale "${locale}"`);
      return key;
    }

    if (params) {
      return value.replace(/\{(\w+)\}/g, (match: string, param: string) => {
        return params[param] || match;
      });
    }

    return value;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, mounted }}>
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
    document.documentElement.lang = locale;
    // 不再使用 reload，而是建议使用 Context 中的 changeLanguage
    console.warn(
      "建议在组件中使用 useTranslation().i18n.changeLanguage() 而不是 setLocale()"
    );
  }
};
