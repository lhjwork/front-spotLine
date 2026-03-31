"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { fetchRouteVariations } from "@/lib/api";
import type { RoutePreview } from "@/types";

interface VariationsListProps {
  routeId: string;
}

export default function VariationsList({ routeId }: VariationsListProps) {
  const [variations, setVariations] = useState<RoutePreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const data = await fetchRouteVariations(routeId);
        setVariations(data.items);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [routeId]);

  if (isLoading) {
    return (
      <div className="mt-3 space-y-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl bg-purple-50"
          />
        ))}
      </div>
    );
  }

  if (error || variations.length === 0) {
    return (
      <p className="mt-3 text-xs text-gray-400">
        {error ? "변형 목록을 불러올 수 없습니다" : "변형 Route가 없습니다"}
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {variations.map((v) => (
        <Link
          key={v.id}
          href={`/route/${v.slug}`}
          className="flex items-center gap-3 rounded-xl border border-purple-100 bg-white p-3 transition-colors hover:bg-purple-50"
        >
          <MapPin className="h-4 w-4 shrink-0 text-purple-500" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {v.title}
            </p>
            <p className="text-xs text-gray-500">
              {v.area} · {v.spotCount}곳 · {Math.round(v.totalDuration / 60)}시간
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
