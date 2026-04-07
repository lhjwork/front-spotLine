"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useBlogEditorStore } from "@/store/useBlogEditorStore";
import BlogCoverEditor from "./BlogCoverEditor";

interface BlogPublishSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BlogPublishSheet({ isOpen, onClose }: BlogPublishSheetProps) {
  const title = useBlogEditorStore((s) => s.title);
  const summary = useBlogEditorStore((s) => s.summary);
  const coverImageUrl = useBlogEditorStore((s) => s.coverImageUrl);
  const isSaving = useBlogEditorStore((s) => s.isSaving);
  const setTitle = useBlogEditorStore((s) => s.setTitle);
  const setSummary = useBlogEditorStore((s) => s.setSummary);
  const setCoverImage = useBlogEditorStore((s) => s.setCoverImage);
  const publish = useBlogEditorStore((s) => s.publish);

  const [isPublishing, setIsPublishing] = useState(false);

  if (!isOpen) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publish();
      onClose();
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">블로그 발행</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">소개 (선택)</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder="블로그를 한 줄로 소개해주세요"
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">커버 이미지</label>
            <BlogCoverEditor
              coverImageUrl={coverImageUrl}
              onCoverChange={setCoverImage}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600"
          >
            취소
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing || isSaving || !title.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                발행 중...
              </>
            ) : (
              "발행하기"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
