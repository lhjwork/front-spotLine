"use client";

import { useEffect } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useBlogEditorStore } from "@/store/useBlogEditorStore";

export default function BlogAutoSaveIndicator() {
  const isDirty = useBlogEditorStore((s) => s.isDirty);
  const isSaving = useBlogEditorStore((s) => s.isSaving);
  const lastSavedAt = useBlogEditorStore((s) => s.lastSavedAt);
  const saveError = useBlogEditorStore((s) => s.saveError);
  const blogId = useBlogEditorStore((s) => s.blogId);
  const saveDraft = useBlogEditorStore((s) => s.saveDraft);

  // Auto-save every 30s when dirty
  useEffect(() => {
    if (!isDirty || !blogId) return;

    const timer = setTimeout(() => {
      saveDraft();
    }, 30_000);

    return () => clearTimeout(timer);
  }, [isDirty, blogId, saveDraft]);

  const formatTime = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    return `${Math.floor(diff / 3600)}시간 전`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white px-4 py-2">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>저장 중...</span>
            </>
          ) : saveError ? (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              <span className="text-red-500">{saveError}</span>
            </>
          ) : lastSavedAt ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span>💾 자동 저장됨 · 마지막 저장: {formatTime(lastSavedAt)}</span>
            </>
          ) : isDirty ? (
            <span>편집 중 · 30초 후 자동 저장</span>
          ) : (
            <span>편집 대기 중</span>
          )}
        </div>
      </div>
    </div>
  );
}
