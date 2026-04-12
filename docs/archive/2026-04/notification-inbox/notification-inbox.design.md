# Notification Inbox Design Document

> **Summary**: 소셜 활동(팔로우, 좋아요, 댓글, 포크) 알림 시스템 + 인박스 페이지 설계
>
> **Project**: front-spotLine + springboot-spotLine-backend
> **Author**: AI Assistant
> **Date**: 2026-04-12
> **Status**: Draft
> **Planning Doc**: [notification-inbox.plan.md](../../01-plan/features/notification-inbox.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- Backend: Notification 엔티티 + CRUD API + 4개 서비스 트리거 통합
- Frontend: NotificationBell (헤더) + InboxPage (`/inbox`) + NotificationItem
- 자기 자신 알림 제외, 5분 중복 방지, 폴링 30초

### 1.2 Design Principles

- **Non-intrusive**: 기존 서비스 코드 변경 최소화 (notificationService.create() 1줄 추가)
- **Graceful Degradation**: 알림 생성 실패해도 원래 동작에 영향 없음 (try-catch)
- **Progressive Enhancement**: 로그인 안 한 사용자에게는 벨 아이콘 미표시

---

## 2. Backend Changes (springboot-spotLine-backend)

### Item 1: NotificationType Enum

**File**: `src/main/java/com/spotline/api/domain/enums/NotificationType.java` (NEW)

```java
package com.spotline.api.domain.enums;

public enum NotificationType {
    FOLLOW,
    SPOT_LIKE,
    SPOTLINE_LIKE,
    BLOG_LIKE,
    COMMENT,
    FORK
}
```

### Item 2: Notification Entity

**File**: `src/main/java/com/spotline/api/domain/entity/Notification.java` (NEW)

```java
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notif_recipient", columnList = "recipientId, createdAt DESC"),
    @Index(name = "idx_notif_unread", columnList = "recipientId, isRead")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String recipientId;    // 알림 수신자 (콘텐츠 소유자)

    @Column(nullable = false)
    private String actorId;        // 알림 발생자 (액션 수행자)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(length = 30)
    private String targetType;     // "SPOT", "SPOTLINE", "BLOG"

    private String targetId;       // 대상 엔티티 UUID (String)

    @Column(length = 255)
    private String targetSlug;     // 프론트 라우팅용 slug

    @Builder.Default
    private Boolean isRead = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### Item 3: NotificationRepository

**File**: `src/main/java/com/spotline/api/domain/repository/NotificationRepository.java` (NEW)

```java
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId, Pageable pageable);

    long countByRecipientIdAndIsReadFalse(String recipientId);

    // 중복 방지 체크: 같은 actor + type + target이 5분 내 존재하는지
    boolean existsByActorIdAndTypeAndTargetTypeAndTargetIdAndCreatedAtAfter(
        String actorId, NotificationType type, String targetType, String targetId, LocalDateTime after);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientId = :recipientId AND n.isRead = false")
    int markAllAsRead(@Param("recipientId") String recipientId);
}
```

### Item 4: NotificationService

**File**: `src/main/java/com/spotline/api/service/NotificationService.java` (NEW)

```java
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * 알림 생성 (자기 자신 제외 + 5분 중복 방지)
     */
    public void create(String actorId, String recipientId, NotificationType type,
                       String targetType, String targetId, String targetSlug) {
        // 자기 자신 제외
        if (actorId.equals(recipientId)) return;

        // 5분 중복 방지
        LocalDateTime fiveMinAgo = LocalDateTime.now().minusMinutes(5);
        if (notificationRepository.existsByActorIdAndTypeAndTargetTypeAndTargetIdAndCreatedAtAfter(
                actorId, type, targetType, targetId, fiveMinAgo)) {
            return;
        }

        notificationRepository.save(Notification.builder()
            .recipientId(recipientId)
            .actorId(actorId)
            .type(type)
            .targetType(targetType)
            .targetId(targetId)
            .targetSlug(targetSlug)
            .build());
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(String userId, Pageable pageable) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable)
            .map(n -> {
                User actor = userRepository.findById(n.getActorId()).orElse(null);
                return NotificationResponse.from(n, actor);
            });
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    public void markAsRead(String userId, UUID notificationId) {
        Notification n = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!n.getRecipientId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    public int markAllAsRead(String userId) {
        return notificationRepository.markAllAsRead(userId);
    }

    public void delete(String userId, UUID notificationId) {
        Notification n = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!n.getRecipientId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        notificationRepository.delete(n);
    }
}
```

### Item 5: NotificationResponse DTO

**File**: `src/main/java/com/spotline/api/dto/response/NotificationResponse.java` (NEW)

```java
@Data @Builder
public class NotificationResponse {
    private UUID id;
    private String type;          // "FOLLOW", "SPOT_LIKE", etc.
    private String targetType;    // "SPOT", "SPOTLINE", "BLOG"
    private String targetId;
    private String targetSlug;
    private Boolean isRead;
    private LocalDateTime createdAt;

