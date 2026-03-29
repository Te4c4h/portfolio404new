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
    sitemap: `${process.env.NEXTAUTH_URL || "https://portfolio404.site"}/sitemap.xml`,
  };
}
