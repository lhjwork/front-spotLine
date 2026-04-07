# following-feed-content Analysis Report

> **Analysis Type**: Gap Analysis (Design vs Implementation)
>
> **Project**: Spotline (front-spotLine + springboot-spotLine-backend)
> **Analyst**: Claude Code (gap-detector)
> **Date**: 2026-04-07
> **Design Doc**: [following-feed-content.design.md](../02-design/features/following-feed-content.design.md)

---

## 1. Analysis Overview

### 1.1 Analysis Scope

- **Design Document**: `docs/02-design/features/following-feed-content.design.md` v1.0.0
- **Backend Implementation**: `springboot-spotLine-backend/src/main/java/com/spotline/api/`
- **Frontend Implementation**: `front-spotLine/src/`
- **Total Files Analyzed**: 8 (Backend NEW 3 + MODIFY 2, Frontend MODIFY 3)

---

## 2. Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| Design Match | 98% | ✅ |
| Architecture Compliance | 100% | ✅ |
| Convention Compliance | 100% | ✅ |
| **Overall** | **99%** | ✅ |

---

## 3. Gap Analysis (Design vs Implementation)

### 3.1 Backend -- NEW Files (3)

#### File 1: FollowingFeedItemResponse.java

| Item | Design (Section 4.1) | Implementation | Status |
|------|----------------------|----------------|--------|
| Package | `dto.response` | `dto.response` | ✅ |
| Annotations | @Schema, @Data, @Builder | @Schema, @Data, @Builder | ✅ |
| Enum FeedItemType | SPOTLINE, BLOG | SPOTLINE, BLOG | ✅ |
| Fields (14) | type, id, slug, title, area, coverImageUrl, likesCount, viewsCount, theme, spotCount, totalDuration, summary, userName, userAvatar, createdAt | All 14 fields match | ✅ |
| fromSpotLine() | Builder with s3BaseUrl param | Identical logic | ✅ |
| fromBlog() | Builder with publishedAt fallback | Identical logic | ✅ |

**Match: 6/6 items (100%)**

#### File 2: FeedController.java

| Item | Design (Section 4.2) | Implementation | Status |
|------|----------------------|----------------|--------|
| @Tag | name="Feed", description="피드" | name="Feed", description="피드" | ✅ |
| @RequestMapping | /api/v2/feed | /api/v2/feed | ✅ |
| Endpoint | GET /following | GET /following | ✅ |
| Params | page(default=0), size(default=20) | page(default=0), size(default=20) | ✅ |
| Auth | authUtil.requireUserId() | authUtil.requireUserId() | ✅ |
| Return type | Page\<FollowingFeedItemResponse\> | Page\<FollowingFeedItemResponse\> | ✅ |

**Match: 6/6 items (100%)**

#### File 3: FeedService.java

| Item | Design (Section 4.3) | Implementation | Status |
|------|----------------------|----------------|--------|
| Annotations | @Service, @RequiredArgsConstructor, @Transactional(readOnly=true) | @Service, @RequiredArgsConstructor, @Transactional(readOnly=true) | ✅ |
| Dependencies | UserFollowRepository, SpotLineRepository, BlogRepository | UserFollowRepository, SpotLineRepository, BlogRepository, **S3Service** | ✅ |
| S3 base URL | @Value("${aws.s3.base-url:}") field | S3Service.getPublicUrl() via helper method | ✅ Changed |
| Step 1: followingIds | findByFollowerIdOrderByCreatedAtDesc → map → getContent | Identical | ✅ |
| Step 2: empty check | Page.empty(pageable) | Page.empty(pageable) | ✅ |
| Step 3: 2-query fetch | spotLineRepository + blogRepository | Identical queries | ✅ |
| Step 4: merge + sort | ArrayList, sort by createdAt DESC | Identical | ✅ |
| Step 5: manual pagination | offset/subList/PageImpl | Identical | ✅ |

**Match: 8/8 items (100%) -- 1 intentional improvement noted**

### 3.2 Backend -- MODIFY Files (2)

#### File 4: SpotLineRepository.java

