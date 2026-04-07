# Following Feed Content Design Document

> **Summary**: 팔로잉 피드에 실제 콘텐츠(SpotLine + Blog) 표시. Backend에 피드 API 추가, Frontend FollowingFeed 리팩토링.
>
> **Project**: Spotline (front-spotLine + springboot-spotLine-backend)
> **Version**: 1.0.0
> **Author**: Claude Code
> **Date**: 2026-04-07
> **Status**: Draft
> **Planning Doc**: [following-feed-content.plan.md](../01-plan/features/following-feed-content.plan.md)

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 팔로잉 탭이 유저 목록만 표시, 콘텐츠 피드 없음. 팔로우 동기 0. |
| **Solution** | Backend `GET /api/v2/feed/following` + Frontend FollowingFeed 콘텐츠 피드 전환. |
| **Function/UX Effect** | 팔로잉 유저의 SpotLine/Blog 카드가 시간순 표시, 무한 스크롤. |
| **Core Value** | 팔로우→콘텐츠 소비 루프 완성. Social Sharing (Pillar 3) 핵심 동기. |

---

## 1. Overview

### 1.1 Design Goals

- 팔로잉 유저들의 SpotLine + Blog를 시간순으로 병합하여 단일 피드로 제공
- 기존 카드 컴포넌트(SpotLinePreviewCard, BlogCard) 100% 재사용
- Backend 쿼리 최적화: 2개 쿼리 → Java 병합 (UNION ALL 대신 단순 전략)
- 기존 FollowingFeed.tsx의 미인증/팔로잉 0명 빈 상태 UI 유지

### 1.2 Design Principles

- **2-query merge**: SpotLine + Blog 각각 쿼리 후 Java에서 시간순 병합 (JPA 호환성)
- **통합 DTO**: `FollowingFeedItem` — type 필드로 SPOTLINE/BLOG 구분
- **기존 패턴 재사용**: FollowingFeed 미인증/빈 상태 UI 그대로 유지

---

## 2. Architecture

### 2.1 Data Flow

```
[Frontend FollowingFeed]
  → fetchFollowingFeed(page, size)
  → GET /api/v2/feed/following?page=0&size=20
    → [FeedController] → [FeedService]
      → 1. UserFollowRepository.findFollowingIds(userId)
      → 2. SpotLineRepository.findByCreatorIdIn(ids, pageable)
      → 3. BlogRepository.findPublishedByUserIdIn(ids, pageable)
      → 4. Java merge by createdAt DESC
    → Page<FollowingFeedItemResponse>
  → Render: SpotLinePreviewCard / BlogCard by type
```

### 2.2 Component Diagram

```
Backend:
  FeedController (NEW) ─── FeedService (NEW)
    ├── UserFollowRepository (기존)
    ├── SpotLineRepository (MODIFY — add findByCreatorIdIn)
    └── BlogRepository (MODIFY — add findPublishedByUserIdIn)

Frontend:
  FollowingFeed.tsx (MODIFY)
    ├── SpotLinePreviewCard (기존)
    ├── BlogCard (기존)
    └── fetchFollowingFeed() in api.ts (MODIFY)
```

---

## 3. File Changes

### 3.1 Backend — New Files (3)

| # | File | Description |
|---|------|-------------|
| 1 | `controller/FeedController.java` | Feed API 컨트롤러 |
| 2 | `service/FeedService.java` | 팔로잉 피드 비즈니스 로직 |
| 3 | `dto/response/FollowingFeedItemResponse.java` | 통합 피드 아이템 DTO |

### 3.2 Backend — Modified Files (2)

| # | File | Changes |
|---|------|---------|
| 4 | `repository/SpotLineRepository.java` | `findByCreatorIdInAndIsActiveTrueOrderByCreatedAtDesc` 추가 |
| 5 | `repository/BlogRepository.java` | `findByUserIdInAndStatusAndIsActiveTrueOrderByPublishedAtDesc` 추가 |

### 3.3 Frontend — Modified Files (3)

