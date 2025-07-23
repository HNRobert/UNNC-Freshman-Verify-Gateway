"use client";

import { useEffect } from "react";
import { useTranslation } from "./I18nProvider";

export function DynamicMetadata() {
  const { t, mounted, i18n } = useTranslation();

  useEffect(() => {
    if (!mounted) return;

    // 更新页面标题
    document.title = t("metadata.title");

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
    document.documentElement.lang = i18n.language;
  }, [t, mounted, i18n.language]);

  return null; // 这个组件不渲染任何内容
}

// 辅助函数：更新或创建 meta 标签
function updateOrCreateMetaTag(
  attribute: string,
  value: string,
  content: string
) {
  const selector = `meta[${attribute}="${value}"]`;
  let metaTag = document.querySelector(selector);

  if (metaTag) {
    metaTag.setAttribute("content", content);
  } else {
    metaTag = document.createElement("meta");
    metaTag.setAttribute(attribute, value);
    metaTag.setAttribute("content", content);
    document.head.appendChild(metaTag);
  }
}