    // Actor info
    private String actorId;
    private String actorNickname;
    private String actorAvatar;

    public static NotificationResponse from(Notification n, User actor) {
        return NotificationResponse.builder()
            .id(n.getId())
            .type(n.getType().name())
            .targetType(n.getTargetType())
            .targetId(n.getTargetId())
            .targetSlug(n.getTargetSlug())
            .isRead(n.getIsRead())
            .createdAt(n.getCreatedAt())
            .actorId(n.getActorId())
            .actorNickname(actor != null ? actor.getNickname() : "알 수 없음")
            .actorAvatar(actor != null ? actor.getAvatar() : null)
            .build();
    }
}
```

### Item 6: NotificationController

**File**: `src/main/java/com/spotline/api/controller/NotificationController.java` (NEW)

```java
@RestController
@RequestMapping("/api/v2/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification", description = "알림 API")
public class NotificationController {

    private final NotificationService notificationService;

    // GET /api/v2/notifications?page=0&size=20
    @GetMapping
    public Page<NotificationResponse> getNotifications(
            @RequestAttribute("userId") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return notificationService.getNotifications(userId, PageRequest.of(page, Math.min(size, 50)));
    }

    // GET /api/v2/notifications/unread-count
    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(@RequestAttribute("userId") String userId) {
        return Map.of("count", notificationService.getUnreadCount(userId));
    }

    // PUT /api/v2/notifications/{id}/read
    @PutMapping("/{id}/read")
    public void markAsRead(@RequestAttribute("userId") String userId, @PathVariable UUID id) {
        notificationService.markAsRead(userId, id);
    }

    // PUT /api/v2/notifications/read-all
    @PutMapping("/read-all")
    public Map<String, Integer> markAllAsRead(@RequestAttribute("userId") String userId) {
        return Map.of("updated", notificationService.markAllAsRead(userId));
    }

    // DELETE /api/v2/notifications/{id}
    @DeleteMapping("/{id}")
    public void deleteNotification(@RequestAttribute("userId") String userId, @PathVariable UUID id) {
        notificationService.delete(userId, id);
    }
}
```

### Item 7: 트리거 통합 (4개 서비스 MODIFY)

각 서비스에 `NotificationService` 주입 + 알림 생성 1줄 추가. try-catch로 감싸서 알림 실패 시 원래 동작에 영향 없도록.

**FollowService.java** — `follow()` 메서드 끝에 추가:
```java
// 기존 코드: return new FollowResponse(true, following.getFollowersCount());
// 추가:
try {
    notificationService.create(followerId, followingId, NotificationType.FOLLOW,
        "USER", followingId, null);
} catch (Exception ignored) {}
return new FollowResponse(true, following.getFollowersCount());
```

**SocialService.java** — `toggleSpotLike()` 좋아요 생성 시 (liked=true):
```java
if (liked) {
    try {
        notificationService.create(userId, spot.getCreatorId(), NotificationType.SPOT_LIKE,
            "SPOT", spotId.toString(), spot.getSlug());
    } catch (Exception ignored) {}
}
```

동일 패턴으로:
- `toggleSpotLineLike()` → `SPOTLINE_LIKE`, recipientId = `spotLine.getCreatorId()`
- `toggleBlogLike()` → `BLOG_LIKE`, recipientId = `blog.getUserId()`

**CommentService.java** — `createComment()` 끝에 추가:
```java
// 댓글 대상의 소유자에게 알림
try {
    String ownerId = getTargetOwnerId(request.getTargetType(), request.getTargetId());
    String slug = getTargetSlug(request.getTargetType(), request.getTargetId());
    if (ownerId != null) {
        notificationService.create(userId, ownerId, NotificationType.COMMENT,
            request.getTargetType().name(), request.getTargetId().toString(), slug);
    }
} catch (Exception ignored) {}
```

헬퍼 메서드 추가:
```java
private String getTargetOwnerId(CommentTargetType type, UUID targetId) {
    return switch (type) {
        case SPOT -> spotRepository.findById(targetId).map(Spot::getCreatorId).orElse(null);
        case SPOTLINE -> spotLineRepository.findById(targetId).map(SpotLine::getCreatorId).orElse(null);
        case BLOG -> blogRepository.findById(targetId).map(Blog::getUserId).orElse(null);
    };
}

