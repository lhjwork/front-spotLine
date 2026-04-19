"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Route, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { fetchMySpotLines } from "@/lib/api";
import type { MySpotLine } from "@/types";

interface AddToSpotLineSheetProps {
  isOpen: boolean;
  onClose: () => void;
  spotSlug: string;
}

export default function AddToSpotLineSheet({ isOpen, onClose, spotSlug }: AddToSpotLineSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [spotLines, setSpotLines] = useState<MySpotLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      loadMySpotLines();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const loadMySpotLines = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await fetchMySpotLines();
      setSpotLines(result.items);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-lg animate-in slide-in-from-bottom rounded-t-2xl bg-white pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 className="text-base font-semibold text-gray-900">SpotLine에 추가</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-y-auto px-4 py-3">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          )}

          {error && (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">목록을 불러올 수 없어요</p>
              <button
                onClick={loadMySpotLines}
                className="mt-2 text-sm font-medium text-purple-600"
              >
                다시 시도
              </button>
            </div>
          )}

          {!loading && !error && spotLines.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">아직 만든 SpotLine이 없어요</p>
            </div>
          )}

          {!loading && !error && spotLines.length > 0 && (
            <div className="space-y-2">
              {spotLines.map((sl) => (
                <Link
                  key={sl.id}
                  href={`/create-spotline?spot=${spotSlug}&edit=${sl.spotLineSlug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                    <Route className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{sl.title}</p>
                    <p className="text-xs text-gray-500">
                      {sl.spotsCount}개 Spot · {sl.area}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-3">
          <Link
            href={`/create-spotline?spot=${spotSlug}`}
            onClick={onClose}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3",
              "bg-purple-600 text-sm font-medium text-white",
              "transition-colors hover:bg-purple-700 active:bg-purple-800"
            )}
          >
            <Plus className="h-4 w-4" />
            새 SpotLine 만들기
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
