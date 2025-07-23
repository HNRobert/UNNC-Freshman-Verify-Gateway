"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, LanguageIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "./I18nProvider";

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n, mounted } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "zh-CN", name: "中文", englishName: "Chinese" },
    { code: "en-US", name: "English (US)", englishName: "English (US)" },
    { code: "en-UK", name: "English (UK)", englishName: "English (UK)" },
  ];

  // 在水合完成前，始终显示中文以避免不匹配
  const currentLocale = mounted ? i18n.language : "zh-CN";
  const currentLanguage = languages.find((lang) => lang.code === currentLocale);

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
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <LanguageIcon className="h-4 w-4" />
        <span>{currentLanguage?.name || "Language"}</span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  currentLocale === language.code
                    ? "bg-blue-50 text-blue-600"
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