private String getTargetSlug(CommentTargetType type, UUID targetId) {
    return switch (type) {
        case SPOT -> spotRepository.findById(targetId).map(Spot::getSlug).orElse(null);
        case SPOTLINE -> spotLineRepository.findById(targetId).map(SpotLine::getSlug).orElse(null);
        case BLOG -> blogRepository.findById(targetId).map(Blog::getSlug).orElse(null);
    };
}
```

**UserSpotLineService.java** — `replicate()` 메서드에 추가:
```java
try {
    notificationService.create(userId, spotLine.getCreatorId(), NotificationType.FORK,
        "SPOTLINE", spotLineId.toString(), spotLine.getSlug());
} catch (Exception ignored) {}
```

---

## 3. Frontend Changes (front-spotLine)

### Item 8: Frontend 타입 확장

**File**: `src/types/index.ts` (MODIFY)

```typescript
// NEW: Notification types
export type NotificationType = "FOLLOW" | "SPOT_LIKE" | "SPOTLINE_LIKE" | "BLOG_LIKE" | "COMMENT" | "FORK";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  targetType: string | null;     // "SPOT" | "SPOTLINE" | "BLOG" | "USER"
  targetId: string | null;
  targetSlug: string | null;
  isRead: boolean;
  createdAt: string;             // ISO timestamp
  actorId: string;
  actorNickname: string;
  actorAvatar: string | null;
}
```

### Item 9: API 함수

**File**: `src/lib/api.ts` (MODIFY)

```typescript
// ==================== Notification API ====================

export const fetchNotifications = async (
  page = 0, size = 20
): Promise<PaginatedResponse<NotificationItem>> => {
  const res = await apiV2.get<PaginatedResponse<NotificationItem>>(
    "/notifications", { params: { page, size } }
  );
  return res.data;
};

export const fetchUnreadCount = async (): Promise<number> => {
  const res = await apiV2.get<{ count: number }>("/notifications/unread-count");
  return res.data.count;
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await apiV2.put(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<{ updated: number }> => {
  const res = await apiV2.put<{ updated: number }>("/notifications/read-all");
  return res.data;
};

export const deleteNotification = async (id: string): Promise<void> => {
  await apiV2.delete(`/notifications/${id}`);
};
```

### Item 10: NotificationBell 컴포넌트

**File**: `src/components/notification/NotificationBell.tsx` (NEW)

```typescript
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchUnreadCount } from "@/lib/api";

interface NotificationBellProps {
  userId: string | null;  // null이면 미표시
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchCount = async () => {
      try {
        const count = await fetchUnreadCount();
        setUnreadCount(count);
      } catch {}
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000); // 30초 폴링
    return () => clearInterval(interval);
  }, [userId]);

  if (!userId) return null;

  return (
    <Link
      href="/inbox"
      className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors"
      aria-label="알림"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className={cn(
          "absolute -top-0.5 -right-0.5 flex items-center justify-center",
          "min-w-[18px] h-[18px] px-1 rounded-full",
          "bg-red-500 text-white text-[10px] font-bold"
        )}>
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
```

### Item 11: Header 통합

**File**: `src/components/layout/Header.tsx` (MODIFY)

기존 검색 아이콘 왼쪽에 NotificationBell 추가:

```tsx
import NotificationBell from "@/components/notification/NotificationBell";

// Props 확장
interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
  userId?: string | null;  // NEW: 로그인 사용자 ID
}

