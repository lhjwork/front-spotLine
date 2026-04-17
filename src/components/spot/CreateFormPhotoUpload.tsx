"use client";

import { useState, useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { getPresignedUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { MediaItemRequest } from "@/types";

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface PhotoPreviewItem {
  id: string;
  fileUrl: string;
  s3Key: string;
  fileSizeBytes: number;
  mimeType: string;
}

interface CreateFormPhotoUploadProps {
  mediaItems: MediaItemRequest[];
  onMediaItemsChange: (items: MediaItemRequest[]) => void;
}

export default function CreateFormPhotoUpload({
  mediaItems,
  onMediaItemsChange,
}: CreateFormPhotoUploadProps) {
  const [previews, setPreviews] = useState<PhotoPreviewItem[]>([]);
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

      const newPreview: PhotoPreviewItem = {
        id: crypto.randomUUID(),
        fileUrl,
        s3Key,
        fileSizeBytes: file.size,
        mimeType: file.type,
      };

      const updatedPreviews = [...previews, newPreview];
      setPreviews(updatedPreviews);

      onMediaItemsChange(
        updatedPreviews.map((p, i) => ({
          s3Key: p.s3Key,
          mediaType: "IMAGE" as const,
          displayOrder: i,
          fileSizeBytes: p.fileSizeBytes,
          mimeType: p.mimeType,
        }))
      );
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.warn("사진 업로드 실패:", err);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = (id: string) => {
    const updated = previews.filter((p) => p.id !== id);
    setPreviews(updated);

    onMediaItemsChange(
      updated.map((p, i) => ({
        s3Key: p.s3Key,
        mediaType: "IMAGE" as const,
        displayOrder: i,
        fileSizeBytes: p.fileSizeBytes,
        mimeType: p.mimeType,
      }))
    );
  };

  const canAdd = previews.length < MAX_PHOTOS;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {previews.map((preview) => (
          <div key={preview.id} className="group relative h-16 w-16 shrink-0">
            <img
              src={preview.fileUrl}
              alt="업로드된 사진"
              className="h-full w-full rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(preview.id)}
              className="absolute -right-1 -top-1 hidden rounded-full bg-red-500 p-0.5 text-white shadow-sm group-hover:block"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className={cn(
              "flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-blue-300 hover:text-blue-500",
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
