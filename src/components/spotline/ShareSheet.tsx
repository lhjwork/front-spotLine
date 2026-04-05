"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Share2, MessageCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  copyToClipboard,
  nativeShare,
  isNativeShareSupported,
  shareToKakao,
} from "@/lib/share";
import type { SpotLineDetailResponse } from "@/types";

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  spotLine: SpotLineDetailResponse;
}

export default function ShareSheet({
  isOpen,
  onClose,
  spotLine,
}: ShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
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

  if (!mounted || !isOpen) return null;

  const shareUrl = `https://spotline.kr/spotline/${spotLine.slug}`;
  const shareText = spotLine.description || `${spotLine.area} · ${spotLine.spots.length}곳`;
  const imageUrl = spotLine.spots[0]?.spotMedia?.[0] || "";

  const handleCopy = async () => {
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKakao = () => {
    shareToKakao({
      title: spotLine.title,
      description: shareText,
      imageUrl,
      webUrl: shareUrl,
    });
  };

  const handleNative = async () => {
    await nativeShare({
      title: spotLine.title,
      text: shareText,
      url: shareUrl,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-lg animate-slide-up rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)]">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <h3 className="text-base font-semibold text-gray-900">공유</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-1 px-4 pb-6">
          {/* 링크 복사 */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-gray-50"
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              copied ? "bg-green-100" : "bg-gray-100"
            )}>
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5 text-gray-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {copied ? "복사되었어요!" : "링크 복사"}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[240px]">
                {shareUrl}
              </p>
            </div>
          </button>

          {/* 카카오톡 */}
          <button
            type="button"
            onClick={handleKakao}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <MessageCircle className="h-5 w-5 text-yellow-700" />
            </div>
            <p className="text-sm font-medium text-gray-900">카카오톡 공유</p>
          </button>

          {/* 네이티브 공유 */}
          {isNativeShareSupported() && (
            <button
              type="button"
              onClick={handleNative}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Share2 className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">공유하기</p>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
