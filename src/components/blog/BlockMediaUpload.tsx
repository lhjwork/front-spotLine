"use client";

import { useState, useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { getPresignedUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { BlogBlockMediaResponse } from "@/types";

interface BlockMediaUploadProps {
  blockId: string;
  mediaItems: BlogBlockMediaResponse[];
  onAddMedia: (blockId: string, media: BlogBlockMediaResponse) => void;
  onRemoveMedia: (blockId: string, mediaId: string) => void;
}

export default function BlockMediaUpload({
  blockId,
  mediaItems,
  onAddMedia,
  onRemoveMedia,
}: BlockMediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { uploadUrl, fileUrl } = await getPresignedUrl(
        file.name,
        file.type,
        file.size
      );

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      const media: BlogBlockMediaResponse = {
        id: crypto.randomUUID(),
        mediaUrl: fileUrl,
        mediaOrder: mediaItems.length,
        caption: null,
      };
      onAddMedia(blockId, media);
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.warn("이미지 업로드 실패:", err);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="mt-2 px-3 pb-3">
      <div className="flex flex-wrap gap-2">
        {mediaItems.map((media) => (
          <div key={media.id} className="group relative h-20 w-20 shrink-0">
            <OptimizedImage
              src={media.mediaUrl}
              alt={media.caption || "블로그 이미지"}
              width={80}
              height={80}
              className="h-full w-full rounded-lg object-cover"
            />
            <button
              onClick={() => onRemoveMedia(blockId, media.id)}
              className="absolute -right-1.5 -top-1.5 hidden rounded-full bg-red-500 p-0.5 text-white shadow-sm group-hover:block"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-blue-300 hover:text-blue-500",
            isUploading && "cursor-not-allowed opacity-50"
          )}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
