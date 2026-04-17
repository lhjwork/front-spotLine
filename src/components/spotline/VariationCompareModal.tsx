"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, MapPin, Plus, Minus, Equal } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchSpotLineDetail } from "@/lib/api";
import type { SpotLineSpotDetail, SpotDiffResult } from "@/types";

interface VariationCompareModalProps {
  originalSpots: SpotLineSpotDetail[];
  variationSlug: string;
  variationTitle: string;
  onClose: () => void;
}

function computeSpotDiff(
  original: SpotLineSpotDetail[],
  variation: SpotLineSpotDetail[]
): SpotDiffResult {
  const origIds = new Set(original.map((s) => s.spotId));
  const varIds = new Set(variation.map((s) => s.spotId));
  return {
    added: variation.filter((s) => !origIds.has(s.spotId)),
    removed: original.filter((s) => !varIds.has(s.spotId)),
    common: original.filter((s) => varIds.has(s.spotId)),
  };
}

export default function VariationCompareModal({
  originalSpots,
  variationSlug,
  variationTitle,
  onClose,
}: VariationCompareModalProps) {
  const [variationSpots, setVariationSpots] = useState<SpotLineSpotDetail[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const detail = await fetchSpotLineDetail(variationSlug);
      if (detail) {
        setVariationSpots(detail.spots);
      }
      setIsLoading(false);
    };
    load();
  }, [variationSlug]);

  const diff = variationSpots ? computeSpotDiff(originalSpots, variationSpots) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-4 pb-6 md:rounded-2xl md:p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            원본 vs {variationTitle}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Original */}
          <div>
            <p className="mb-2 text-xs font-medium text-gray-500">원본 Spots</p>
            <div className="space-y-1.5">
              {originalSpots.map((s) => {
                const isRemoved = diff?.removed.some((r) => r.spotId === s.spotId);
                return (
                  <div
                    key={s.spotId}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm",
                      isRemoved
                        ? "bg-red-50 text-red-700"
                        : "bg-purple-50/60 text-gray-700"
                    )}
                  >
                    {isRemoved ? (
                      <Minus className="h-3.5 w-3.5 shrink-0 text-red-400" />
                    ) : (
                      <Equal className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                    )}
                    <span className="truncate">{s.spotTitle}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Variation */}
          <div>
            <p className="mb-2 text-xs font-medium text-gray-500">변형 Spots</p>
            {isLoading ? (
              <div className="space-y-1.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 animate-pulse rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : variationSpots ? (
              <div className="space-y-1.5">
                {variationSpots.map((s) => {
                  const isAdded = diff?.added.some((a) => a.spotId === s.spotId);
                  return (
                    <div
                      key={s.spotId}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm",
                        isAdded
                          ? "bg-green-50 text-green-700"
                          : "bg-purple-50/60 text-gray-700"
                      )}
                    >
                      {isAdded ? (
                        <Plus className="h-3.5 w-3.5 shrink-0 text-green-500" />
                      ) : (
                        <Equal className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                      )}
                      <span className="truncate">{s.spotTitle}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400">불러올 수 없습니다</p>
            )}
          </div>
        </div>

        {/* Summary + Link */}
        {diff && (
          <div className="mt-4 space-y-2">
            <p className="text-center text-xs text-gray-500">
              <span className="text-green-600">+{diff.added.length}곳 추가</span>
              {" · "}
              <span className="text-red-600">-{diff.removed.length}곳 제거</span>
              {" · "}
              <span className="text-gray-500">{diff.common.length}곳 동일</span>
            </p>
            <Link
              href={`/spotline/${variationSlug}`}
              className="block rounded-xl bg-purple-600 py-2.5 text-center text-sm font-medium text-white hover:bg-purple-700"
            >
              변형 SpotLine 보러가기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
