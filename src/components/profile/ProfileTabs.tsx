"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Heart, Bookmark, MapPinCheck, MapPin, Map, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchUserLikedSpots,
  fetchUserSavedSpotLines,
  fetchMySpotLines,
  fetchMySpots,
  fetchVisitedSpots,
  fetchMyCheckins,
  fetchUserSpotLines,
  fetchUserSpots,
  fetchUserBlogs,
} from "@/lib/api";
import SpotPreviewCard from "@/components/shared/SpotPreviewCard";
import SpotLinePreviewCard from "@/components/shared/SpotLinePreviewCard";
import type { SpotDetailResponse, SpotLinePreview, MySpotLine, CheckinListItem, BlogListItem } from "@/types";

interface ProfileTabsProps {
  userId: string;
  isMe?: boolean;
}

type TabKey = "spotlines" | "my-spots" | "blogs" | "likes" | "saves" | "visited";

const TABS: { key: TabKey; label: string; icon: typeof Heart }[] = [
  { key: "spotlines", label: "SpotLine", icon: MapPin },
  { key: "my-spots", label: "Spot", icon: Map },
  { key: "blogs", label: "블로그", icon: BookOpen },
  { key: "likes", label: "좋아요", icon: Heart },
  { key: "saves", label: "저장", icon: Bookmark },
  { key: "visited", label: "체크인", icon: MapPinCheck },
];

export default function ProfileTabs({ userId, isMe = false }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("spotlines");
  const [likedSpots, setLikedSpots] = useState<SpotDetailResponse[] | null>(null);
  const [savedSpotLines, setSavedSpotLines] = useState<SpotLinePreview[] | null>(null);
  const [mySpotLines, setMySpotLines] = useState<MySpotLine[] | null>(null);
  const [userSpotLines, setUserSpotLines] = useState<SpotLinePreview[] | null>(null);
  const [visitedSpots, setVisitedSpots] = useState<SpotDetailResponse[] | null>(null);
  const [checkins, setCheckins] = useState<CheckinListItem[] | null>(null);
  const [mySpots, setMySpots] = useState<SpotDetailResponse[] | null>(null);
  const [userSpots, setUserSpots] = useState<SpotDetailResponse[] | null>(null);
  const [userBlogs, setUserBlogs] = useState<BlogListItem[] | null>(null);
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
      } else if (tab === "visited" && isMe && !checkins) {
        const res = await fetchMyCheckins();
        setCheckins(res.content);
      } else if (tab === "visited" && !isMe && !visitedSpots) {
        const res = await fetchVisitedSpots(userId);
        setVisitedSpots(res.content);
      } else if (tab === "spotlines" && isMe && !mySpotLines) {
        const res = await fetchMySpotLines();
        setMySpotLines(res.items);
      } else if (tab === "spotlines" && !isMe && !userSpotLines) {
        const res = await fetchUserSpotLines(userId);
        setUserSpotLines(res.items);
      } else if (tab === "my-spots" && isMe && !mySpots) {
        const res = await fetchMySpots();
        setMySpots(res.content);
      } else if (tab === "my-spots" && !isMe && !userSpots) {
        const res = await fetchUserSpots(userId);
        setUserSpots(res.items);
      } else if (tab === "blogs" && !userBlogs) {
        const res = await fetchUserBlogs(userId);
        setUserBlogs(res.items);
      }
    } catch {
      // 데이터 로딩 실패 시 빈 상태 유지
    } finally {
      setLoading(false);
    }
  }, [userId, isMe, likedSpots, savedSpotLines, visitedSpots, checkins, mySpotLines, userSpotLines, mySpots, userSpots, userBlogs]);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab, loadTabData]);

  return (
    <div>
      <div className="flex border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
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

        {!loading && activeTab === "visited" && isMe && (
          checkins && checkins.length > 0 ? (
            <CheckinHistoryList checkins={checkins} />
          ) : (
            <EmptyState message="아직 체크인한 Spot이 없습니다" />
          )
        )}

        {!loading && activeTab === "visited" && !isMe && (
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
            <EmptyState message="아직 생성한 SpotLine이 없습니다" />
          )
        )}

        {!loading && activeTab === "spotlines" && !isMe && (
          userSpotLines && userSpotLines.length > 0 ? (
            <div className="space-y-3">
              {userSpotLines.map((spotLine) => (
                <SpotLinePreviewCard key={spotLine.id} spotLine={spotLine} />
              ))}
            </div>
          ) : (
            <EmptyState message="아직 생성한 SpotLine이 없습니다" />
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

        {!loading && activeTab === "my-spots" && !isMe && (
          userSpots && userSpots.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {userSpots.map((spot) => (
                <SpotPreviewCard key={spot.id} spot={spot} />
              ))}
            </div>
          ) : (
            <EmptyState message="아직 등록한 Spot이 없습니다" />
          )
        )}

        {!loading && activeTab === "blogs" && (
          userBlogs && userBlogs.length > 0 ? (
            <div className="space-y-3">
              {userBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="block rounded-xl border border-gray-200 p-4 hover:bg-gray-50"
                >
                  <h3 className="font-medium text-gray-900">{blog.title}</h3>
                  {blog.summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">{blog.summary}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <span>{blog.spotLineTitle}</span>
                    <span>조회 {blog.viewsCount}</span>
                    {blog.publishedAt && (
                      <span>{new Date(blog.publishedAt).toLocaleDateString("ko-KR")}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState message="아직 작성한 블로그가 없습니다" />
          )
        )}
      </div>
    </div>
  );
}

function CheckinHistoryList({ checkins }: { checkins: CheckinListItem[] }) {
  const grouped: [string, CheckinListItem[]][] = useMemo(() => {
    const map: Record<string, CheckinListItem[]> = {};
    for (const item of checkins) {
      const date = new Date(item.createdAt).toLocaleDateString("ko-KR", {
        year: "numeric", month: "long", day: "numeric",
      });
      if (!map[date]) map[date] = [];
      map[date].push(item);
    }
    return Object.entries(map);
  }, [checkins]);

  return (
    <div className="space-y-4">
      {grouped.map(([date, items]) => (
        <div key={date}>
          <h4 className="mb-2 text-xs font-medium text-gray-500">{date}</h4>
          <div className="space-y-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.spotSlug ? `/spot/${item.spotSlug}` : "#"}
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
              >
                <MapPinCheck className={cn("h-5 w-5 shrink-0", item.verified ? "text-green-500" : "text-gray-400")} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{item.spotTitle ?? "Spot"}</p>
                  {item.memo && <p className="truncate text-xs text-gray-500">{item.memo}</p>}
                </div>
                {item.verified && (
                  <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">GPS 인증</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
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
