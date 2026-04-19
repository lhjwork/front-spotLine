"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, X } from "lucide-react";
import { getTodayScanCount, isBannerDismissedToday, dismissBannerToday } from "@/lib/qr-history";

export default function QrSessionBanner() {
  const [count, setCount] = useState(0);
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCount(getTodayScanCount());
    setDismissed(isBannerDismissedToday());
  }, []);

  if (!mounted || count < 2 || dismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dismissBannerToday();
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-[72px] left-0 right-0 z-30 px-4">
      <div className="mx-auto max-w-lg">
        <Link
          href="/qr-history"
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-white shadow-lg transition-colors hover:bg-purple-700"
        >
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-sm font-medium">
            {count}개 Spot 방문 · SpotLine 만들기
          </span>
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-full p-1 hover:bg-purple-500"
          >
            <X className="h-4 w-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}
