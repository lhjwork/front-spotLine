import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { fetchCollectionDetail } from "@/lib/api";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumb from "@/components/seo/Breadcrumb";
import { generateCollectionJsonLd } from "@/lib/seo/jsonld";
import OptimizedImage from "@/components/common/OptimizedImage";
import { MapPin, Route } from "lucide-react";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await fetchCollectionDetail(slug);

  if (!collection) {
    return { title: "컬렉션을 찾을 수 없습니다" };
  }

  const description = collection.description || `${collection.area}의 ${collection.title}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.kr";

  return {
    title: `${collection.title} | Spotline`,
    description,
    alternates: {
      canonical: `${siteUrl}/collection/${slug}`,
    },
    openGraph: {
      title: `${collection.title} | Spotline`,
      description,
      type: "article",
      ...(collection.coverImageUrl && {
        images: [{ url: collection.coverImageUrl }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: collection.title,
      description,
    },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await fetchCollectionDetail(slug);

  if (!collection) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <JsonLd data={generateCollectionJsonLd(collection)} />
      <Breadcrumb items={[
        { name: "컬렉션", url: "/collections" },
        { name: collection.title },
      ]} />

      {/* Hero section */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 md:h-64">
        {collection.coverImageUrl && (
          <OptimizedImage
            src={collection.coverImageUrl}
            alt={collection.title}
            fill
            className="object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="mx-auto max-w-5xl">
            {collection.area && (
              <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {collection.area}
              </span>
            )}
            <h1 className="text-2xl font-bold text-white md:text-3xl">{collection.title}</h1>
            {collection.description && (
              <p className="mt-1 text-sm text-white/80 line-clamp-2">{collection.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Items grid */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          {collection.itemCount}개의 추천 장소/코스
        </h2>
        <div className="space-y-3">
          {collection.items
            .sort((a, b) => a.itemOrder - b.itemOrder)
            .map((item) => (
              <Link
                key={item.id}
                href={item.itemType === "SPOT" ? `/spot/${item.spotSlug}` : `/spotline/${item.spotLineSlug}`}
                className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {(item.itemType === "SPOT" ? item.spotCoverImage : item.spotLineCoverImage) && (
                    <OptimizedImage
                      src={(item.itemType === "SPOT" ? item.spotCoverImage : item.spotLineCoverImage)!}
                      alt={(item.itemType === "SPOT" ? item.spotTitle : item.spotLineTitle) || ""}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {item.itemType === "SPOT" ? (
                      <MapPin className="h-3.5 w-3.5 text-blue-500" />
                    ) : (
                      <Route className="h-3.5 w-3.5 text-purple-500" />
                    )}
                    <span className="text-xs text-gray-500">
                      {item.itemType === "SPOT" ? "장소" : "코스"}
                    </span>
                    {item.itemType === "SPOT" && item.spotArea && (
                      <span className="text-xs text-gray-400">{item.spotArea}</span>
                    )}
                    {item.itemType === "SPOTLINE" && item.spotLineSpotCount && (
                      <span className="text-xs text-gray-400">{item.spotLineSpotCount}곳</span>
                    )}
                  </div>
                  <h3 className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                    {item.itemType === "SPOT" ? item.spotTitle : item.spotLineTitle}
                  </h3>
                  {item.itemNote && (
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{item.itemNote}</p>
                  )}
                </div>
              </Link>
            ))}
        </div>
      </div>
    </main>
  );
}