| # | File | Changes |
|---|------|---------|
| 6 | `lib/api.ts` | `fetchFollowingFeed()` 함수 추가 |
| 7 | `types/index.ts` | `FollowingFeedItem` 타입 추가 |
| 8 | `components/feed/FollowingFeed.tsx` | 콘텐츠 피드로 전면 리팩토링 |

---

## 4. Detailed Specifications

### 4.1 FollowingFeedItemResponse.java (NEW)

```java
package com.spotline.api.dto.response;

@Schema(description = "팔로잉 피드 아이템")
@Data
@Builder
public class FollowingFeedItemResponse {

    public enum FeedItemType { SPOTLINE, BLOG }

    private FeedItemType type;
    private UUID id;
    private String slug;
    private String title;
    private String area;
    private String coverImageUrl;
    private Integer likesCount;
    private Integer viewsCount;

    // SpotLine specific
    private String theme;           // nullable (BLOG일 때 null)
    private Integer spotCount;      // nullable
    private Integer totalDuration;  // nullable

    // Blog specific
    private String summary;         // nullable (SPOTLINE일 때 null)

    // Creator info
    private String userName;
    private String userAvatar;

    private LocalDateTime createdAt;

    public static FollowingFeedItemResponse fromSpotLine(SpotLine sl, String s3BaseUrl) {
        return FollowingFeedItemResponse.builder()
            .type(FeedItemType.SPOTLINE)
            .id(sl.getId())
            .slug(sl.getSlug())
            .title(sl.getTitle())
            .area(sl.getArea())
            .coverImageUrl(SpotLinePreviewResponse.from(sl, s3BaseUrl).getCoverImageUrl())
            .likesCount(sl.getLikesCount())
            .viewsCount(sl.getViewsCount())
            .theme(sl.getTheme() != null ? sl.getTheme().name() : null)
            .spotCount(sl.getSpots() != null ? sl.getSpots().size() : 0)
            .totalDuration(sl.getTotalDuration())
            .userName(sl.getCreatorName())
            .userAvatar(null)  // SpotLine doesn't store avatar
            .createdAt(sl.getCreatedAt())
            .build();
    }

    public static FollowingFeedItemResponse fromBlog(Blog blog) {
        return FollowingFeedItemResponse.builder()
            .type(FeedItemType.BLOG)
            .id(blog.getId())
            .slug(blog.getSlug())
            .title(blog.getTitle())
            .area(blog.getSpotLine() != null ? blog.getSpotLine().getArea() : null)
            .coverImageUrl(blog.getCoverImageUrl())
            .likesCount(blog.getLikesCount())
            .viewsCount(blog.getViewsCount())
            .summary(blog.getSummary())
            .spotCount(blog.getSpotLine() != null && blog.getSpotLine().getSpots() != null
                ? blog.getSpotLine().getSpots().size() : 0)
            .userName(blog.getUserName())
            .userAvatar(blog.getUserAvatarUrl())
            .createdAt(blog.getPublishedAt() != null ? blog.getPublishedAt() : blog.getCreatedAt())
            .build();
    }
}
```

### 4.2 FeedController.java (NEW)

```java
package com.spotline.api.controller;

@Tag(name = "Feed", description = "피드")
@RestController
@RequestMapping("/api/v2/feed")
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;
    private final AuthUtil authUtil;

    @Operation(summary = "팔로잉 피드")
    @GetMapping("/following")
    public Page<FollowingFeedItemResponse> getFollowingFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String userId = authUtil.requireUserId();
        return feedService.getFollowingFeed(userId, PageRequest.of(page, size));
    }
}
```

### 4.3 FeedService.java (NEW)