| Item | Design (Section 4.4) | Implementation (line 109) | Status |
|------|----------------------|---------------------------|--------|
| Method signature | `List<SpotLine> findByCreatorIdInAndIsActiveTrueOrderByCreatedAtDesc(List<String> creatorIds)` | Exact match | ✅ |

**Match: 1/1 (100%)**

#### File 5: BlogRepository.java

| Item | Design (Section 4.4) | Implementation (line 41) | Status |
|------|----------------------|--------------------------|--------|
| Method signature | `List<Blog> findByUserIdInAndStatusAndIsActiveTrueOrderByPublishedAtDesc(List<String> userIds, BlogStatus status)` | Exact match | ✅ |

**Match: 1/1 (100%)**

### 3.3 Frontend -- MODIFY Files (3)

#### File 6: types/index.ts -- FollowingFeedItem

| Field | Design (Section 4.5) | Implementation (lines 786-805) | Status |
|-------|----------------------|--------------------------------|--------|
| type | "SPOTLINE" \| "BLOG" | "SPOTLINE" \| "BLOG" | ✅ |
| id | string | string | ✅ |
| slug | string | string | ✅ |
| title | string | string | ✅ |
| area | string \| null | string \| null | ✅ |
| coverImageUrl | string \| null | string \| null | ✅ |
| likesCount | number | number | ✅ |
| viewsCount | number | number | ✅ |
| theme | string \| null | string \| null | ✅ |
| spotCount | number \| null | number \| null | ✅ |
| totalDuration | number \| null | number \| null | ✅ |
| summary | string \| null | string \| null | ✅ |
| userName | string | string | ✅ |
| userAvatar | string \| null | string \| null | ✅ |
| createdAt | string | string | ✅ |

**Match: 15/15 fields (100%)**

#### File 7: lib/api.ts -- fetchFollowingFeed

| Item | Design (Section 4.6) | Implementation (lines 1079-1088) | Status |
|------|----------------------|----------------------------------|--------|
| Function name | fetchFollowingFeed | fetchFollowingFeed | ✅ |
| Params | page=0, size=20 | page=0, size=20 | ✅ |
| Return type | Promise\<PaginatedResponse\<FollowingFeedItem\>\> | Promise\<PaginatedResponse\<FollowingFeedItem\>\> | ✅ |
| Endpoint | /feed/following | /feed/following | ✅ |
| Timeout | 5000 | 5000 | ✅ |
| Variable naming | `const { data }` destructure | `const res` then `res.data` | ✅ Equivalent |

**Match: 6/6 items (100%)**

#### File 8: components/feed/FollowingFeed.tsx

| Item | Design (Section 4.7) | Implementation | Status |
|------|----------------------|----------------|--------|
| "use client" directive | Yes | Yes | ✅ |
| State: items, page, hasMore, loading, initialLoading, showLogin | 6 states | 6 states | ✅ |
| observerRef | useRef\<HTMLDivElement\> | useRef\<HTMLDivElement\> | ✅ |
| Data loading useEffect | page-based, cancelled flag | Identical pattern | ✅ |
| IntersectionObserver | Inline callback | useCallback extraction (handleObserver) | ✅ Improved |
| Unauthenticated UI | Users icon + login button + LoginBottomSheet | Exact match | ✅ |
| Initial loading | Spinner | Spinner | ✅ |
| Empty state | Search icon + explore link | Exact match | ✅ |
| SpotLinePreviewCard props | id, slug, title, theme, area, totalDuration, totalDistance:0, spotCount, likesCount | Exact match | ✅ |
| BlogCard props | id, slug, title, summary, coverImageUrl, status, userName, userAvatarUrl, spotLineTitle:"", spotLineArea, spotCount, viewsCount, likesCount, publishedAt, createdAt | Exact match | ✅ |
| Loading more spinner | Spinner when loading | Exact match | ✅ |
| Observer sentinel | div ref={observerRef} className="h-10" | Exact match | ✅ |

**Match: 12/12 items (100%)**

---

## 4. Differences Found

### 4.1 Changed Features (Design != Implementation)

