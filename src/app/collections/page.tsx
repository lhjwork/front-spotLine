import type { Metadata } from "next";
import { fetchCollections } from "@/lib/api";
import CollectionsPageClient from "./CollectionsPageClient";

export const metadata: Metadata = {
  title: "큐레이션 컬렉션 | Spotline",
  description: "Spotline 크루가 엄선한 테마별 컬렉션을 만나보세요. 데이트, 맛집 투어, 산책 코스 등.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.kr"}/collections`,
  },
  openGraph: {
    title: "큐레이션 컬렉션 | Spotline",
    description: "Spotline 크루가 엄선한 테마별 컬렉션을 만나보세요.",
    type: "website",
  },
};

export const revalidate = 3600;

export default async function CollectionsPage() {
  let initialData;
  try {
    initialData = await fetchCollections({ page: 0, size: 12 });
  } catch {
    initialData = { content: [], last: true, totalElements: 0, totalPages: 0, number: 0, size: 12 };
  }

  return <CollectionsPageClient initialCollections={initialData.content} initialHasMore={!initialData.last} />;
}
