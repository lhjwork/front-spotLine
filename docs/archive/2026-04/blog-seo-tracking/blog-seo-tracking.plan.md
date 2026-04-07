# Blog SEO & View Tracking Planning Document

> **Summary**: Blog 페이지의 view tracking 엔드포인트 추가 + sitemap에 blog 페이지 포함. SEO-first 전략의 핵심 gap 해결.
>
> **Project**: Spotline (front-spotLine + springboot-spotLine-backend)
> **Version**: 1.0.0
> **Date**: 2026-04-07
> **Status**: Planning

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | Blog 페이지가 sitemap에 누락되어 Google에 노출되지 않고, view tracking이 없어 블로그 콘텐츠 성과를 측정할 수 없다. |
| **Solution** | Backend에 `POST /api/v2/blogs/{id}/view` 엔드포인트 추가, ViewTracker 컴포넌트에 "blog" 타입 확장, sitemap.ts에 blog slug 포함. |
| **Function/UX Effect** | 블로그 접속 시 자동으로 조회수가 기록되고, 모든 공개 블로그가 검색엔진에 색인되어 유기적 트래픽 유입이 가능해진다. |
| **Core Value** | Cold Start 전략(콘텐츠+SEO)의 핵심 gap을 메우어, 크루/유저가 작성한 블로그가 실제 검색 트래픽으로 이어지게 한다. |

| Item | Detail |
|------|--------|
| Feature | Blog SEO & View Tracking |
| Created | 2026-04-07 |
| Duration | 예상 1일 (Backend 0.5일 + Frontend 0.5���) |
| Status | Planning |
| Level | Dynamic |
| Target Repo | front-spotLine + springboot-spotLine-backend |

---

## 1. Overview

### 1.1 Purpose

Spot/SpotLine에 이미 구현된 view tracking + sitemap 패턴을 Blog에도 동일하게 적용하여, SEO-first Cold Start 전략의 gap을 해결한다.

### 1.2 Background

- Blog 시스템은 `spotline-blog-builder` PDCA에서 구현 완료 (92% match rate, archived)
- 그러나 view tracking과 sitemap이 누락됨:
  - `blog/[slug]/page.tsx:58`에 TODO: "ViewTracker only supports spot/spotline"
  - `sitemap.ts`에 blog slug 미포함
- Spot/SpotLine은 완전한 파이프라인 보유: `POST /view` → `incrementView()` → `ViewTracker` → `sitemap.ts`
- Blog만 이 파이프라인이 빠져 있음

### 1.3 Current State

**이미 존재하는 것:**
- Blog CRUD API (BlogController.java — 10개 엔드포인트)
- Blog 상세 페이지 (`/blog/[slug]` — SSR + SEO metadata)
- `fetchBlogSlugs()` API 함수 (api.ts)
- `GET /api/v2/blogs/slugs` Backend 엔드포인트
- Blog entity에 `viewCount` 필드 (DB 컬럼)

**누락된 것:**
- `POST /api/v2/blogs/{id}/view` Backend 엔드포인트
- `incrementBlogView()` Frontend API 함수
- ViewTracker 컴포넌트의 "blog" 타입 지원
- sitemap.ts의 blog URL 생성

---

## 2. Scope

### 2.1 In Scope

- [ ] **Backend**: `POST /api/v2/blogs/{id}/view` 엔드포인트 (AnalyticsController 확장)
- [ ] **Backend**: BlogService에 `incrementViewCount()` 메서드
- [ ] **Frontend**: `incrementBlogView()` API 함수 추가 (api.ts)
- [ ] **Frontend**: ViewTracker 컴포넌트에 `"blog"` 타입 추가
- [ ] **Frontend**: blog/[slug]/page.tsx에서 TODO 제거 + ViewTracker 사용
- [ ] **Frontend**: sitemap.ts에 blog slug 추가

### 2.2 Out of Scope

