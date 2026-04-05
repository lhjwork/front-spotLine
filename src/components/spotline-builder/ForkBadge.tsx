"use client";

import { GitFork } from "lucide-react";
import Link from "next/link";
import { useSpotLineBuilderStore } from "@/store/useSpotLineBuilderStore";

export default function ForkBadge() {
  const parentInfo = useSpotLineBuilderStore((s) => s.parentInfo);

  if (!parentInfo) return null;

  return (
    <div className="mx-4 flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2">
      <GitFork className="h-4 w-4 shrink-0 text-purple-600" />
      <p className="text-xs text-purple-700">
        <Link
          href={`/spotline/${parentInfo.slug}`}
          className="font-medium underline"
        >
          {parentInfo.creatorName}
        </Link>
        의 &apos;{parentInfo.title}&apos;에서 영감을 받았어요
      </p>
    </div>
  );
}
