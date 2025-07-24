"use client";

import { useEffect, useRef } from "react";
import { useParams, usePathname } from "next/navigation";

export default function DynamicFavicon() {
  const params = useParams();
  const pathname = usePathname();
  const currentFaviconRef = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Check if we're on an identity page
    const identity = params?.identity as string;
    let newHref = "/favicon.ico"; // default

    if (identity && typeof identity === "string") {
      newHref = `/api/identity/${identity.toLowerCase()}/favicon`;
    }

    // 安全地更新 favicon
    updateFavicon(newHref);

    // Cleanup function
    return () => {
      // 组件卸载时不强制移除 favicon，让浏览器自然处理
      // 这样可以避免与 React 的 DOM 管理冲突
      currentFaviconRef.current = null;
    };
  }, [params, pathname]);

  const updateFavicon = (href: string) => {
    if (typeof document === "undefined") return;

    try {
      // 更安全的方法：不移除现有的 favicon，而是更新现有的或添加新的
      let faviconLink = document.querySelector(
        'link[rel="icon"]'
      ) as HTMLLinkElement;

      if (faviconLink) {
        // 更新现有的 favicon
        faviconLink.href = href;
        currentFaviconRef.current = faviconLink;
      } else {
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
