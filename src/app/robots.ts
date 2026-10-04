// /robots.txt: что поисковикам индексировать не нужно.
import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/cart", "/checkout", "/search"],
    },
    sitemap: absUrl("/sitemap.xml"),
    host: absUrl("/"),
  };
}
