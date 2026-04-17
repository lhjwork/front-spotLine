import { Map, ExternalLink } from "lucide-react";
import type { SpotLineSpotDetail } from "@/types";

interface SpotLineMapPreviewProps {
  spots: SpotLineSpotDetail[];
  title: string;
}

export default function SpotLineMapPreview({ spots, title }: SpotLineMapPreviewProps) {
  const sorted = [...spots].sort((a, b) => a.order - b.order);
  const firstSpot = sorted[0];
  const lastSpot = sorted[sorted.length - 1];

  // 카카오맵 경로 URL 생성
  const kakaoRouteUrl = `https://map.kakao.com/link/to/${encodeURIComponent(lastSpot.spotTitle)},${lastSpot.spotLatitude},${lastSpot.spotLongitude}`;

  // 네이버맵 경로 URL 생성
  const naverRouteUrl = `https://map.naver.com/v5/directions/${firstSpot.spotLongitude},${firstSpot.spotLatitude},,/${lastSpot.spotLongitude},${lastSpot.spotLatitude},,/-/walk`;

  return (
    <section className="mt-6">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <Map className="h-5 w-5 text-blue-600" />
        <h2 className="text-sm font-semibold text-gray-900">경로 지도</h2>
        <span className="text-xs text-gray-400">{sorted.length}곳</span>
      </div>

      {/* Always-visible content */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        {/* Spot list with numbered markers */}
        <div className="space-y-1.5">
          {sorted.map((spot, index) => (
            <div key={spot.spotId} className="flex items-center gap-2 text-xs">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                {index + 1}
              </span>
              <span className="truncate text-gray-700">{spot.spotTitle}</span>
              <span className="shrink-0 text-gray-400">{spot.spotArea}</span>
            </div>
          ))}
        </div>

        {/* External map links */}
        <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
          <a
            href={kakaoRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-yellow-50 py-2 text-xs font-medium text-yellow-700 hover:bg-yellow-100"
          >
            카카오맵
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={naverRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-green-50 py-2 text-xs font-medium text-green-700 hover:bg-green-100"
          >
            네이버지도
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </section>
  );
}
