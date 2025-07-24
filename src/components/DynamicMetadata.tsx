"use client";

import { useEffect } from "react";
import { useTranslation } from "./I18nProvider";

export function DynamicMetadata() {
  const { t, mounted, i18n } = useTranslation();

  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;

    try {
      // 更新页面标题
      if (document.title !== undefined) {
        document.title = t("metadata.title");
      }

      // 更新或创建 meta description
      updateOrCreateMetaTag("name", "description", t("metadata.description"));

      // 更新 Open Graph 标签
      updateOrCreateMetaTag("property", "og:title", t("metadata.title"));
      updateOrCreateMetaTag(
        "property",
        "og:description",
        t("metadata.description")
      );
      updateOrCreateMetaTag("property", "og:type", "website");

      // 更新 Twitter Card 标签
      updateOrCreateMetaTag("name", "twitter:title", t("metadata.title"));
      updateOrCreateMetaTag(
        "name",
        "twitter:description",
        t("metadata.description")
      );
      updateOrCreateMetaTag("name", "twitter:card", "summary");

      // 更新 html lang 属性
      if (document.documentElement) {
        document.documentElement.lang = i18n.language;
      }
    } catch (error) {
      console.warn("Error updating metadata:", error);
    }
  }, [t, mounted, i18n.language]);

  return null; // 这个组件不渲染任何内容
}

// 辅助函数：更新或创建 meta 标签
function updateOrCreateMetaTag(
  attribute: string,
  value: string,
  content: string
) {
  if (typeof document === "undefined") return;

  try {
    const selector = `meta[${attribute}="${value}"]`;
    let metaTag = document.querySelector(selector) as HTMLMetaElement;

    if (metaTag) {
      // 更新现有的 meta 标签
      metaTag.setAttribute("content", content);
    } else {
      // 创建新的 meta 标签
      metaTag = document.createElement("meta");
      metaTag.setAttribute(attribute, value);
      metaTag.setAttribute("content", content);

      if (document.head) {
        document.head.appendChild(metaTag);
      }
    }
  } catch (error) {
    console.warn(`Error updating meta tag [${attribute}="${value}"]`, error);
  }
}
