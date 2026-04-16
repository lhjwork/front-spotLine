"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { markNotificationAsRead } from "@/lib/api";
import type { NotificationItem, NotificationType } from "@/types";
import { UserPlus, Heart, MessageCircle, Copy, CheckCircle, XCircle, type LucideIcon } from "lucide-react";

interface NotificationListItemProps {
  notification: NotificationItem;
  onRead: (id: string) => void;
}

const NOTIFICATION_CONFIG: Record<
  NotificationType,
  { icon: LucideIcon; color: string; getMessage: (actor: string) => string }
> = {
  FOLLOW: {
    icon: UserPlus,
    color: "text-blue-500",
    getMessage: (a) => `${a}님이 회원님을 팔로우합니다`,
  },
  SPOT_LIKE: {
    icon: Heart,
    color: "text-red-500",
    getMessage: (a) => `${a}님이 회원님의 Spot을 좋아합니다`,
  },
  SPOTLINE_LIKE: {
    icon: Heart,
    color: "text-red-500",
    getMessage: (a) => `${a}님이 회원님의 SpotLine을 좋아합니다`,
  },
  BLOG_LIKE: {
    icon: Heart,
    color: "text-red-500",
    getMessage: (a) => `${a}님이 회원님의 블로그를 좋아합니다`,
  },
  COMMENT: {
    icon: MessageCircle,
    color: "text-green-500",
    getMessage: (a) => `${a}님이 댓글을 남겼습니다`,
  },
  FORK: {
    icon: Copy,
    color: "text-purple-500",
    getMessage: (a) => `${a}님이 회원님의 SpotLine을 복제했습니다`,
  },
  SPOT_APPROVED: {
    icon: CheckCircle,
    color: "text-green-500",
    getMessage: () => `회원님의 Spot이 승인되었습니다`,
  },
  SPOT_REJECTED: {
    icon: XCircle,
    color: "text-red-500",
    getMessage: () => `회원님의 Spot이 반려되었습니다`,
  },
};

function getNotificationLink(n: NotificationItem): string {
  if (n.type === "FOLLOW") return `/profile/${n.actorId}`;
  if (!n.targetSlug) return "/inbox";
  switch (n.targetType) {
    case "SPOT":
      return `/spot/${n.targetSlug}`;
    case "SPOTLINE":
      return `/spotline/${n.targetSlug}`;
    case "BLOG":
      return `/blog/${n.targetSlug}`;
    default:
      return "/inbox";
  }
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

export default function NotificationListItem({
  notification,
  onRead,
}: NotificationListItemProps) {
  const router = useRouter();
  const config = NOTIFICATION_CONFIG[notification.type];
  const Icon = config.icon;

  const handleClick = async () => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        onRead(notification.id);
      } catch {}
    }
    router.push(getNotificationLink(notification));
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50",
        !notification.isRead && "bg-blue-50"
      )}
    >
      {/* Actor avatar */}
      <div className="shrink-0">
        {notification.actorAvatar ? (
          <img
            src={notification.actorAvatar}
            alt={notification.actorNickname}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
            {notification.actorNickname.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Message + time */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 leading-snug">
          {config.getMessage(notification.actorNickname)}
        </p>
        {notification.message && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">
          {getRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Type icon */}
      <div className="shrink-0">
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>
    </button>
  );
}
