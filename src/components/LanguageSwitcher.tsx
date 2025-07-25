"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, LanguageIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "./I18nProvider";

// 语言显示名称映射
const LANGUAGE_NAMES: Record<string, { name: string; englishName: string }> = {
  "zh-CN": { name: "中文", englishName: "Chinese (Simplified)" },
  "zh-TW": { name: "繁體中文", englishName: "Chinese (Traditional)" },
  "en-US": { name: "English (US)", englishName: "English (US)" },
  "en-UK": { name: "English (UK)", englishName: "English (UK)" },
  "en-GB": { name: "English (GB)", englishName: "English (GB)" },
  "ja-JP": { name: "日本語", englishName: "Japanese" },
  "ko-KR": { name: "한국어", englishName: "Korean" },
  "fr-FR": { name: "Français", englishName: "French" },
  "de-DE": { name: "Deutsch", englishName: "German" },
  "es-ES": { name: "Español", englishName: "Spanish" },
  "pt-PT": { name: "Português", englishName: "Portuguese" },
  "ru-RU": { name: "Русский", englishName: "Russian" },
  "ar-SA": { name: "العربية", englishName: "Arabic" },
  "hi-IN": { name: "हिन्दी", englishName: "Hindi" },
  "th-TH": { name: "ไทย", englishName: "Thai" },
  "vi-VN": { name: "Tiếng Việt", englishName: "Vietnamese" },
  "ms-MY": { name: "Bahasa Melayu", englishName: "Malay" },
  "id-ID": { name: "Bahasa Indonesia", englishName: "Indonesian" },
};

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n, mounted, availableLocales } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 生成语言选项
  const languages = availableLocales.map((code) => ({
    code,
    name: LANGUAGE_NAMES[code]?.name || code,
    englishName: LANGUAGE_NAMES[code]?.englishName || code,
  }));

  // 在水合完成前，始终显示中文以避免不匹配
  const currentLocale = mounted ? i18n.language : "zh-CN";
  const currentLanguage = languages.find(
    (lang) => lang.code === currentLocale
  ) || {
    code: currentLocale,
    name: LANGUAGE_NAMES[currentLocale]?.name || currentLocale,
    englishName: LANGUAGE_NAMES[currentLocale]?.englishName || currentLocale,
  };

  // 处理点击外部区域关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    // 只在下拉菜单打开时添加事件监听器
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    // 清理函数
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  const handleLanguageChange = (locale: string) => {
    i18n.changeLanguage(locale);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200"
      >
        <LanguageIcon className="h-4 w-4" />
        <span>{currentLanguage?.name || "Language"}</span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 hover-lift">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-all duration-200 ${
                  currentLocale === language.code
                    ? "bg-yellow-50 text-yellow-600 font-medium"
                    : "text-gray-700"
                }`}
              >
                {language.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
