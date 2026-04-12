"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { fetchNotifications, markAllNotificationsAsRead } from "@/lib/api";
import NotificationListItem from "@/components/notification/NotificationListItem";
import Header from "@/components/layout/Header";
import type { NotificationItem } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";

export default function InboxPage() {
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async (pageNum: number) => {
    try {
      const res = await fetchNotifications(pageNum, 20);
      if (pageNum === 0) {
        setNotifications(res.content);
      } else {
        setNotifications((prev) => [...prev, ...res.content]);
      }
      setHasMore(!res.last);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(0);
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNotifications(nextPage);
  };

  return (
    <>
      <Header showBackButton title="알림" userId={user?.id ?? null} />
      <main className="max-w-2xl mx-auto py-4">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">알림</h2>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              모두 읽음
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-400">
            <Bell className="h-12 w-12 mb-3" />
            <p className="text-sm">아직 알림이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <NotificationListItem
                key={n.id}
                notification={n}
                onRead={handleRead}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && notifications.length > 0 && (
          <div className="flex justify-center py-4">
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              더보기
            </button>
          </div>
        )}
      </main>
    </>
  );
}
