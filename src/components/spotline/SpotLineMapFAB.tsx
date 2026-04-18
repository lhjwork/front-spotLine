"use client";

import { useState } from "react";
import { Map, ExternalLink } from "lucide-react";
import type { SpotLineSpotDetail } from "@/types";

interface SpotLineMapFABProps {
  spots: SpotLineSpotDetail[];
  title: string;
}

export default function SpotLineMapFAB({ spots, title }: SpotLineMapFABProps) {
  const [open, setOpen] = useState(false);

  const sorted = [...spots].sort((a, b) => a.order - b.order);
  const firstSpot = sorted[0];
  if (!firstSpot) return null;

  const kakaoUrl = `https://map.kakao.com/link/to/${encodeURIComponent(firstSpot.spotTitle)},${firstSpot.spotLatitude},${firstSpot.spotLongitude}`;
  const naverUrl = `https://map.naver.com/v5/search/${encodeURIComponent(firstSpot.spotAddress)}`;

  return (
    <>
      {/* FAB button — mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700 md:hidden"
        aria-label="지도에서 보기"
      >
        <Map className="h-5 w-5" />
      </button>

      {/* Bottom sheet */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
          />
          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white p-4 pb-8 md:hidden">
            <h3 className="text-sm font-semibold text-gray-900">지도에서 보기</h3>
            <p className="mt-1 text-xs text-gray-400">{firstSpot.spotTitle}에서 시작</p>

            <div className="mt-4 flex gap-3">
              <a
                href={kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-yellow-50 py-3 text-sm font-medium text-yellow-700 hover:bg-yellow-100"
                onClick={() => setOpen(false)}
              >
                카카오맵
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href={naverUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-50 py-3 text-sm font-medium text-green-700 hover:bg-green-100"
                onClick={() => setOpen(false)}
              >
                네이버지도
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