```java
package com.spotline.api.service;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FeedService {

    private final UserFollowRepository userFollowRepository;
    private final SpotLineRepository spotLineRepository;
    private final BlogRepository blogRepository;

    @Value("${aws.s3.base-url:}")
    private String s3BaseUrl;

    public Page<FollowingFeedItemResponse> getFollowingFeed(String userId, Pageable pageable) {
        // 1. Get following user IDs
        List<String> followingIds = userFollowRepository
            .findByFollowerIdOrderByCreatedAtDesc(userId, Pageable.unpaged())
            .map(UserFollow::getFollowingId)
            .getContent();

        if (followingIds.isEmpty()) {
            return Page.empty(pageable);
        }

        // 2. Fetch SpotLines and Blogs from followed users
        List<SpotLine> spotLines = spotLineRepository
            .findByCreatorIdInAndIsActiveTrueOrderByCreatedAtDesc(followingIds);

        List<Blog> blogs = blogRepository
            .findByUserIdInAndStatusAndIsActiveTrueOrderByPublishedAtDesc(
                followingIds, BlogStatus.PUBLISHED);

        // 3. Merge and sort by createdAt DESC
        List<FollowingFeedItemResponse> merged = new ArrayList<>();

        for (SpotLine sl : spotLines) {
            merged.add(FollowingFeedItemResponse.fromSpotLine(sl, s3BaseUrl));
        }
        for (Blog blog : blogs) {
            merged.add(FollowingFeedItemResponse.fromBlog(blog));
        }

        merged.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        // 4. Manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), merged.size());

        if (start >= merged.size()) {
            return new PageImpl<>(List.of(), pageable, merged.size());
        }

        return new PageImpl<>(merged.subList(start, end), pageable, merged.size());
    }
}
```

**Key Decision**: 2-query + Java merge 전략 선택.
- UNION ALL native query는 JPA/Hibernate 호환성 이슈 있음
- 팔로잉 최대 100명 기준, SpotLine + Blog 합쳐도 수백 건 이내 → Java 메모리 병합 충분

### 4.4 Repository Changes (MODIFY)

**SpotLineRepository.java** — 추가:
```java
List<SpotLine> findByCreatorIdInAndIsActiveTrueOrderByCreatedAtDesc(List<String> creatorIds);
```

**BlogRepository.java** — 추가:
```java
List<Blog> findByUserIdInAndStatusAndIsActiveTrueOrderByPublishedAtDesc(
    List<String> userIds, BlogStatus status);
```

### 4.5 Frontend — FollowingFeedItem Type (types/index.ts)

```typescript
export interface FollowingFeedItem {
  type: "SPOTLINE" | "BLOG";
  id: string;
  slug: string;
  title: string;
  area: string | null;
  coverImageUrl: string | null;
  likesCount: number;
  viewsCount: number;
  // SpotLine specific
  theme: string | null;
  spotCount: number | null;
  totalDuration: number | null;
  // Blog specific
  summary: string | null;
  // Creator
  userName: string;
  userAvatar: string | null;
  createdAt: string;
}
```

### 4.6 Frontend — fetchFollowingFeed (api.ts)

```typescript
export async function fetchFollowingFeed(
  page = 0,
  size = 20
): Promise<PaginatedResponse<FollowingFeedItem>> {
  const { data } = await apiV2.get<PaginatedResponse<FollowingFeedItem>>(
    "/feed/following",
    { params: { page, size }, timeout: 5000 }
  );
  return data;
}
```

### 4.7 Frontend — FollowingFeed.tsx (MODIFY — Full Rewrite)

**핵심 변경:**
- 기존: `fetchFollowing()` → UserProfile[] → 유저 카드 목록
- 변경: `fetchFollowingFeed()` → FollowingFeedItem[] → SpotLinePreviewCard / BlogCard

