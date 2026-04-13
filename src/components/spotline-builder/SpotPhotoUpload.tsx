"use client";

import { useState, useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { getPresignedUrl, updateSpotMedia } from "@/lib/api";
import { cn } from "@/lib/utils";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { SpotMediaItem, MediaItemRequest } from "@/types";

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface SpotPhotoUploadProps {
  spotId: string;
  mediaItems: SpotMediaItem[];
  onMediaUpdate: (mediaItems: SpotMediaItem[]) => void;
}

/** Extract S3 key from full URL */
function extractS3Key(url: string): string {
  const match = url.match(/media\/spots\/.+/);
  return match ? match[0] : url;
}

function toMediaItemRequests(items: SpotMediaItem[]): MediaItemRequest[] {
  return items.map((m, i) => ({
    s3Key: extractS3Key(m.url),
    mediaType: "IMAGE" as const,
    displayOrder: i,
    fileSizeBytes: 0,
    mimeType: "",
  }));
}

export default function SpotPhotoUpload({
  spotId,
  mediaItems,
  onMediaUpdate,
}: SpotPhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("JPEG, PNG, WebP 이미지만 지원합니다");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("10MB 이하 이미지만 업로드 가능합니다");
      return;
    }

    setIsUploading(true);
    try {
      const { uploadUrl, fileUrl, s3Key } = await getPresignedUrl(
        file.name,
        file.type,
        file.size
      );

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      const newRequest: MediaItemRequest = {
        s3Key,
        mediaType: "IMAGE",
        displayOrder: mediaItems.length,
        fileSizeBytes: file.size,
        mimeType: file.type,
      };

      await updateSpotMedia(spotId, [
        ...toMediaItemRequests(mediaItems),
        newRequest,
      ]);

      const newItem: SpotMediaItem = {
        id: crypto.randomUUID(),
        url: fileUrl,
        mediaType: "IMAGE",
        thumbnailUrl: null,
        durationSec: null,
        displayOrder: mediaItems.length,
      };
      onMediaUpdate([...mediaItems, newItem]);
    } catch (err) {
      console.warn("사진 업로드 실패:", err);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async (mediaId: string) => {
    const updated = mediaItems.filter((m) => m.id !== mediaId);
    onMediaUpdate(updated);
    try {
      await updateSpotMedia(spotId, toMediaItemRequests(updated));
    } catch {}
  };

  const canAdd = mediaItems.length < MAX_PHOTOS;

  return (
    <div className="ml-7 mt-2">
      <div className="flex flex-wrap gap-2">
        {mediaItems.map((media) => (
          <div key={media.id} className="group relative h-16 w-16 shrink-0">
            <OptimizedImage
              src={media.url}
              alt="Spot 사진"
              width={64}
              height={64}
              className="h-full w-full rounded-lg object-cover"
            />
            <button
              onClick={() => handleRemove(media.id)}
              className="absolute -right-1 -top-1 hidden rounded-full bg-red-500 p-0.5 text-white shadow-sm group-hover:block"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {canAdd && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className={cn(
              "flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-purple-300 hover:text-purple-500",
              isUploading && "cursor-not-allowed opacity-50"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
