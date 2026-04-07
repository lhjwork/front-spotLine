import type { BlogDetailResponse } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.kr";

export function generateBlogJsonLd(blog: BlogDetailResponse): Record<string, unknown> {
  const url = `${SITE_URL}/blog/${blog.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.summary || `${blog.title} - Spotline 블로그`,
    url,
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt,
    author: {
      "@type": "Person",
      name: blog.userName,
      ...(blog.userAvatarUrl ? { image: blog.userAvatarUrl } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: "Spotline",
      url: SITE_URL,
    },
    ...(blog.coverImageUrl
      ? { image: { "@type": "ImageObject", url: blog.coverImageUrl } }
      : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}
