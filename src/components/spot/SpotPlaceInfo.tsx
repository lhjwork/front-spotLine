import { Clock, Phone, Globe, Star } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils";
import type { DiscoverPlaceInfo } from "@/types";

interface SpotPlaceInfoProps {
  placeInfo: DiscoverPlaceInfo;
}

export default function SpotPlaceInfo({ placeInfo }: SpotPlaceInfoProps) {
  return (
    <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">매장 정보</h2>

      <div className="space-y-2.5">
        {placeInfo.businessHours && (
          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <span className="text-sm text-gray-600">{placeInfo.businessHours}</span>
          </div>
        )}

        {placeInfo.phone && (
          <div className="flex items-center gap-2.5">
            <Phone className="h-4 w-4 shrink-0 text-gray-400" />
            <a
              href={`tel:${placeInfo.phone}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {formatPhoneNumber(placeInfo.phone)}
            </a>
          </div>
        )}

        {placeInfo.url && (
          <div className="flex items-center gap-2.5">
            <Globe className="h-4 w-4 shrink-0 text-gray-400" />
            <a
              href={placeInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm text-blue-600 hover:underline"
            >
              {placeInfo.provider === "naver" ? "네이버 플레이스" : "카카오맵"} 보기
            </a>
          </div>
        )}

        {placeInfo.rating && (
          <div className="flex items-center gap-2.5">
            <Star className="h-4 w-4 shrink-0 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-gray-600">
              {placeInfo.rating.toFixed(1)}
              {placeInfo.reviewCount && (
                <span className="text-gray-400"> · 리뷰 {placeInfo.reviewCount.toLocaleString()}개</span>
              )}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
