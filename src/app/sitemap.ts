import type { MetadataRoute } from "next";
import { fetchAllSpotSlugs, fetchAllRouteSlugs } from "@/lib/api";
import { CITIES } from "@/constants/cities";
import { THEMES } from "@/constants/themes";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.kr";

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/feed`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  const cityPages: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${siteUrl}/city/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const themePages: MetadataRoute.Sitemap = THEMES.map((theme) => ({
    url: `${siteUrl}/theme/${theme.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const [spotSlugs, routeSlugs] = await Promise.all([
    fetchAllSpotSlugs(),
    fetchAllRouteSlugs(),
  ]);

  const spotPages: MetadataRoute.Sitemap = spotSlugs.map((entry) => ({
    url: `${siteUrl}/spot/${entry.slug}`,
    lastModified: new Date(entry.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const routePages: MetadataRoute.Sitemap = routeSlugs.map((entry) => ({
    url: `${siteUrl}/route/${entry.slug}`,
    lastModified: new Date(entry.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...cityPages, ...themePages, ...spotPages, ...routePages];
}
