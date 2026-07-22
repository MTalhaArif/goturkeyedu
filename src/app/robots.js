import { SITE_URL } from "@/lib/siteConfig";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/agency", "/subagency", "/dashboard", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
