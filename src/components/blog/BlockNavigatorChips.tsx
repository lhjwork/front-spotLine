"use client";

import { cn } from "@/lib/utils";
import type { EditorBlock } from "@/store/useBlogEditorStore";

interface BlockNavigatorChipsProps {
  blocks: EditorBlock[];
  activeBlockId: string | null;
  onBlockClick: (blockId: string) => void;
}

export default function BlockNavigatorChips({
  blocks,
  activeBlockId,
  onBlockClick,
}: BlockNavigatorChipsProps) {
  const spotBlocks = blocks.filter((b) => b.blockType === "SPOT");

  return (
    <div className="sticky top-0 z-10 overflow-x-auto border-b bg-white px-4 py-2 lg:hidden">
      <div className="flex gap-2">
        {spotBlocks.map((block, i) => {
          const isActive = block.id === activeBlockId;
          return (
            <button
              key={block.id}
              onClick={() => onBlockClick(block.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {i + 1}. {block.spotTitle || "장소"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
