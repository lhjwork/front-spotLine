"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchFeaturedCollections } from "@/lib/api";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { CollectionPreview } from "@/types";

export default function FeedCollectionSection() {
  const [collections, setCollections] = useState<CollectionPreview[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchFeaturedCollections();
        if (!cancelled) setCollections(data.slice(0, 6));
      } catch {
        // Non-critical section
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (collections.length === 0) return null;

  return (
    <section className="py-4">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-lg font-bold text-gray-900">큐레이션 컬렉션</h2>
        <Link href="/collections" className="text-xs font-medium text-blue-600 hover:text-blue-700">
          전체보기
        </Link>
      </div>
      <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-pl-4 px-4 scrollbar-hide">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collection/${collection.slug}`}
            className="w-56 shrink-0 snap-start overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-purple-100">
              {collection.coverImageUrl && (
                <OptimizedImage
                  src={collection.coverImageUrl}
                  alt={collection.title}
                  fill
                  className="object-cover"
                />
              )}
              {collection.area && (
                <span className="absolute top-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                  {collection.area}
                </span>
              )}
            </div>
            <div className="p-2.5">
              <h3 className="truncate text-sm font-semibold text-gray-900">{collection.title}</h3>
              <p className="mt-0.5 text-xs text-gray-400">{collection.itemCount}개 장소/코스</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