// 오른쪽 영역 변경:
<div className="flex items-center gap-1">
  <NotificationBell userId={userId ?? null} />
  <Link href="/search" className="p-2 text-gray-500 hover:text-gray-700 transition-colors" aria-label="검색">
    <Search className="h-5 w-5" />
  </Link>
</div>
```

### Item 12: InboxPage

**File**: `src/app/inbox/page.tsx` (NEW)

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";
import { CheckCheck } from "lucide-react";
import { fetchNotifications, markAllNotificationsAsRead } from "@/lib/api";
import NotificationListItem from "@/components/notification/NotificationListItem";
import type { NotificationItem } from "@/types";

export default function InboxPage() {
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
        setNotifications(prev => [...prev, ...res.content]);
      }
      setHasMore(!res.last);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifications(0); }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNotifications(nextPage);
  };

  // 렌더링: 헤더 + "모두 읽음" 버튼 + 알림 리스트 + "더보기" 버튼
  // 빈 상태: "아직 알림이 없습니다" 메시지
}
```

UI 구조:
- 상단: "알림" 제목 + "모두 읽음" 버튼 (CheckCheck 아이콘)
- 리스트: NotificationListItem 반복
- 하단: `hasMore`이면 "더보기" 버튼
- 빈 상태: Bell 아이콘 + "아직 알림이 없습니다" 텍스트
- 스타일: `max-w-2xl mx-auto px-4 py-6`

### Item 13: NotificationListItem 컴포넌트

**File**: `src/components/notification/NotificationListItem.tsx` (NEW)

```typescript
"use client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { markNotificationAsRead } from "@/lib/api";
import type { NotificationItem } from "@/types";
import { UserPlus, Heart, MessageCircle, Copy } from "lucide-react";

interface NotificationListItemProps {
  notification: NotificationItem;
  onRead: (id: string) => void;
}
```

**타입별 설정**:
```typescript
const NOTIFICATION_CONFIG: Record<NotificationType, { icon: LucideIcon; color: string; getMessage: (actor: string) => string }> = {
  FOLLOW:        { icon: UserPlus,      color: "text-blue-500",   getMessage: (a) => `${a}님이 회원님을 팔로우합니다` },
  SPOT_LIKE:     { icon: Heart,         color: "text-red-500",    getMessage: (a) => `${a}님이 회원님의 Spot을 좋아합니다` },
  SPOTLINE_LIKE: { icon: Heart,         color: "text-red-500",    getMessage: (a) => `${a}님이 회원님의 SpotLine을 좋아합니다` },
  BLOG_LIKE:     { icon: Heart,         color: "text-red-500",    getMessage: (a) => `${a}님이 회원님의 블로그를 좋아합니다` },
  COMMENT:       { icon: MessageCircle, color: "text-green-500",  getMessage: (a) => `${a}님이 댓글을 남겼습니다` },
  FORK:          { icon: Copy,          color: "text-purple-500", getMessage: (a) => `${a}님이 회원님의 SpotLine을 복제했습니다` },
};
```

**이동 링크 로직**:
```typescript
function getNotificationLink(n: NotificationItem): string {
  if (n.type === "FOLLOW") return `/profile/${n.actorId}`;
  if (!n.targetSlug) return "/inbox";
  switch (n.targetType) {
    case "SPOT": return `/spot/${n.targetSlug}`;
    case "SPOTLINE": return `/spotline/${n.targetSlug}`;
    case "BLOG": return `/blog/${n.targetSlug}`;
    default: return "/inbox";
  }
}
```

