"use client";

import { useEffect, useState } from "react";
import { Calendar, List, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useMySpotLinesStore } from "@/store/useMySpotLinesStore";
import { useAuthStore } from "@/store/useAuthStore";
import LoginBottomSheet from "@/components/auth/LoginBottomSheet";
import MySpotLineCard from "@/components/spotline/MySpotLineCard";
import ScheduleStatsCard from "@/components/spotline/ScheduleStatsCard";
import ScheduleCalendar from "@/components/spotline/ScheduleCalendar";

type TabType = "scheduled" | "completed";
type ViewMode = "list" | "calendar";

export default function MySpotLinesList() {
  const spotLines = useMySpotLinesStore((s) => s.spotLines);
  const isLoading = useMySpotLinesStore((s) => s.isLoading);
  const fetchSpotLines = useMySpotLinesStore((s) => s.fetchSpotLines);
  const markComplete = useMySpotLinesStore((s) => s.markComplete);
  const removeSpotLine = useMySpotLinesStore((s) => s.removeSpotLine);
  const updateScheduledDate = useMySpotLinesStore((s) => s.updateScheduledDate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [activeTab, setActiveTab] = useState<TabType>("scheduled");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    fetchSpotLines(activeTab);
  }, [isAuthenticated, activeTab, fetchSpotLines]);

  // Reset calendar selection on tab change
  useEffect(() => {
    setSelectedDate(null);
  }, [activeTab]);

  const filtered = spotLines.filter((r) => {
    if (r.status !== activeTab) return false;
    if (selectedDate && activeTab === "scheduled") {
      return r.scheduledDate === selectedDate;
    }
    return true;
  });

  const scheduledCount = spotLines.filter((r) => r.status === "scheduled").length;
  const completedCount = spotLines.filter((r) => r.status === "completed").length;

  return (
    <>
      {/* Stats card */}
      {!isLoading && spotLines.length > 0 && (
        <div className="px-4 pt-4">
          <ScheduleStatsCard spotLines={spotLines} />
        </div>
      )}

      {/* Tabs + View toggle */}
      <div className="sticky top-[53px] z-20 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <div className="flex flex-1">
            {([
              { key: "scheduled" as TabType, label: "예정", count: scheduledCount },
              { key: "completed" as TabType, label: "완료", count: completedCount },
            ]).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex-1 py-3 text-center text-sm font-medium transition-colors",
                  activeTab === key
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* View toggle */}
          {activeTab === "scheduled" && (
            <div className="flex gap-1 pr-4">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded-lg p-1.5 transition-colors",
                  viewMode === "list"
                    ? "bg-purple-100 text-purple-600"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "rounded-lg p-1.5 transition-colors",
                  viewMode === "calendar"
                    ? "bg-purple-100 text-purple-600"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Calendar view */}
      {activeTab === "scheduled" && viewMode === "calendar" && (
        <div className="px-4 pt-4">
          <ScheduleCalendar
            spotLines={spotLines}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
          {selectedDate && filtered.length === 0 && (
            <p className="mt-3 text-center text-sm text-gray-400">
              이 날짜에 예정된 일정이 없습니다
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((mySpotLine) => (
              <MySpotLineCard
                key={mySpotLine.id}
                mySpotLine={mySpotLine}
                onMarkComplete={markComplete}
                onDelete={removeSpotLine}
                onDateChange={updateScheduledDate}
              />
            ))}
          </div>
        ) : !selectedDate ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Calendar className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">
              {activeTab === "scheduled"
                ? "예정된 일정이 없습니다"
                : "완료한 일정이 없습니다"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              SpotLine을 둘러보며 내 일정에 추가해보세요
            </p>
            <Link
              href="/feed"
              className="mt-4 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700"
            >
              SpotLine 둘러보기
            </Link>
          </div>
        ) : null}
      </div>

      <LoginBottomSheet
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        message="로그인하고 내 일정을 확인해보세요"
      />
    </>
  );
}
