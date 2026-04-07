"use client";

import { cn } from "@/lib/utils";

interface TransitionBlockProps {
  blockId: string;
  content: string | null;
  isActive: boolean;
  onContentChange: (blockId: string, content: string) => void;
  onFocus: (blockId: string) => void;
}

export default function TransitionBlock({
  blockId,
  content,
  isActive,
  onContentChange,
  onFocus,
}: TransitionBlockProps) {
  return (
    <div
      data-block-id={blockId}
      className={cn(
        "mx-4 flex items-center gap-3 py-2",
        isActive && "opacity-100"
      )}
    >
      <div className="flex flex-col items-center">
        <div className="h-4 w-px bg-gray-300" />
        <span className="text-xs text-gray-400">↕</span>
        <div className="h-4 w-px bg-gray-300" />
      </div>
      <input
        type="text"
        value={content || ""}
        placeholder="이동 메모 (선택)"
        onChange={(e) => onContentChange(blockId, e.target.value)}
        onFocus={() => onFocus(blockId)}
        className="flex-1 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none"
      />
    </div>
  );
}
