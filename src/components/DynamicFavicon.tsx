"use client";

import { useEffect } from "react";
import { useParams, usePathname } from "next/navigation";

export default function DynamicFavicon() {
  const params = useParams();
  const pathname = usePathname();

  useEffect(() => {
    // Check if we're on an identity page
    const identity = params?.identity as string;

    if (identity && typeof identity === "string") {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll('link[rel*="icon"]');
      existingLinks.forEach((link) => link.remove());

      // Add new favicon link for the identity
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/x-icon";
      link.href = `/api/identity/${identity.toLowerCase()}/favicon`;
      document.head.appendChild(link);
    } else if (pathname === "/") {
      // On homepage, use default favicon
      const existingLinks = document.querySelectorAll('link[rel*="icon"]');
      existingLinks.forEach((link) => link.remove());

      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/x-icon";
      link.href = "/favicon.ico";
      document.head.appendChild(link);
    }
  }, [params, pathname]);

  return null; // This component doesn't render anything
}