```typescript
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Users, Search } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchFollowingFeed } from "@/lib/api";
import SpotLinePreviewCard from "@/components/shared/SpotLinePreviewCard";
import BlogCard from "@/components/blog/BlogCard";
import LoginBottomSheet from "@/components/auth/LoginBottomSheet";
import type { FollowingFeedItem } from "@/types";

export default function FollowingFeed() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [items, setItems] = useState<FollowingFeedItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Load feed data
  useEffect(() => {
    if (!isAuthenticated) {
      setInitialLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchFollowingFeed(page, 20);
        if (!cancelled) {
          setItems((prev) => page === 0 ? res.content : [...prev, ...res.content]);
          setHasMore(!res.last);
        }
      } catch {
        // non-critical
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isAuthenticated, page]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // --- Unauthenticated state (기존 유지) ---
  if (!isAuthenticated) { /* 기존 로그인 유도 UI 그대로 */ }

  // --- Initial loading ---
  if (initialLoading) { /* 스피너 */ }

  // --- Empty state (콘텐츠 0개) ---
  if (!loading && items.length === 0) { /* 탐색 유도 UI */ }

  // --- Content feed ---
  return (
    <div className="space-y-4 px-4 py-4">
      {items.map((item) => (
        item.type === "SPOTLINE" ? (
          <SpotLinePreviewCard
            key={`sl-${item.id}`}
            spotLine={{
              id: item.id,
              slug: item.slug,
              title: item.title,
              theme: item.theme || "",
              area: item.area || "",
              totalDuration: item.totalDuration || 0,
              totalDistance: 0,
              spotCount: item.spotCount || 0,
              likesCount: item.likesCount,
            }}
          />
        ) : (
          <BlogCard
            key={`blog-${item.id}`}
            blog={{
              id: item.id,
              slug: item.slug,
              title: item.title,
              summary: item.summary,
              coverImageUrl: item.coverImageUrl,
              status: "PUBLISHED",
              userName: item.userName,
              userAvatarUrl: item.userAvatar,
              spotLineTitle: "",
              spotLineArea: item.area || "",
              spotCount: item.spotCount || 0,
              viewsCount: item.viewsCount,
              likesCount: item.likesCount,
              publishedAt: item.createdAt,
              createdAt: item.createdAt,
            }}
          />
        )
      ))}

      {loading && /* 스피너 */}
      {hasMore && <div ref={observerRef} className="h-10" />}
    </div>
  );
}
```

**Key Decisions:**
- FollowingFeedItem → SpotLinePreview 변환: 필드 매핑으로 기존 카드 컴포넌트 재사용
- FollowingFeedItem → BlogListItem 변환: 동일 패턴
- 미인증/빈 상태 UI는 기존 FollowingFeed.tsx에서 그대로 유지 (Users, Search 아이콘)

---

## 5. Implementation Order

| Step | Task | Repo | Files |
|------|------|------|-------|
| 1 | FollowingFeedItemResponse DTO | backend | `dto/response/FollowingFeedItemResponse.java` (NEW) |
| 2 | Repository 쿼리 추가 | backend | `SpotLineRepository.java` (MODIFY), `BlogRepository.java` (MODIFY) |
| 3 | FeedService 생성 | backend | `service/FeedService.java` (NEW) |
| 4 | FeedController 생성 | backend | `controller/FeedController.java` (NEW) |
| 5 | Backend 빌드 검증 | backend | `./gradlew build` |
| 6 | Frontend 타입 추가 | frontend | `types/index.ts` (MODIFY) |
| 7 | API 함수 추가 | frontend | `lib/api.ts` (MODIFY) |
| 8 | FollowingFeed 리팩토링 | frontend | `components/feed/FollowingFeed.tsx` (MODIFY) |
| 9 | Frontend 빌드 검증 | frontend | `pnpm type-check && pnpm build` |

**총 파일: Backend NEW 3 + MODIFY 2, Frontend MODIFY 3 = 8개**

---

## 6. Verification Checklist

- [ ] `GET /api/v2/feed/following` 인증 필요 (미인증 시 401)
- [ ] 팔로잉 유저의 SpotLine + Blog가 시간순으로 반환
- [ ] 팔로잉 0명 시 빈 페이지 반환
- [ ] Frontend 팔로잉 탭에서 SpotLine/Blog 카드 렌더링
- [ ] 무한 스크롤 동작
- [ ] 미인증 시 로그인 유도 UI
- [ ] 팔로잉 0명/콘텐츠 0개 빈 상태 UI
- [ ] Backend `./gradlew build` 성공
- [ ] Frontend `pnpm type-check` + `pnpm build` 통과

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-07 | Initial design — Following Feed Content | Claude Code |