- Blog 공개 목록 페이지 (`/blog` browse page) — 별도 feature
- Blog 인기 순위 (admin analytics) — 별도 feature
- Blog 댓글/좋아요 — 별도 feature
- Blog editor 개선 (reorder, SpotAddSheet UI) — 별도 feature

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `POST /api/v2/blogs/{id}/view` — Blog viewCount +1 | High | Pending |
| FR-02 | 중복 방지: 같은 세션에서 5분 내 재조회 시 카운트 증가 안 함 (기존 Spot 패턴과 동일) | Medium | Pending |
| FR-03 | `incrementBlogView(id)` Frontend API 함수 | High | Pending |
| FR-04 | ViewTracker에 `type: "blog"` 지원 추가 | High | Pending |
| FR-05 | blog/[slug]/page.tsx에서 ViewTracker 렌더링 | High | Pending |
| FR-06 | sitemap.ts에 `/blog/{slug}` URL 추가 (priority: 0.6, changefreq: weekly) | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria |
|----------|----------|
| Performance | View tracking은 fire-and-forget (페이지 로딩 차단 금지) |
| SEO | sitemap에 모든 공개(published) blog 포함, 비공개/삭제 blog 제외 |
| Consistency | Spot/SpotLine view tracking 패턴과 100% 동일한 구조 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] Blog 상세 페이지 접속 시 viewCount가 DB에서 증가
- [ ] 5분 내 동일 세션 재접속 시 중복 카운트 없음
- [ ] `/sitemap.xml`에 `/blog/{slug}` URL 포함 확인
- [ ] 기존 Spot/SpotLine view tracking 정상 동작 유지

### 4.2 Quality Criteria

- [ ] `pnpm lint` 에러 0
- [ ] `pnpm type-check` 통과
- [ ] `pnpm build` 성공
- [ ] `./gradlew build` 성공 (backend)

---

## 5. Architecture Considerations

### 5.1 Existing Pattern (Spot/SpotLine — 그대로 복제)

```
[Backend]
AnalyticsController.incrementSpotView(id)
  → SpotService.incrementViewCount(id)
    → spotRepository.incrementViewCount(id)

[Frontend]
ViewTracker({ type: "spot", id })
  → useEffect → incrementSpotView(id)  [fire-and-forget]

sitemap.ts
  → fetchAllSpotSlugs() → /spot/{slug} URLs
```

### 5.2 Blog 적용 (동일 패턴)

```
[Backend]
AnalyticsController.incrementBlogView(id)        ← NEW
  → BlogService.incrementViewCount(id)            ← NEW
    → blogRepository.incrementViewCount(id)       ← NEW (or existing)

[Frontend]
ViewTracker({ type: "blog", id })                 ← EXTEND
  → useEffect → incrementBlogView(id)             ← NEW

sitemap.ts
  → fetchBlogSlugs() → /blog/{slug} URLs          ← ADD CALL (function exists)
```

---

## 6. Implementation Order

| Step | Task | Repo | File | Status |
|------|------|------|------|--------|
| 1 | BlogService.incrementViewCount() | backend | BlogService.java | Pending |
| 2 | AnalyticsController.incrementBlogView() | backend | AnalyticsController.java | Pending |
| 3 | incrementBlogView() API 함수 | front | src/lib/api.ts | Pending |
| 4 | ViewTracker "blog" 타입 확장 | front | src/components/common/ViewTracker.tsx | Pending |
| 5 | blog/[slug]/page.tsx에 ViewTracker 추가 | front | src/app/blog/[slug]/page.tsx | Pending |
| 6 | sitemap.ts에 blog slug 추가 | front | src/app/sitemap.ts | Pending |

---

## 7. Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Blog viewCount 컬럼 없음 | High | 확인 필요: Blog entity에 viewCount 필드 존재 여부 |
| 대량 blog 시 sitemap 크기 | Low | 현재 blog 수 적음, 50,000개 초과 시 sitemap index 분리 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-04-07 | Initial plan — Blog SEO & View Tracking | Claude Code |
