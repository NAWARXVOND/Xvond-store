import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/urls";

export default function robots(): MetadataRoute.Robots {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [`${basePath}/ar/admin`, `${basePath}/en/admin`, `${basePath}/api`],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
