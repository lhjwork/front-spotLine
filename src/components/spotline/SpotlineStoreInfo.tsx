"use client";

import { SpotlineStore } from "@/types";
import { MapPin, Instagram, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { logExternalLinkClick, logStoryExpand, logStoryCollapse } from "@/lib/api";

interface SpotlineStoreInfoProps {
  store: SpotlineStore;
  qrId: string;
}

export default function SpotlineStoreInfo({ store, qrId }: SpotlineStoreInfoProps) {
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
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* 매장 기본 정보 */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{store.name}</h1>

        {/* 주소 */}
        <div className="flex items-start space-x-2 mb-3">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
          <span className="text-sm text-gray-600">{store.location.address}</span>
        </div>

        {/* 설명 */}
        <p className="text-gray-700 leading-relaxed mb-4">{store.shortDescription}</p>

        {/* 외부 링크 */}
        {(store.externalLinks.instagram || store.externalLinks.website || store.externalLinks.blog) && (
          <div className="flex flex-wrap gap-3 mb-4">
            {store.externalLinks.instagram && (
              <button
                onClick={() => handleExternalLinkClick("instagram", store.externalLinks.instagram!)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-md hover:bg-gray-50 transition-colors"
              >
                <Instagram className="h-4 w-4" />
                <span>Instagram</span>
              </button>
            )}

            {store.externalLinks.website && (
              <button
                onClick={() => handleExternalLinkClick("website", store.externalLinks.website!)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-md hover:bg-gray-50 transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>웹사이트</span>
              </button>
            )}

            {store.externalLinks.blog && (
              <button
                onClick={() => handleExternalLinkClick("blog", store.externalLinks.blog!)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-md hover:bg-gray-50 transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>블로그</span>
              </button>
            )}
          </div>
        )}

        {/* SpotLine 스토리 */}
        {store.spotlineStory && (
          <div className="border-t pt-4">
            <button onClick={handleStoryToggle} className="flex items-center justify-between w-full text-left mb-2">
              <h3 className="font-medium text-gray-900">SpotLine의 관점</h3>
              {isStoryExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
            </button>

            {isStoryExpanded && <div className="text-gray-700 leading-relaxed">{store.spotlineStory}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
