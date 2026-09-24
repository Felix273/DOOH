import type { MetadataRoute } from "next"

const baseUrl = "https://dooh-bice.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/product", "/network", "/pricing", "/case-studies", "/about", "/screens", "/register", "/login"]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/screens" ? "daily" : "weekly",
    priority: route === "/" ? 1 : route === "/screens" ? 0.9 : 0.7,
  }))
}
