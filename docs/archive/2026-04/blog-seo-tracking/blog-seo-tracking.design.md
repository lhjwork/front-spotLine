# Blog SEO & View Tracking Design Document

> **Feature**: Blog SEO & View Tracking
> **Plan Reference**: `docs/01-plan/features/blog-seo-tracking.plan.md`
> **Version**: 1.0.0
> **Date**: 2026-04-07
> **Status**: Design

---

## 1. Architecture Overview

### 1.1 Existing Pattern (Spot/SpotLine — 복제 대상)

```
[Backend - AnalyticsController.java]
POST /api/v2/spots/{id}/view
  → SpotService.incrementViewCount(id)
    → UPDATE spots SET views_count = views_count + 1 WHERE id = ?

[Frontend - api.ts]
incrementSpotView(id) → apiV2.post(`/spots/${id}/view`, null, { timeout: 3000 })
  catch → ignore (fire-and-forget)

[Frontend - ViewTracker.tsx]
<ViewTracker type="spot" id={spotId} />
  → useEffect → incrementSpotView(id)
  → return null (invisible component)

[Frontend - sitemap.ts]
fetchAllSpotSlugs() → map to /spot/{slug} URLs (priority: 0.8, weekly)
```

### 1.2 Blog Extension (동일 패턴 적용)

```
[Backend - AnalyticsController.java]  ← MODIFY
POST /api/v2/blogs/{id}/view          ← NEW endpoint
  → BlogService.incrementViewCount(id) ← NEW method
    → UPDATE blogs SET views_count = views_count + 1 WHERE id = ?

[Frontend - api.ts]                    ← MODIFY
incrementBlogView(id) → apiV2.post(`/blogs/${id}/view`, null, { timeout: 3000 })

[Frontend - ViewTracker.tsx]           ← MODIFY
<ViewTracker type="blog" id={blogId} />
  → useEffect → incrementBlogView(id)

[Frontend - blog/[slug]/page.tsx]      ← MODIFY (remove TODO, add ViewTracker)

[Frontend - sitemap.ts]                ← MODIFY
fetchBlogSlugs() → map to /blog/{slug} URLs (priority: 0.6, weekly)
```

---

## 2. Component Specifications

### 2.1 Backend: AnalyticsController — New Endpoint

**File**: `springboot-spotLine-backend/src/main/java/com/spotline/api/controller/AnalyticsController.java`

```java
@PostMapping("/blogs/{id}/view")
public ResponseEntity<Void> incrementBlogView(@PathVariable UUID id) {
    blogService.incrementViewCount(id);
    return ResponseEntity.ok().build();
}
```

- No auth required (anonymous views)
- Same pattern as existing `incrementSpotView` and `incrementSpotLineView`
- Blog entity already has `viewsCount` field (Blog.java:68)

### 2.2 Backend: BlogService — New Method

**File**: `springboot-spotLine-backend/src/main/java/com/spotline/api/service/BlogService.java`

```java
@Transactional
public void incrementViewCount(UUID blogId) {
    blogRepository.incrementViewCount(blogId);
}
```

### 2.3 Backend: BlogRepository — New Query

**File**: `springboot-spotLine-backend/src/main/java/com/spotline/api/domain/repository/BlogRepository.java`

```java
@Modifying
@Query("UPDATE Blog b SET b.viewsCount = b.viewsCount + 1 WHERE b.id = :id")
void incrementViewCount(@Param("id") UUID id);
```

### 2.4 Frontend: api.ts — New Function

**File**: `front-spotLine/src/lib/api.ts` (after line 1213, following incrementSpotLineView)

```typescript
export async function incrementBlogView(blogId: string): Promise<void> {
  try {
    await apiV2.post(`/blogs/${blogId}/view`, null, { timeout: 3000 });
  } catch {
    // fire-and-forget
  }
}
```

### 2.5 Frontend: ViewTracker.tsx — Extend Type

