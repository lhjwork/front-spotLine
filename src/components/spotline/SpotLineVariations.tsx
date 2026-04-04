"use client";

import { useState } from "react";
import Link from "next/link";
import { GitBranch, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import SpotLineVariationsList from "@/components/spotline/SpotLineVariationsList";

interface SpotLineVariationsProps {
  spotLineId: string;
  parentSpotLineId: string | null;
  variationsCount: number;
  parentSpotLineSlug?: string;
}

export default function SpotLineVariations({
  spotLineId,
  parentSpotLineId,
  variationsCount,
  parentSpotLineSlug,
}: SpotLineVariationsProps) {
  const [expanded, setExpanded] = useState(false);
  const hasVariations = variationsCount > 0;

  return (
    <section className="mt-6">
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
              {parentSpotLineId
                ? "이 SpotLine은 다른 SpotLine에서 변형되었습니다"
                : `${variationsCount}개의 변형 SpotLine이 있습니다`}
            </p>
            <p className="mt-0.5 text-xs text-purple-600">
              다른 사람들이 이 코스를 자신만의 방식으로 변형했어요
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
            <SpotLineVariationsList spotLineId={spotLineId} />
          </div>
        )}
      </div>

      {/* Parent route link */}
      {parentSpotLineId && parentSpotLineSlug && (
        <Link
          href={`/spotline/${parentSpotLineSlug}`}
          className="mt-2 flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          원본 SpotLine 보기
        </Link>
      )}
    </section>
  );
}
