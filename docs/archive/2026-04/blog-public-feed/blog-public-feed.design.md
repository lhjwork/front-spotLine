# Blog Public Feed Design Document

> **Summary**: 블로그 공개 발견 경로 추가. 메인 피드에 블로그 섹션, /blogs 전용 페이지, 프로필 블로그 탭 생성. 기존 fetchBlogs API + BlogCard 활용.
>
> **Project**: Spotline (front-spotLine)
> **Version**: 1.0.0
> **Author**: Claude Code
> **Date**: 2026-04-07
> **Status**: Draft
> **Planning Doc**: [blog-public-feed.plan.md](../01-plan/features/blog-public-feed.plan.md)

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 블로그 생성/편집/발행 완성되었으나 공개 발견 경로 0개. fetchBlogs()가 dead code이고 피드/프로필/탐색에서 블로그를 찾을 수 없음. |
| **Solution** | FeedBlogSection(피드), /blogs 페이지(전용 탐색), ProfileTabs 블로그 탭(프로필) 3개 경로 추가. |
| **Function/UX Effect** | 피드에서 블로그 카드 노출, /blogs에서 지역별 필터 탐색, 프로필에서 내 블로그 관리 진입. |
| **Core Value** | 콘텐츠 발견 루프 완성 — 블로그 생산→소비 연결로 Cold Start SEO 전략 실효성 확보. |

---

## 1. Overview

### 1.1 Design Goals

- 기존 fetchBlogs API와 BlogCard 컴포넌트를 연결하여 dead code 제거
- FeedSpotLineSection 패턴을 그대로 따라 일관된 피드 UX 유지
- /blogs 페이지에 ISR 적용하여 빌드 안정성 확보
- 최소한의 코드 추가로 최대 효과 (NEW 2파일, MODIFY 2파일)

### 1.2 Design Principles

- **패턴 재사용**: FeedSpotLineSection → FeedBlogSection 동일 구조
- **기존 컴포넌트 활용**: BlogCard, FeedAreaTabs 재사용
- **0건 대응**: 블로그 0건이면 섹션 숨김 (빈 상태 노출 방지)

---

## 2. Architecture

### 2.1 Component Diagram

```
FeedPage (MODIFY)
├── FeedSpotLineSection (기존)
├── FeedBlogSection (NEW) ─── BlogCard (기존)
│   └── fetchBlogs() (기존, 현재 미사용)
└── FeedSpotGrid (기존)

/blogs/page.tsx (NEW)
├── FeedAreaTabs (기존 재사용)
├── BlogCard (기존)
└── fetchBlogs() (기존)

ProfileTabs (MODIFY)
└── "블로그" 탭 → /my-blogs 링크
```

### 2.2 Data Flow

```
[FeedPage]
  useEffect(area change) → fetchBlogs(0, 4, area) → blogs state → FeedBlogSection → BlogCard

[/blogs page]
  SSR: fetchBlogs(0, 20, area) → initial data
  Client: area 변경 / 무한스크롤 → fetchBlogs(page, 20, area) → append

[ProfileTabs]
  "블로그" 탭 클릭 → router.push("/my-blogs") (별도 데이터 로딩 없음)
```

---

## 3. File Changes

### 3.1 New Files

| # | File | Type | Description |
|---|------|------|-------------|
| 1 | `src/components/feed/FeedBlogSection.tsx` | Client Component | 피드 블로그 섹션 |
| 2 | `src/app/blogs/page.tsx` | Server Component | 블로그 리스트 페이지 |

### 3.2 Modified Files

| # | File | Changes |
|---|------|---------|
| 3 | `src/components/feed/FeedPage.tsx` | FeedBlogSection 임포트 + blogs 상태 + 렌더링 |
| 4 | `src/components/profile/ProfileTabs.tsx` | "블로그" 탭 추가 (meOnly, /my-blogs 링크) |

### 3.3 No Backend Changes

기존 `GET /api/v2/blogs` (공개, area 필터, 페이지네이션) 그대로 사용.

---

## 4. Detailed Specifications

### 4.1 FeedBlogSection.tsx (NEW)

**Pattern**: FeedSpotLineSection과 동일한 구조

