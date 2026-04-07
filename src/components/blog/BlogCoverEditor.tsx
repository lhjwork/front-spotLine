"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { getPresignedUrl } from "@/lib/api";
import OptimizedImage from "@/components/common/OptimizedImage";

interface BlogCoverEditorProps {
  coverImageUrl: string | null;
  onCoverChange: (url: string | null) => void;
}

export default function BlogCoverEditor({
  coverImageUrl,
  onCoverChange,
}: BlogCoverEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { uploadUrl, fileUrl } = await getPresignedUrl(
        file.name,
        file.type
      );
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      onCoverChange(fileUrl);
    } catch {
      console.warn("커버 이미지 업로드 실패");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  if (coverImageUrl) {
    return (
      <div className="group relative aspect-[3/1] w-full overflow-hidden rounded-xl">
        <OptimizedImage
          src={coverImageUrl}
          alt="블로그 커버"
          width={900}
          height={300}
          className="h-full w-full object-cover"
        />
        <button
          onClick={() => onCoverChange(null)}
          className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => inputRef.current?.click()}
      disabled={isUploading}
      className="flex aspect-[3/1] w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-blue-300 hover:bg-blue-50"
    >
      {isUploading ? (
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      ) : (
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <ImagePlus className="h-8 w-8" />
          <span className="text-sm">커버 이미지 추가</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </button>
  );
}
