"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Bookmark, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchUserLikedSpots, fetchUserSavedRoutes, fetchMyRoutes } from "@/lib/api";
import SpotPreviewCard from "@/components/shared/SpotPreviewCard";
import RoutePreviewCard from "@/components/shared/RoutePreviewCard";
import type { SpotDetailResponse, RoutePreview, MyRoute } from "@/types";

interface ProfileTabsProps {
  userId: string;
  isMe?: boolean;
}

type TabKey = "likes" | "saves" | "routes";

const TABS: { key: TabKey; label: string; icon: typeof Heart }[] = [
  { key: "likes", label: "좋아요", icon: Heart },
  { key: "saves", label: "저장", icon: Bookmark },
  { key: "routes", label: "Route", icon: MapPin },
];

export default function ProfileTabs({ userId, isMe = false }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("likes");
  const [likedSpots, setLikedSpots] = useState<SpotDetailResponse[] | null>(null);
  const [savedRoutes, setSavedRoutes] = useState<RoutePreview[] | null>(null);
  const [myRoutes, setMyRoutes] = useState<MyRoute[] | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTabData = useCallback(async (tab: TabKey) => {
    setLoading(true);
    try {
      if (tab === "likes" && !likedSpots) {
        const res = await fetchUserLikedSpots(userId);
        setLikedSpots(res.content);
      } else if (tab === "saves" && !savedRoutes) {
        const res = await fetchUserSavedRoutes(userId);
        setSavedRoutes(res.content);
      } else if (tab === "routes" && isMe && !myRoutes) {
        const res = await fetchMyRoutes();
        setMyRoutes(res.items);
      }
    } catch {
      // 데이터 로딩 실패 시 빈 상태 유지
    } finally {
      setLoading(false);
    }
  }, [userId, isMe, likedSpots, savedRoutes, myRoutes]);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab, loadTabData]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  const filteredTabs = isMe ? TABS : TABS.filter((t) => t.key !== "routes");

  return (
    <div>
      <div className="flex border-b border-gray-200">
        {filteredTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        )}

        {!loading && activeTab === "likes" && (
          likedSpots && likedSpots.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {likedSpots.map((spot) => (
                <SpotPreviewCard key={spot.id} spot={spot} />
              ))}
            </div>
          ) : (
            <EmptyState message="아직 좋아요한 Spot이 없습니다" />
          )
        )}

        {!loading && activeTab === "saves" && (
          savedRoutes && savedRoutes.length > 0 ? (
            <div className="space-y-3">
              {savedRoutes.map((route) => (
                <RoutePreviewCard key={route.id} route={route} />
              ))}
            </div>
          ) : (
            <EmptyState message="아직 저장한 Route가 없습니다" />
          )
        )}

        {!loading && activeTab === "routes" && isMe && (
          myRoutes && myRoutes.length > 0 ? (
            <div className="space-y-3">
              {myRoutes.map((route) => (
                <div
                  key={route.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <h3 className="font-medium">{route.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {route.area} · {route.spotsCount}개 Spot
                  </p>
                  <span
                    className={cn(
                      "mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                      route.status === "scheduled" && "bg-blue-50 text-blue-600",
                      route.status === "completed" && "bg-green-50 text-green-600",
                      route.status === "cancelled" && "bg-gray-100 text-gray-500"
                    )}
                  >
                    {route.status === "scheduled" ? "예정" : route.status === "completed" ? "완주" : "취소"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="아직 복제한 Route가 없습니다" />
          )
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center py-12 text-gray-400">
      <p className="text-sm">{message}</p>
    </div>
  );
}
