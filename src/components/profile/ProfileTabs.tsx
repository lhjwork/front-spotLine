"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Heart, Bookmark, MapPinCheck, MapPin, Map, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchUserLikedSpots, fetchUserSavedSpotLines, fetchMySpotLines, fetchMySpots, fetchVisitedSpots } from "@/lib/api";
import SpotPreviewCard from "@/components/shared/SpotPreviewCard";
import SpotLinePreviewCard from "@/components/shared/SpotLinePreviewCard";
import type { SpotDetailResponse, SpotLinePreview, MySpotLine } from "@/types";

interface ProfileTabsProps {
  userId: string;
  isMe?: boolean;
}

type TabKey = "likes" | "saves" | "visited" | "spotlines" | "my-spots" | "blogs";

const TABS: { key: TabKey; label: string; icon: typeof Heart; meOnly?: boolean }[] = [
  { key: "likes", label: "좋아요", icon: Heart },
  { key: "saves", label: "저장", icon: Bookmark },
  { key: "visited", label: "방문", icon: MapPinCheck },
  { key: "spotlines", label: "SpotLine", icon: MapPin, meOnly: true },
  { key: "my-spots", label: "내 Spot", icon: Map, meOnly: true },
  { key: "blogs", label: "블로그", icon: BookOpen, meOnly: true },
];

export default function ProfileTabs({ userId, isMe = false }: ProfileTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("likes");
  const [likedSpots, setLikedSpots] = useState<SpotDetailResponse[] | null>(null);
  const [savedSpotLines, setSavedSpotLines] = useState<SpotLinePreview[] | null>(null);
  const [mySpotLines, setMySpotLines] = useState<MySpotLine[] | null>(null);
  const [visitedSpots, setVisitedSpots] = useState<SpotDetailResponse[] | null>(null);
  const [mySpots, setMySpots] = useState<SpotDetailResponse[] | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTabData = useCallback(async (tab: TabKey) => {
    setLoading(true);
    try {
      if (tab === "likes" && !likedSpots) {
        const res = await fetchUserLikedSpots(userId);
        setLikedSpots(res.content);
      } else if (tab === "saves" && !savedSpotLines) {
        const res = await fetchUserSavedSpotLines(userId);
        setSavedSpotLines(res.content);
      } else if (tab === "visited" && !visitedSpots) {
        const res = await fetchVisitedSpots(userId);
        setVisitedSpots(res.content);
      } else if (tab === "spotlines" && isMe && !mySpotLines) {
        const res = await fetchMySpotLines();
        setMySpotLines(res.items);
      } else if (tab === "my-spots" && isMe && !mySpots) {
        const res = await fetchMySpots();
        setMySpots(res.content);
      }
    } catch {
      // 데이터 로딩 실패 시 빈 상태 유지
    } finally {
      setLoading(false);
    }
  }, [userId, isMe, likedSpots, savedSpotLines, visitedSpots, mySpotLines, mySpots]);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab, loadTabData]);

  const handleTabChange = (tab: TabKey) => {
    if (tab === "blogs") {
      router.push("/my-blogs");
      return;
    }
    setActiveTab(tab);
  };

  const filteredTabs = isMe ? TABS : TABS.filter((t) => !t.meOnly);

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
          savedSpotLines && savedSpotLines.length > 0 ? (
            <div className="space-y-3">
              {savedSpotLines.map((spotLine) => (
                <SpotLinePreviewCard key={spotLine.id} spotLine={spotLine} />
              ))}
            </div>
          ) : (
            <EmptyState message="아직 저장한 SpotLine이 없습니다" />
          )
        )}

        {!loading && activeTab === "visited" && (
          visitedSpots && visitedSpots.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {visitedSpots.map((spot) => (
                <SpotPreviewCard key={spot.id} spot={spot} />
              ))}
            </div>
          ) : (
            <EmptyState message="아직 방문한 Spot이 없습니다" />
          )
        )}

        {!loading && activeTab === "spotlines" && isMe && (
          mySpotLines && mySpotLines.length > 0 ? (
            <div className="space-y-3">
              {mySpotLines.map((spotLine) => (
                <div key={spotLine.id} className="rounded-xl border border-gray-200 p-4">
                  <h3 className="font-medium">{spotLine.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {spotLine.area} · {spotLine.spotsCount}개 Spot
                  </p>
                  <span
                    className={cn(
                      "mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                      spotLine.status === "scheduled" && "bg-blue-50 text-blue-600",
                      spotLine.status === "completed" && "bg-green-50 text-green-600",
                      spotLine.status === "cancelled" && "bg-gray-100 text-gray-500"
                    )}
                  >
                    {spotLine.status === "scheduled" ? "예정" : spotLine.status === "completed" ? "완주" : "취소"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="아직 복제한 SpotLine이 없습니다" />
          )
        )}

        {!loading && activeTab === "my-spots" && isMe && (
          mySpots && mySpots.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {mySpots.map((spot) => (
                <SpotPreviewCard key={spot.id} spot={spot} />
              ))}
            </div>
          ) : (
            <EmptyState message="아직 등록한 Spot이 없습니다" />
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
