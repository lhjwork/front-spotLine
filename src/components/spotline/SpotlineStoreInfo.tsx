"use client";

import { SpotlineStore } from "@/types";
import { MapPin, Instagram, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { logExternalLinkClick, logStoryExpand, logStoryCollapse } from "@/lib/api";

interface SpotlineStoreInfoProps {
  store: SpotlineStore;
  qrId: string;
  isDemo?: boolean;
}

export default function SpotlineStoreInfo({ store, qrId, isDemo = false }: SpotlineStoreInfoProps) {
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);

  const handleExternalLinkClick = (linkType: string, url: string) => {
    logExternalLinkClick(qrId, store.id, linkType);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleStoryToggle = () => {
    const newState = !isStoryExpanded;
    setIsStoryExpanded(newState);

    if (newState) {
      logStoryExpand(qrId, store.id, "main_story");
    } else {
      logStoryCollapse(qrId, store.id, "main_story");
    }
  };

  return (
    <div className="bg-white">
      {/* 매장 대표 이미지 */}
      <div className="relative h-64 md:h-80">
        <img src={store.representativeImage} alt={store.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{store.name}</h1>
          <p className="text-lg opacity-90">{store.shortDescription}</p>
        </div>
      </div>

      {/* 매장 정보 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* 기본 정보 */}
          <div className="md:col-span-2">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-900 font-medium">{store.location.address}</p>
                  {store.location.mapLink && (
                    <button onClick={() => handleExternalLinkClick("map", store.location.mapLink)} className="text-blue-600 hover:text-blue-700 text-sm mt-1 inline-flex items-center">
                      지도에서 보기
                      <MapPin className="h-3 w-3 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* SpotLine 스토리 */}
            {store.spotlineStory && (
              <div className="bg-blue-50 rounded-lg p-4">
                <button onClick={handleStoryToggle} className="flex items-center justify-between w-full text-left">
                  <h3 className="font-semibold text-blue-900">SpotLine의 관점</h3>
                  {isStoryExpanded ? <ChevronUp className="h-5 w-5 text-blue-600" /> : <ChevronDown className="h-5 w-5 text-blue-600" />}
                </button>

                {isStoryExpanded && <div className="mt-3 text-blue-800 text-sm leading-relaxed">{store.spotlineStory}</div>}
              </div>
            )}
          </div>

          {/* 외부 링크 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">더 알아보기</h3>
            <div className="space-y-3">
              {store.externalLinks.instagram && (
                <button
                  onClick={() => handleExternalLinkClick("instagram", store.externalLinks.instagram!)}
                  className="flex items-center space-x-3 w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="font-medium">Instagram</span>
                </button>
              )}

              {store.externalLinks.website && (
                <button
                  onClick={() => handleExternalLinkClick("website", store.externalLinks.website!)}
                  className="flex items-center space-x-3 w-full p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <Globe className="h-5 w-5" />
                  <span className="font-medium">웹사이트</span>
                </button>
              )}

              {store.externalLinks.blog && (
                <button
                  onClick={() => handleExternalLinkClick("blog", store.externalLinks.blog!)}
                  className="flex items-center space-x-3 w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Globe className="h-5 w-5" />
                  <span className="font-medium">블로그</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
