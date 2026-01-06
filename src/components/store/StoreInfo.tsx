"use client";

import { Store } from "@/types";
import { MapPin, Clock, Phone, Globe, Instagram } from "lucide-react";
import { formatBusinessHours, isCurrentlyOpen, getCategoryLabel, getCategoryColor, formatPhoneNumber } from "@/lib/utils";

interface StoreInfoProps {
  store: Store;
}

export default function StoreInfo({ store }: StoreInfoProps) {
  const isOpen = isCurrentlyOpen(store.businessHours);
  const today = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "Asia/Seoul",
    })
    .toLowerCase();
  const todayHours = store.businessHours?.[today];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* 매장 기본 정보 */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(store.category)}`}>{getCategoryLabel(store.category)}</span>
        </div>

        {/* 영업 상태 */}
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className={`text-sm font-medium ${isOpen ? "text-green-600" : "text-red-600"}`}>{isOpen ? "영업 중" : "영업 종료"}</span>
          {todayHours && <span className="text-sm text-gray-600">{formatBusinessHours(todayHours)}</span>}
        </div>

        {/* 주소 */}
        <div className="flex items-start space-x-2 mb-3">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
          <span className="text-sm text-gray-600">{store.location.address}</span>
        </div>

        {/* 설명 */}
        {store.description && <p className="text-gray-700 text-sm leading-relaxed mb-4">{store.description}</p>}

        {/* 태그 */}
        {store.tags && store.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {store.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 연락처 정보 */}
        {store.contact && (
          <div className="space-y-2">
            {store.contact.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <a href={`tel:${store.contact.phone}`} className="text-sm text-blue-600 hover:underline">
                  {formatPhoneNumber(store.contact.phone)}
                </a>
              </div>
            )}

            {store.contact.website && (
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <a href={store.contact.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                  웹사이트 방문
                </a>
              </div>
            )}

            {store.contact.instagram && (
              <div className="flex items-center space-x-2">
                <Instagram className="h-4 w-4 text-gray-500" />
                <a href={`https://instagram.com/${store.contact.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                  {store.contact.instagram}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
