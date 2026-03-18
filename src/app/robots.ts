import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/login", "/register", "/forgot-password"],
      },
    ],
    sitemap: "https://www.portfolio404.site/sitemap.xml",
  };
}
