"use client";

import { useEffect } from "react";

export default function FaviconSetter({ url }: { url: string }) {
  useEffect(() => {
    if (!url) return;
    // Remove any existing favicons
    const existing = document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']");
    existing.forEach((el) => el.remove());
    // Add new favicon
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = url;
    if (url.endsWith(".png")) link.type = "image/png";
    else if (url.endsWith(".ico")) link.type = "image/x-icon";
    document.head.appendChild(link);
  }, [url]);
  return null;
}
