"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useMyRoutesStore } from "@/store/useMyRoutesStore";
import { useAuthStore } from "@/store/useAuthStore";
import LoginBottomSheet from "@/components/auth/LoginBottomSheet";
import MyRouteCard from "@/components/route/MyRouteCard";

type TabType = "scheduled" | "completed";

export default function MyRoutesList() {
  const routes = useMyRoutesStore((s) => s.routes);
  const isLoading = useMyRoutesStore((s) => s.isLoading);
  const fetchRoutes = useMyRoutesStore((s) => s.fetchRoutes);
  const markComplete = useMyRoutesStore((s) => s.markComplete);
  const removeRoute = useMyRoutesStore((s) => s.removeRoute);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [activeTab, setActiveTab] = useState<TabType>("scheduled");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    fetchRoutes(activeTab);
  }, [isAuthenticated, activeTab, fetchRoutes]);

  const filtered = routes.filter((r) => r.status === activeTab);

  const scheduledCount = routes.filter((r) => r.status === "scheduled").length;
  const completedCount = routes.filter((r) => r.status === "completed").length;

  return (
    <>
      {/* Tabs */}
      <div className="sticky top-[53px] z-20 flex border-b border-gray-200 bg-white">
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
            {filtered.map((myRoute) => (
              <MyRouteCard
                key={myRoute.id}
                myRoute={myRoute}
                onMarkComplete={markComplete}
                onDelete={removeRoute}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <Calendar className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">
              {activeTab === "scheduled"
                ? "예정된 일정이 없습니다"
                : "완료한 일정이 없습니다"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Route를 둘러보며 내 일정에 추가해보세요
            </p>
            <Link
              href="/feed"
              className="mt-4 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700"
            >
              Route 둘러보기
            </Link>
          </div>
        )}
      </div>

      <LoginBottomSheet
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        message="로그인하고 내 일정을 확인해보세요"
      />
    </>
  );
}
