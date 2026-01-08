"use client";

import { SpotlineStore } from "@/types";
import { MapPin, Instagram, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { logExternalLinkClick, logStoryExpand, logStoryCollapse } from "@/lib/api";

interface SpotlineStoreInfoProps {
  store: SpotlineStore;
  qrId: string;
  isDemoMode?: boolean;
}

export default function SpotlineStoreInfo({ store, qrId, isDemoMode = false }: SpotlineStoreInfoProps) {
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);

  const handleExternalLinkClick = (linkType: string, url: string) => {
    if (isDemoMode) {
      // 데모에서는 통계 수집하지 않음
      console.log(`데모 외부 링크 클릭: ${linkType} (통계 수집하지 않음)`);
    } else {
      // 실제 운영에서는 통계 수집
      logExternalLinkClick(qrId, store.id, linkType);
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleStoryToggle = () => {
    const newState = !isStoryExpanded;
    setIsStoryExpanded(newState);

    if (isDemoMode) {
      // 데모에서는 통계 수집하지 않음
      console.log(`데모 스토리 ${newState ? "확장" : "접기"}: ${qrId} (통계 수집하지 않음)`);
    } else {
      // 실제 운영에서는 통계 수집
      if (newState) {
        logStoryExpand(qrId, store.id, "main_story");
      } else {
        logStoryCollapse(qrId, store.id, "main_story");
      }
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
        {store.externalLinks && store.externalLinks.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {store.externalLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => handleExternalLinkClick(link.type, link.url)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-md hover:bg-gray-50 transition-colors"
              >
                {link.type === "instagram" && <Instagram className="h-4 w-4" />}
                {(link.type === "website" || link.type === "blog") && <Globe className="h-4 w-4" />}
                <span>{link.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* SpotLine 스토리 */}
        {store.spotlineStory && (
          <div className="border-t pt-4">
            <button onClick={handleStoryToggle} className="flex items-center justify-between w-full text-left mb-2">
              <h3 className="font-medium text-gray-900">
                {typeof store.spotlineStory === 'object' && store.spotlineStory.title 
                  ? store.spotlineStory.title 
                  : "SpotLine의 관점"}
              </h3>
              {isStoryExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
            </button>

            {isStoryExpanded && (
              <div className="text-gray-700 leading-relaxed">
                {typeof store.spotlineStory === 'string' 
                  ? store.spotlineStory 
                  : store.spotlineStory.content}
                {typeof store.spotlineStory === 'object' && store.spotlineStory.tags && store.spotlineStory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {store.spotlineStory.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
