"use client";

import { SpotlineStore } from "@/types";
import { Instagram, Globe, FileText } from "lucide-react";
import { logExternalLinkClick } from "@/lib/api";
import { useState } from "react";

interface SpotlineStoreInfoProps {
  store: SpotlineStore;
  qrId: string;
}

export default function SpotlineStoreInfo({ store, qrId }: SpotlineStoreInfoProps) {
  const [showStory, setShowStory] = useState(false);

  const handleExternalLinkClick = (linkType: string) => {
    logExternalLinkClick(qrId, store.id);
  };

  return (
    <div className="bg-white">
      {/* 대표 이미지 */}
      <div className="relative w-full h-64 md:h-80">
        <img
          src={store.representativeImage}
          alt={store.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-image.jpg";
          }}
        />
      </div>

      {/* 매장 정보 */}
      <div className="p-6">
        {/* 매장명 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{store.name}</h1>

        {/* 한 문장 설명 */}
        <p className="text-gray-700 text-base leading-relaxed mb-4">{store.shortDescription}</p>

        {/* 외부 링크 (아이콘만) */}
        <div className="flex items-center space-x-4 mb-6">
          {store.externalLinks.instagram && (
            <button
              onClick={() => {
                handleExternalLinkClick("instagram");
                window.open(store.externalLinks.instagram, "_blank", "noopener,noreferrer");
              }}
              className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6" />
            </button>
          )}

          {store.externalLinks.blog && (
            <button
              onClick={() => {
                handleExternalLinkClick("blog");
                window.open(store.externalLinks.blog, "_blank", "noopener,noreferrer");
              }}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Blog"
            >
              <FileText className="h-6 w-6" />
            </button>
          )}

          {store.externalLinks.website && (
            <button
              onClick={() => {
                handleExternalLinkClick("website");
                window.open(store.externalLinks.website, "_blank", "noopener,noreferrer");
              }}
              className="p-2 text-gray-600 hover:text-green-600 transition-colors"
              aria-label="Website"
            >
              <Globe className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* SpotLine 스토리 (접힘 UI) */}
        {store.spotlineStory && (
          <div className="border-t pt-4">
            <button onClick={() => setShowStory(!showStory)} className="flex items-center justify-between w-full text-left text-gray-700 hover:text-gray-900 transition-colors">
              <span className="font-medium">SpotLine의 관점</span>
              <span className="text-sm text-gray-500">{showStory ? "접기" : "펼치기"}</span>
            </button>

            {showStory && <div className="mt-3 text-sm text-gray-600 leading-relaxed">{store.spotlineStory}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
