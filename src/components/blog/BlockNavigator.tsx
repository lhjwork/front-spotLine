"use client";

import { cn } from "@/lib/utils";
import type { EditorBlock } from "@/store/useBlogEditorStore";

interface BlockNavigatorProps {
  blocks: EditorBlock[];
  activeBlockId: string | null;
  onBlockClick: (blockId: string) => void;
}

export default function BlockNavigator({
  blocks,
  activeBlockId,
  onBlockClick,
}: BlockNavigatorProps) {
  const spotBlocks = blocks.filter((b) => b.blockType === "SPOT");

  return (
    <div className="hidden lg:block">
      <div className="sticky top-20 space-y-1">
        <h3 className="mb-3 text-sm font-semibold text-gray-500">코스 네비게이터</h3>
        {spotBlocks.map((block, i) => {
          const isActive = block.id === activeBlockId;
          const hasContent = !!block.content;
          return (
            <button
              key={block.id}
              onClick={() => onBlockClick(block.id)}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isActive
                    ? "bg-blue-600 text-white"
                    : hasContent
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-500"
                )}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {block.spotTitle || "장소"}
                </p>
                {block.spotCategory && (
                  <p className="text-xs text-gray-400">
                    {block.spotCategory} · {block.spotArea}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
