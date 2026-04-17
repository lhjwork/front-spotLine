"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitBranch } from "lucide-react";
import { fetchSpotLineDetail } from "@/lib/api";

interface VariationForkTreeProps {
  parentSpotLineId: string;
  currentTitle: string;
  variationsCount: number;
}

export default function VariationForkTree({
  parentSpotLineId,
  currentTitle,
  variationsCount,
}: VariationForkTreeProps) {
  const [parentSlug, setParentSlug] = useState<string | null>(null);
  const [parentTitle, setParentTitle] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const detail = await fetchSpotLineDetail(parentSpotLineId);
      if (detail) {
        setParentSlug(detail.slug);
        setParentTitle(detail.title);
      }
    };
    load();
  }, [parentSpotLineId]);

  if (!parentSlug) return null;

  return (
    <div className="mb-3 rounded-lg border border-purple-100 bg-purple-50/30 p-3 text-sm">
      <div className="flex items-center gap-1.5 text-purple-700">
        <GitBranch className="h-3.5 w-3.5 shrink-0" />
        <Link
          href={`/spotline/${parentSlug}`}
          className="truncate font-medium hover:underline"
        >
          {parentTitle}
        </Link>
      </div>
      <div className="ml-3 mt-1 border-l-2 border-purple-200 pl-3">
        <p className="font-medium text-gray-900">{currentTitle}</p>
        {variationsCount > 1 && (
          <p className="mt-0.5 text-xs text-gray-500">
            외 {variationsCount - 1}개 변형
          </p>
        )}
      </div>
    </div>
  );
}