```typescript
// src/components/feed/FeedBlogSection.tsx
import Link from "next/link";
import BlogCard from "@/components/blog/BlogCard";
import type { BlogListItem } from "@/types";

interface FeedBlogSectionProps {
  blogs: BlogListItem[];
}

export default function FeedBlogSection({ blogs }: FeedBlogSectionProps) {
  // blogs가 0건이면 아무것도 렌더링하지 않음
  if (blogs.length === 0) return null;

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">인기 블로그</h2>
        <Link
          href="/blogs"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          더보기
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </section>
  );
}
```

**Key decisions:**
- `grid grid-cols-2` 2열 그리드 (BlogCard의 aspect-[2/1] 비율에 적합)
- "더보기" 링크 → /blogs 페이지로 연결
- 0건 → `return null` (FeedSpotLineSection 패턴 동일)
- Server component (인터랙션 없음, Link만 사용)

### 4.2 FeedPage.tsx (MODIFY)

**변경 사항:**

1. **Import 추가:**
```typescript
import FeedBlogSection from "./FeedBlogSection";
import { fetchBlogs } from "@/lib/api";
import type { BlogListItem } from "@/types";
```

2. **useFeedStore에 blogs 상태 추가 또는 로컬 상태:**
```typescript
const [blogs, setBlogs] = useState<BlogListItem[]>([]);
```

3. **useEffect 추가 (spotLines 로딩과 동일 패턴):**
```typescript
// Load blogs when area changes
useEffect(() => {
  if (!initializedRef.current) return;
  let cancelled = false;
  const loadBlogs = async () => {
    try {
      const result = await fetchBlogs(0, 4, area || undefined);
      if (!cancelled) setBlogs(result.content);
    } catch {
      // Blogs are non-critical, don't block
    }
  };
  loadBlogs();
  return () => { cancelled = true; };
}, [area]);
```

4. **FeedBlogSection 렌더링 (FeedSpotLineSection 바로 아래):**
```tsx
<FeedSpotLineSection spotLines={spotLines} />
<FeedBlogSection blogs={blogs} />
```

**Note**: `fetchBlogs(0, 4)` — 피드에서는 최대 4개만 표시 (2x2 그리드).

### 4.3 /blogs/page.tsx (NEW)

**Server Component + Client wrapper 패턴:**

```typescript
// src/app/blogs/page.tsx
import type { Metadata } from "next";
import { fetchBlogs } from "@/lib/api";
import BlogsPageClient from "./BlogsPageClient";

export const metadata: Metadata = {
  title: "블로그 | Spotline",
  description: "Spotline 크루와 유저들의 경험 블로그를 만나보세요. 지역별 맛집, 카페, 문화 공간 이야기.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.kr"}/blogs`,
  },
  openGraph: {
    title: "블로그 | Spotline",
    description: "Spotline 크루와 유저들의 경험 블로그를 만나보세요.",
    type: "website",
  },
};

export const revalidate = 3600; // ISR: 1시간

export default async function BlogsPage() {
  let initialBlogs;
  try {
    initialBlogs = await fetchBlogs(0, 20);
  } catch {
    initialBlogs = { content: [], last: true };
  }

  return <BlogsPageClient initialBlogs={initialBlogs.content} initialHasMore={!initialBlogs.last} />;
}
```

**Client component (같은 디렉토리):**

```typescript
// src/app/blogs/BlogsPageClient.tsx
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { fetchBlogs } from "@/lib/api";
import BlogCard from "@/components/blog/BlogCard";
import FeedAreaTabs from "@/components/feed/FeedAreaTabs";
import type { BlogListItem } from "@/types";

interface BlogsPageClientProps {
  initialBlogs: BlogListItem[];
  initialHasMore: boolean;
}