**렌더링**:
- 왼쪽: actor 아바타 (32x32 rounded-full, 없으면 이니셜 원)
- 중앙: 메시지 텍스트 + 상대 시간 ("방금 전", "5분 전", "1시간 전", "어제")
- 오른쪽: 타입별 아이콘 (색상 구분)
- 읽지 않은 알림: `bg-blue-50` 배경
- 클릭 시: `markNotificationAsRead(id)` → `router.push(link)`

**상대 시간 함수**:
```typescript
function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}
```

---

## 4. Implementation Order

### 4.1 Implementation Checklist

| # | Item | Repo | Files | Estimated Changes |
|:-:|------|------|-------|-------------------|
| 1 | NotificationType enum | backend | `NotificationType.java` (NEW) | ~10 lines |
| 2 | Notification entity | backend | `Notification.java` (NEW) | ~40 lines |
| 3 | NotificationRepository | backend | `NotificationRepository.java` (NEW) | ~20 lines |
| 4 | NotificationService | backend | `NotificationService.java` (NEW) | ~70 lines |
| 5 | NotificationResponse DTO | backend | `NotificationResponse.java` (NEW) | ~30 lines |
| 6 | NotificationController | backend | `NotificationController.java` (NEW) | ~50 lines |
| 7 | 트리거 통합 | backend | `FollowService.java`, `SocialService.java`, `CommentService.java`, `UserSpotLineService.java` (MODIFY) | +50 lines total |
| 8 | Frontend 타입 | front | `types/index.ts` (MODIFY) | +12 lines |
| 9 | API 함수 | front | `lib/api.ts` (MODIFY) | +25 lines |
| 10 | NotificationBell | front | `components/notification/NotificationBell.tsx` (NEW) | ~40 lines |
| 11 | Header 통합 | front | `components/layout/Header.tsx` (MODIFY) | +10 lines |
| 12 | InboxPage | front | `app/inbox/page.tsx` (NEW) | ~100 lines |
| 13 | NotificationListItem | front | `components/notification/NotificationListItem.tsx` (NEW) | ~90 lines |

### 4.2 Execution Strategy

1. **Items 1-6**: Backend 엔티티 + 서비스 + 컨트롤러 (독립적, 먼저)
2. **Item 7**: 트리거 통합 (기존 서비스 수정)
3. **Items 8-9**: Frontend 타입 + API 함수
4. **Items 10-11**: NotificationBell + Header 통합
5. **Items 12-13**: InboxPage + NotificationListItem

---

## 5. Risk Mitigation

| Risk | Strategy |
|------|----------|
| 트리거 추가로 기존 서비스 오류 | try-catch로 감싸서 알림 실패 시 원래 동작에 영향 없음 |
| 폴링 부하 | 30초 간격, 로그인 사용자만, unread-count는 단순 COUNT 쿼리 |
| 삭제된 콘텐츠 알림 클릭 | 404 시 "삭제된 콘텐츠" 메시지 또는 /inbox로 리다이렉트 |
| JWT 없는 사용자 | NotificationBell에 userId null이면 미표시, API는 JWT 필수 |
| 알림 폭증 | 5분 중복 방지 + 사용자당 500개 제한 (향후 cron job) |

---

## 6. Success Criteria

- [ ] Backend: Notification 엔티티 + 테이블 자동 생성 (JPA)
- [ ] Backend: 5개 API 엔드포인트 동작 (Swagger 확인)
- [ ] Backend: 4개 서비스 트리거 통합 (팔로우/좋아요/댓글/포크)
- [ ] Backend: `./gradlew build` 성공
- [ ] Frontend: NotificationBell — unread count 표시 + 30초 폴링
- [ ] Frontend: Header에 벨 아이콘 표시 (로그인 시)
- [ ] Frontend: `/inbox` 페이지 — 알림 목록 렌더링
- [ ] Frontend: 알림 클릭 → 읽음 처리 + 대상 페이지 이동
- [ ] Frontend: "모두 읽음" 버튼 동작
- [ ] Frontend: `pnpm build` 성공
- [ ] 자기 자신 알림 제외 확인
- [ ] 5분 중복 방지 확인

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-12 | Initial draft | AI Assistant |
