import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/bookings", "/owner", "/admin"] }],
    sitemap: "https://dooh-bice.vercel.app/sitemap.xml",
  }
}
