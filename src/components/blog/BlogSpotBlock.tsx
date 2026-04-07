"use client";

import { generateHTML } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { BlogBlockResponse } from "@/types";

interface BlogSpotBlockProps {
  block: BlogBlockResponse;
}

function renderContent(content: string | null): string {
  if (!content) return "";
  try {
    const json = JSON.parse(content);
    return generateHTML(json, [StarterKit, Image]);
  } catch {
    return content;
  }
}

export default function BlogSpotBlock({ block }: BlogSpotBlockProps) {
  const html = renderContent(block.content);

  return (
    <div className="space-y-3">
      {block.spotTitle && (
        <div className="flex items-center gap-2">
          <span className="text-base">📍</span>
          <div>
            <h3 className="font-semibold text-gray-900">{block.spotTitle}</h3>
            {block.spotCategory && (
              <p className="text-xs text-gray-400">
                {block.spotCategory} · {block.spotArea}
              </p>
            )}
          </div>
        </div>
      )}

      {html && (
        <div
          className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}

      {block.mediaItems.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-1">
          {block.mediaItems.map((media) => (
            <div
              key={media.id}
              className="shrink-0 overflow-hidden rounded-lg"
            >
              <OptimizedImage
                src={media.mediaUrl}
                alt={media.caption || "블로그 사진"}
                width={240}
                height={180}
                className="h-44 w-60 object-cover"
              />
              {media.caption && (
                <p className="mt-1 text-xs text-gray-400">{media.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
