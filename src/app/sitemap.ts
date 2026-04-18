import type { MetadataRoute } from "next";
import { fetchAllSpotSlugs, fetchAllSpotLineSlugs, fetchBlogSlugs } from "@/lib/api";
import { CITIES } from "@/constants/cities";
import { THEMES } from "@/constants/themes";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.kr";

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/feed`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/explore`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${siteUrl}/blogs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
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

  const [spotSlugs, spotLineSlugs, blogSlugs] = await Promise.all([
    fetchAllSpotSlugs().catch(() => []),
    fetchAllSpotLineSlugs().catch(() => []),
    fetchBlogSlugs().catch(() => []),
  ]);

  const spotPages: MetadataRoute.Sitemap = spotSlugs.map((entry) => ({
    url: `${siteUrl}/spot/${entry.slug}`,
    lastModified: new Date(entry.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const spotLinePages: MetadataRoute.Sitemap = spotLineSlugs.map((entry) => ({
    url: `${siteUrl}/spotline/${entry.slug}`,
    lastModified: new Date(entry.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${siteUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...cityPages, ...themePages, ...spotPages, ...spotLinePages, ...blogPages];
}
