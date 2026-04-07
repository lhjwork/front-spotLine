import type { Metadata } from "next";
import { fetchBlogs } from "@/lib/api";
import BlogsPageClient from "./BlogsPageClient";

export const metadata: Metadata = {
  title: "블로그 | Spotline",
  description: "Spotline 크루와 유저들의 경험 블로그를 만나보세요. 지역별 맛집, 카페, 문화 공간 이야기.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.kr"}/blogs`,
  },
  openGraph: {
    title: "블로그 | Spotline",
    description: "Spotline 크루와 유저들의 경험 블로그를 만나보세요.",
    type: "website",
  },
};

export const revalidate = 3600;

export default async function BlogsPage() {
  let initialBlogs;
  try {
    initialBlogs = await fetchBlogs(0, 20);
  } catch {
    initialBlogs = { content: [], last: true };
  }

  return <BlogsPageClient initialBlogs={initialBlogs.content} initialHasMore={!initialBlogs.last} />;
}