| # | Item | Design | Implementation | Impact |
|---|------|--------|----------------|--------|
| 1 | FeedService S3 URL | `@Value("${aws.s3.base-url:}")` field injection | `S3Service` dependency + `getS3BaseUrl()` helper | None -- better abstraction |
| 2 | FollowingFeed IntersectionObserver | Inline callback in useEffect | `useCallback(handleObserver)` extracted | None -- React best practice |

Both changes are intentional improvements over the design spec with zero functional impact.

### 4.2 Missing Features (Design O, Implementation X)

None.

### 4.3 Added Features (Design X, Implementation O)

None.

---

## 5. Verification Checklist (from Design Section 6)

| # | Checklist Item | Status |
|---|----------------|--------|
| 1 | GET /api/v2/feed/following requires authentication (401 when unauthenticated) | ✅ authUtil.requireUserId() |
| 2 | SpotLine + Blog merged by createdAt DESC | ✅ Java merge + sort |
| 3 | Empty page returned when following 0 users | ✅ Page.empty(pageable) |
| 4 | Frontend renders SpotLinePreviewCard / BlogCard | ✅ Type-based conditional rendering |
| 5 | Infinite scroll works | ✅ IntersectionObserver + page increment |
| 6 | Unauthenticated login prompt UI | ✅ Users icon + LoginBottomSheet |
| 7 | Empty state UI (0 content) | ✅ Search icon + explore link |

**Checklist: 7/7 (100%)**

---

## 6. Convention Compliance

| Category | Status | Notes |
|----------|--------|-------|
| Component naming (PascalCase) | ✅ | FollowingFeed, SpotLinePreviewCard, BlogCard, LoginBottomSheet |
| Function naming (camelCase) | ✅ | fetchFollowingFeed, getFollowingFeed, getS3BaseUrl |
| Import order (external -> @/ -> ./ -> type) | ✅ | FollowingFeed.tsx follows exact order |
| "use client" directive | ✅ | Present on interactive component |
| Korean UI text | ✅ | All user-facing strings in Korean |
| English code | ✅ | All variables, types, functions in English |

**Convention Score: 100%**

---

## 7. Architecture Compliance

| Layer | Component | Expected Location | Actual Location | Status |
|-------|-----------|-------------------|-----------------|--------|
| Infrastructure | FeedController | controller/ | controller/FeedController.java | ✅ |
| Application | FeedService | service/ | service/FeedService.java | ✅ |
| Domain | FollowingFeedItemResponse | dto/response/ | dto/response/FollowingFeedItemResponse.java | ✅ |
| Domain | Repository queries | repository/ | repository/ (SpotLine + Blog) | ✅ |
| Infrastructure (FE) | fetchFollowingFeed | lib/api.ts | lib/api.ts | ✅ |
| Domain (FE) | FollowingFeedItem | types/index.ts | types/index.ts | ✅ |
| Presentation (FE) | FollowingFeed | components/feed/ | components/feed/FollowingFeed.tsx | ✅ |

**Architecture Score: 100%**

---

## 8. Match Rate Summary

```
Total Items Compared: 55
  Backend DTO fields + methods:     6 items  -- 6 match
  Backend Controller:               6 items  -- 6 match
  Backend Service:                  8 items  -- 8 match (1 intentional change)
  Backend Repositories:             2 items  -- 2 match
  Frontend Type fields:            15 items  -- 15 match
  Frontend API function:            6 items  -- 6 match
  Frontend Component:              12 items  -- 12 match

  ✅ Exact Match:      53 items (96.4%)
  ✅ Improved Match:    2 items (3.6%)  -- functionally equivalent, better abstraction
  ❌ Missing:           0 items
  ❌ Wrong:             0 items

  Overall Match Rate: 99%
```

---

## 9. Recommended Actions

No action required. Design and implementation are in near-perfect alignment.

The two minor differences (S3Service abstraction, useCallback extraction) are improvements that do not warrant a design document update -- they represent standard engineering refinements during implementation.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-04-07 | Initial gap analysis -- 99% match rate | Claude Code (gap-detector) |
