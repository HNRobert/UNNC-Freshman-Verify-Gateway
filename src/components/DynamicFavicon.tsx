"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, usePathname } from "next/navigation";

export default function DynamicFavicon() {
  const params = useParams();
  const pathname = usePathname();
  const currentFaviconRef = useRef<HTMLLinkElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 确保在组件挂载时立即设置一个默认 favicon
    if (typeof document !== "undefined") {
      const existingFavicon = document.querySelector(
        'link[rel="icon"], link[rel="shortcut icon"]'
      );
      if (!existingFavicon) {
        const defaultLink = document.createElement("link");
        defaultLink.rel = "icon";
        defaultLink.type = "image/x-icon";
        defaultLink.href = "/favicon.ico";
        document.head.appendChild(defaultLink);
        currentFaviconRef.current = defaultLink;
      }
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || !mounted) return;

    // 从 pathname 直接解析 identity，作为 params 的备选方案
    let identity: string | null = null;

    // 首先尝试从 params 获取
    if (params?.identity && typeof params.identity === "string") {
      identity = params.identity;
    } else {
      // 如果 params 为空，从 pathname 解析
      const pathMatch = pathname.match(/^\/([^\/]+)(?:\/|$)/);
      if (
        pathMatch &&
        pathMatch[1] &&
        pathMatch[1] !== "" &&
        pathMatch[1] !== "api"
      ) {
        identity = pathMatch[1];
      }
    }

    let newHref = "/favicon.ico"; // default

    // 确保我们在正确的路径上设置 identity favicon
    if (
      identity &&
      identity !== "" &&
      identity !== "favicon.ico" &&
      !pathname.startsWith("/api")
    ) {
      newHref = `/api/identity/${identity.toLowerCase()}/favicon`;
    } else if (pathname === "/" || pathname === "") {
      newHref = "/favicon.ico";
    }

    // 安全地更新 favicon
    updateFavicon(newHref);

    // Cleanup function
    return () => {
      // 组件卸载时不强制移除 favicon，让浏览器自然处理
      // 这样可以避免与 React 的 DOM 管理冲突
      currentFaviconRef.current = null;
    };
  }, [params, pathname, mounted]);

  const updateFavicon = (href: string) => {
    if (typeof document === "undefined") return;

    try {
      // 查找现有的 favicon 链接
      let faviconLink = document.querySelector(
        'link[rel="icon"], link[rel="shortcut icon"]'
      ) as HTMLLinkElement;

      if (faviconLink && faviconLink.href !== href) {
        // 更新现有的 favicon
        faviconLink.href = href;
        currentFaviconRef.current = faviconLink;
      } else if (!faviconLink) {
        // 没有找到现有的 favicon，创建新的
        const link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/x-icon";
        link.href = href;

        if (document.head) {
          document.head.appendChild(link);
          currentFaviconRef.current = link;
        }
      }
    } catch (error) {
      console.warn("Error updating favicon:", error);
    }
  };

  return null; // This component doesn't render anything
}