**File**: `front-spotLine/src/components/common/ViewTracker.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { incrementSpotView, incrementSpotLineView, incrementBlogView } from "@/lib/api";

interface ViewTrackerProps {
  type: "spot" | "spotline" | "blog";
  id: string;
}

export default function ViewTracker({ type, id }: ViewTrackerProps) {
  useEffect(() => {
    if (type === "spot") {
      incrementSpotView(id);
    } else if (type === "spotline") {
      incrementSpotLineView(id);
    } else {
      incrementBlogView(id);
    }
  }, [type, id]);

  return null;
}
```

### 2.6 Frontend: blog/[slug]/page.tsx — Add ViewTracker

**File**: `front-spotLine/src/app/blog/[slug]/page.tsx`

Replace line 58:
```tsx
{/* TODO: blog view tracking — ViewTracker only supports spot/spotline */}
```

With:
```tsx
<ViewTracker type="blog" id={blog.id} />
```

Note: ViewTracker is a client component (`"use client"`), can be used inside this server component since it renders to `null` (no visual output).

### 2.7 Frontend: sitemap.ts — Add Blog URLs

**File**: `front-spotLine/src/app/sitemap.ts`

Add import:
```typescript
import { fetchAllSpotSlugs, fetchAllSpotLineSlugs, fetchBlogSlugs } from "@/lib/api";
```

Add to Promise.all:
```typescript
const [spotSlugs, spotLineSlugs, blogSlugs] = await Promise.all([
  fetchAllSpotSlugs(),
  fetchAllSpotLineSlugs(),
  fetchBlogSlugs(),
]);
```

Add blog pages array:
```typescript
const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
  url: `${siteUrl}/blog/${slug}`,
  lastModified: new Date(),
  changeFrequency: "weekly" as const,
  priority: 0.6,
}));
```

Note: `fetchBlogSlugs()` returns `string[]` (not `{ slug, updatedAt }[]`), so `lastModified` uses `new Date()`. Priority 0.6 — lower than Spot/SpotLine (0.8) since blogs are supplementary content.

---

## 3. FR Mapping

| FR | Description | File(s) | Change Type |
|----|-------------|---------|-------------|
| FR-01 | POST /blogs/{id}/view endpoint | AnalyticsController.java, BlogService.java, BlogRepository.java | Backend: new endpoint + method + query |
| FR-02 | Duplicate prevention (5min) | Backend (optional, same session check) | Backend: enhancement |
| FR-03 | incrementBlogView() API function | api.ts | Frontend: new function (~5 lines) |
| FR-04 | ViewTracker "blog" type | ViewTracker.tsx | Frontend: extend type + add else-if (~3 lines) |
| FR-05 | blog/[slug] ViewTracker rendering | blog/[slug]/page.tsx | Frontend: replace TODO with component |
| FR-06 | sitemap blog URLs | sitemap.ts | Frontend: add fetchBlogSlugs + map |

---

## 4. File Inventory

| File | Repo | Change | Lines Changed (est.) |
|------|------|--------|:--------------------:|
| `AnalyticsController.java` | backend | Add endpoint | +5 |
| `BlogService.java` | backend | Add method | +4 |
| `BlogRepository.java` | backend | Add query | +3 |
| `src/lib/api.ts` | front | Add function | +6 |
| `src/components/common/ViewTracker.tsx` | front | Extend type + logic | +4 (modify ~3) |
| `src/app/blog/[slug]/page.tsx` | front | Replace TODO → ViewTracker | +2 (modify 1) |
| `src/app/sitemap.ts` | front | Add blog to sitemap | +8 (modify 3) |

**Total**: 7 files, ~32 lines changed

---

## 5. Implementation Order

| Step | Task | Repo | Dependencies |
|------|------|------|-------------|
| 1 | BlogRepository.incrementViewCount() | backend | None |
| 2 | BlogService.incrementViewCount() | backend | Step 1 |
| 3 | AnalyticsController.incrementBlogView() | backend | Step 2 |
| 4 | incrementBlogView() in api.ts | front | Step 3 (backend deployed) |
| 5 | ViewTracker "blog" type extension | front | Step 4 |
| 6 | blog/[slug]/page.tsx ViewTracker | front | Step 5 |
| 7 | sitemap.ts blog URLs | front | None (independent) |

Steps 4-6 are sequential. Step 7 is independent and can be done in parallel with Steps 1-3.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-04-07 | Initial design — 7 files, ~32 lines | Claude Code |
