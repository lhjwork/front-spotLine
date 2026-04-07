"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { cn } from "@/lib/utils";
import type { BlogBlockType } from "@/types";

interface BlockEditorProps {
  blockId: string;
  blockType: BlogBlockType;
  content: string | null;
  spotTitle?: string | null;
  isActive: boolean;
  onContentChange: (blockId: string, content: string) => void;
  onFocus: (blockId: string) => void;
}

const PLACEHOLDERS: Record<BlogBlockType, string> = {
  INTRO: "오늘의 경험을 소개해주세요...",
  SPOT: "이 장소에서의 경험을 작성해주세요...",
  TRANSITION: "다음 장소로 이동하면서...",
  OUTRO: "오늘의 경험을 마무리해주세요...",
};

export default function BlockEditor({
  blockId,
  blockType,
  content,
  spotTitle,
  isActive,
  onContentChange,
  onFocus,
}: BlockEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: PLACEHOLDERS[blockType],
      }),
      Image,
    ],
    content: content ? JSON.parse(content) : undefined,
    onUpdate: ({ editor }) => {
      onContentChange(blockId, JSON.stringify(editor.getJSON()));
    },
    onFocus: () => onFocus(blockId),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[80px] p-3",
      },
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    const currentJSON = JSON.stringify(editor.getJSON());
    if (content && content !== currentJSON) {
      editor.commands.setContent(JSON.parse(content));
    }
  }, [content, editor]);

  return (
    <div
      data-block-id={blockId}
      className={cn(
        "rounded-xl border bg-white transition-all",
        isActive ? "border-blue-300 shadow-sm" : "border-gray-200"
      )}
    >
      {blockType === "SPOT" && spotTitle && (
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
          <span className="text-sm">📍</span>
          <span className="text-sm font-semibold text-gray-900">
            {spotTitle}
          </span>
        </div>
      )}

      {blockType === "INTRO" && (
        <div className="border-b border-gray-100 px-4 py-2.5">
          <span className="text-sm font-medium text-purple-600">✨ 인트로</span>
        </div>
      )}

      {blockType === "OUTRO" && (
        <div className="border-b border-gray-100 px-4 py-2.5">
          <span className="text-sm font-medium text-green-600">🎬 아웃트로</span>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
