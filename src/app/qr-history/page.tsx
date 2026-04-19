"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, X, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { getQrScanHistory, removeQrScanItem } from "@/lib/qr-history";
import type { QrScanHistoryItem } from "@/types";

const CATEGORY_EMOJI: Record<string, string> = {
  cafe: "\u2615",
  restaurant: "\ud83c\udf7d\ufe0f",
  bar: "\ud83c\udf7a",
  nature: "\ud83c\udf3f",
  culture: "\ud83c\udfa8",
  exhibition: "\ud83d\uddbc\ufe0f",
  walk: "\ud83d\udeb6",
  activity: "\ud83c\udfaf",
  shopping: "\ud83d\udecd\ufe0f",
  other: "\ud83d\udccd",
};

export default function QrHistoryPage() {
  const [items, setItems] = useState<QrScanHistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(getQrScanHistory());
  }, []);

  const handleRemove = (spotId: string) => {
    removeQrScanItem(spotId);
    setItems((prev) => prev.filter((i) => i.spotId !== spotId));
  };

  const spotsParam = items.map((i) => i.slug).join(",");

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <Link href="/" className="mr-3 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-semibold text-gray-900">오늘의 발견</h1>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-6">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <QrCode className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">아직 QR 스캔 기록이 없어요</p>
            <p className="mt-1 text-xs text-gray-500">
              QR 코드를 스캔하면 여기에 방문 기록이 쌓여요
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm font-medium text-gray-500">
              <MapPin className="mr-1 inline h-4 w-4" />
              오늘 방문한 Spot ({items.length})
            </p>

            <div className="space-y-2">
              {[...items].reverse().map((item) => {
                const time = new Date(item.scannedAt).toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });
                const emoji = CATEGORY_EMOJI[item.category] || CATEGORY_EMOJI.other;

                return (
                  <div key={item.spotId} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                    <span className="shrink-0 text-xs font-medium text-gray-400">{time}</span>
                    <Link
                      href={`/spot/${item.slug}`}
                      className="min-w-0 flex-1"
                    >
                      <p className="truncate text-sm font-medium text-gray-900">
                        {emoji} {item.title}
                      </p>
                      {item.category && (
                        <p className="text-xs text-gray-500">{item.category}</p>
                      )}
                    </Link>
                    <button
                      onClick={() => handleRemove(item.spotId)}
                      className="shrink-0 rounded-full p-1.5 text-gray-300 hover:bg-gray-100 hover:text-gray-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {items.length >= 2 && (
              <Link
                href={`/create-spotline?spots=${spotsParam}`}
                className={cn(
                  "mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5",
                  "bg-purple-600 text-sm font-semibold text-white",
                  "transition-colors hover:bg-purple-700 active:bg-purple-800"
                )}
              >
                이 Spot들로 SpotLine 만들기
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
