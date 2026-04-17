"use client";

import { useState } from "react";
import Link from "next/link";
import { GitBranch, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpotLineSpotDetail } from "@/types";
import SpotLineVariationsList from "@/components/spotline/SpotLineVariationsList";
import VariationForkTree from "@/components/spotline/VariationForkTree";

interface SpotLineVariationsProps {
  spotLineId: string;
  spotLineSlug: string;
  spotLineTitle: string;
  parentSpotLineId: string | null;
  variationsCount: number;
  originalSpots: SpotLineSpotDetail[];
}

export default function SpotLineVariations({
  spotLineId,
  spotLineSlug,
  spotLineTitle,
  parentSpotLineId,
  variationsCount,
  originalSpots,
}: SpotLineVariationsProps) {
  const [expanded, setExpanded] = useState(false);
  const hasVariations = variationsCount > 0;

  return (
    <section className="mt-6">
      {/* Fork tree */}
      {parentSpotLineId && (
        <VariationForkTree
          parentSpotLineId={parentSpotLineId}
          currentTitle={spotLineTitle}
          variationsCount={variationsCount}
        />
      )}

      <div
        className={cn(
          "rounded-xl border border-purple-100 bg-purple-50/50 p-4",
          hasVariations && "cursor-pointer"
        )}
        onClick={hasVariations ? () => setExpanded(!expanded) : undefined}
      >
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 shrink-0 text-purple-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-purple-800">
              {hasVariations
                ? `${variationsCount}개의 변형 SpotLine이 있습니다`
                : "아직 변형이 없습니다"}
            </p>
            <p className="mt-0.5 text-xs text-purple-600">
              {hasVariations
                ? "다른 사람들이 이 코스를 자신만의 방식으로 변형했어요"
                : "첫 번째 변형을 만들어보세요!"}
            </p>
          </div>
          {hasVariations && (
            expanded ? (
              <ChevronUp className="h-4 w-4 text-purple-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-purple-500" />
            )
          )}
        </div>

        {/* Inline variations list */}
        {expanded && hasVariations && (
          <div onClick={(e) => e.stopPropagation()}>
            <SpotLineVariationsList
              spotLineId={spotLineId}
              originalSpotCount={originalSpots.length}
              originalSpots={originalSpots}
              spotLineSlug={spotLineSlug}
            />
          </div>
        )}
      </div>

      {/* CTA */}
      <Link
        href={`/create-spotline?fork=${spotLineSlug}`}
        className="mt-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/30 p-3 text-sm font-medium text-purple-600 hover:border-purple-300 hover:bg-purple-50"
      >
        <GitBranch className="h-4 w-4" />
        나만의 변형 만들기
      </Link>
    </section>
  );
}