export default function BlogsPageClient({ initialBlogs, initialHasMore }: BlogsPageClientProps) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [area, setArea] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Area 변경 시 리셋
  const handleAreaChange = useCallback((newArea: string | null) => {
    setArea(newArea);
    setPage(0);
    setBlogs([]);
    setHasMore(true);
  }, []);

  // 데이터 로딩
  useEffect(() => {
    // 초기 데이터는 area가 null이고 page가 0일 때 SSR 데이터 사용
    if (area === null && page === 0 && initialBlogs.length > 0) {
      setBlogs(initialBlogs);
      setHasMore(initialHasMore);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchBlogs(page, 20, area || undefined);
        if (!cancelled) {
          setBlogs((prev) => page === 0 ? result.content : [...prev, ...result.content]);
          setHasMore(!result.last);
        }
      } catch {
        // 로딩 실패 시 조용히 처리
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [area, page, initialBlogs, initialHasMore]);

  // Intersection Observer for infinite scroll
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

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="mx-auto max-w-2xl">
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-xl font-bold text-gray-900">블로그</h1>
          <p className="mt-1 text-sm text-gray-500">경험이 담긴 이야기를 만나보세요</p>
        </div>

        <FeedAreaTabs selected={area} onSelect={handleAreaChange} />

        <div className="grid grid-cols-2 gap-3 px-4 py-4">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>

        {/* Empty state */}
        {!loading && blogs.length === 0 && (
          <div className="px-4 py-16 text-center">
            <p className="text-sm text-gray-400">
              {area ? "이 지역의 블로그가 아직 없습니다" : "아직 발행된 블로그가 없습니다"}
            </p>
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        )}

        {/* Infinite scroll trigger */}
        {hasMore && <div ref={observerRef} className="h-10" />}
      </div>
    </div>
  );
}
```

**Key decisions:**
- SSR initial data + client-side infinite scroll (FeedPage 패턴)
- FeedAreaTabs 재사용 (CITIES 동일)
- ISR revalidate: 3600 (1시간)
- grid-cols-2 (BlogCard 디자인에 최적)
- 실제 파일은 2개: `app/blogs/page.tsx` (server) + `app/blogs/BlogsPageClient.tsx` (client)

### 4.4 ProfileTabs.tsx (MODIFY)

**변경 사항:**

1. **Import 추가:**
```typescript
import { Heart, Bookmark, MapPin, Map, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
```

2. **TabKey 타입 확장:**
```typescript
type TabKey = "likes" | "saves" | "spotlines" | "my-spots" | "blogs";
```

3. **TABS 배열에 블로그 탭 추가:**
```typescript
const TABS: { key: TabKey; label: string; icon: typeof Heart; meOnly?: boolean }[] = [
  { key: "likes", label: "좋아요", icon: Heart },
  { key: "saves", label: "저장", icon: Bookmark },
  { key: "spotlines", label: "SpotLine", icon: MapPin, meOnly: true },
  { key: "my-spots", label: "내 Spot", icon: Map, meOnly: true },
  { key: "blogs", label: "블로그", icon: BookOpen, meOnly: true },
];
```

4. **블로그 탭 클릭 시 /my-blogs로 이동:**
```typescript
const router = useRouter();

const handleTabChange = (tab: TabKey) => {
  if (tab === "blogs") {
    router.push("/my-blogs");
    return;
  }
  setActiveTab(tab);
};
```

**Key decisions:**
- `meOnly: true` — 본인 프로필에서만 표시
- 블로그 탭은 데이터 로딩 없이 /my-blogs 페이지로 직접 이동 (이미 존재하는 페이지)
- BookOpen 아이콘 (lucide-react)

---

## 5. Implementation Order

| Step | Task | Files | Dependency |
|------|------|-------|------------|
| 1 | FeedBlogSection 컴포넌트 생성 | `components/feed/FeedBlogSection.tsx` (NEW) | None |
| 2 | FeedPage에 블로그 섹션 통합 | `components/feed/FeedPage.tsx` (MODIFY) | Step 1 |
| 3 | BlogsPageClient 컴포넌트 생성 | `app/blogs/BlogsPageClient.tsx` (NEW) | None |
| 4 | /blogs 서버 페이지 생성 | `app/blogs/page.tsx` (NEW) | Step 3 |
| 5 | ProfileTabs 블로그 탭 추가 | `components/profile/ProfileTabs.tsx` (MODIFY) | None |

**총 파일: NEW 3개, MODIFY 2개** (Plan의 2 NEW + 2 MODIFY에서 BlogsPageClient 분리로 +1)

---

## 6. Verification Checklist

- [ ] 피드 "전체" 탭에서 블로그 카드 4개 보임 (0건이면 섹션 숨김)
- [ ] 피드 지역 탭 변경 시 블로그도 해당 지역으로 필터링
- [ ] "더보기" 클릭 시 /blogs 페이지 이동
- [ ] /blogs 페이지에서 지역 필터 동작
- [ ] /blogs 페이지 무한 스크롤 동작
- [ ] /blogs 페이지 SEO 메타데이터 확인
- [ ] 내 프로필에서 "블로그" 탭 → /my-blogs 이동
- [ ] 타인 프로필에서 "블로그" 탭 안 보임
- [ ] `pnpm type-check` 통과
- [ ] `pnpm build` 성공

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-07 | Initial design — Blog Public Feed | Claude Code |
