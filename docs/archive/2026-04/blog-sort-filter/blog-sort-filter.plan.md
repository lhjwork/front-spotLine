# Plan: blog-sort-filter

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | `/blogs` 피드에 지역 필터만 존재하고, 정렬 옵션이 없어 사용자가 인기/최신 블로그를 구분할 수 없음. `/my-blogs`에도 상태 탭만 있고 정렬 없음. |
| **Solution** | 기존 FeedSortDropdown 패턴을 재활용하여 `/blogs`와 `/my-blogs` 양쪽에 정렬 드롭다운 추가. URL 파라미터 동기화로 공유 가능한 필터 상태 유지. |
| **Function UX Effect** | 인기순/최신순 정렬로 콘텐츠 발견성 향상. 필터 상태가 URL에 반영되어 북마크/공유 가능. |
| **Core Value** | 블로그 콘텐츠 소비 경험 개선 → 체류 시간 증가 → SEO 콘텐츠 전략 강화. |

---

## 1. Feature Overview

- **Feature Name**: blog-sort-filter
- **Priority**: Medium
- **Scope**: Frontend only (Backend API 이미 sort 파라미터 지원 확인 필요)

### 1.1 Background

현재 블로그 피드(`/blogs`)는 FeedAreaTabs로 지역 필터링만 가능하고, 정렬 옵션이 없다. 사용자는 인기 블로그와 최신 블로그를 구분할 수 없어 콘텐츠 발견이 제한적이다.

Feed 페이지(`/feed`)에는 이미 `FeedSortDropdown`, `FeedFilterReset`, URL 파라미터 동기화가 구현되어 있어, 동일 패턴을 블로그 피드에 적용하면 된다.

### 1.2 Goals

- `/blogs` 페이지에 정렬 드롭다운 추가 (인기순/최신순)
- `/my-blogs` 페이지에 정렬 드롭다운 추가
- URL 파라미터 동기화 (`?sort=newest&area=성수`)
- 필터 초기화 버튼 추가

---

## 2. Functional Requirements

### FR-01: Blog Sort Dropdown (`/blogs`)
- FeedSortDropdown 패턴 재활용
- 옵션: "인기순" (popular, 기본값), "최신순" (newest)
- 정렬 변경 시 목록 리셋 + 재요청
- Area 필터와 독립적으로 동작

### FR-02: Blog Sort Dropdown (`/my-blogs`)
- 기존 상태 탭(전체/초안/발행됨) 아래에 정렬 드롭다운 추가
- 옵션: "최신순" (newest, 기본값), "오래된순" (oldest)
- 상태 탭 변경 시 정렬 유지

### FR-03: URL Parameter Sync
- FeedPage 패턴 적용: `sort`, `area` 파라미터를 URL에 반영
- 기본값은 URL에서 생략 (popular은 기본이므로 `?sort=popular` 생략)
- URL로 직접 접근 시 필터 복원
- `router.replace()` 사용 (히스토리 스택 오염 방지)

### FR-04: Filter Reset
- FeedFilterReset 패턴 재활용
- 정렬이 기본값이 아니거나 area 필터가 활성화된 경우에만 표시
- 클릭 시 모든 필터 초기화 + 목록 재요청

---

## 3. Technical Approach

### 3.1 Reusable Components (from `/feed`)

| Component | Location | Reuse Method |
|-----------|----------|--------------|
| FeedSortDropdown | `src/components/feed/FeedSortDropdown.tsx` | 직접 import (FeedSort 타입 호환) |
| FeedAreaTabs | `src/components/feed/FeedAreaTabs.tsx` | 이미 `/blogs`에서 사용 중 |
| FeedFilterReset | `src/components/feed/FeedFilterReset.tsx` | props 조정 후 import |

### 3.2 Type Definitions

```typescript
// 기존 FeedSort 타입 재활용
export type FeedSort = "popular" | "newest";
// 또는 BlogSort로 별도 정의 (필요 시)
```

### 3.3 API Changes

```typescript
// fetchBlogs에 sort 파라미터 추가
export async function fetchBlogs(
  page = 0, size = 20, area?: string, sort?: string
)

// fetchMyBlogs에 sort 파라미터 추가
export async function fetchMyBlogs(
  status?: string, page = 0, size = 20, sort?: string
)
```

### 3.4 Files to Modify

| File | Change |
|------|--------|
| `src/app/blogs/BlogsPageClient.tsx` | sort 상태 추가, FeedSortDropdown 렌더, URL 동기화 |
| `src/components/blog/MyBlogsList.tsx` | sort 상태 추가, FeedSortDropdown 렌더 |
| `src/lib/api.ts` | fetchBlogs, fetchMyBlogs에 sort 파라미터 추가 |
| `src/types/index.ts` | BlogSort 타입 추가 (또는 FeedSort 재활용 확인) |

### 3.5 Backend Dependency

- Spring Boot `/api/v2/blogs` 엔드포인트가 `sort` 쿼리 파라미터를 지원하는지 확인 필요
- 미지원 시: Backend 수정 필요 (별도 PDCA) 또는 Frontend 클라이언트 사이드 정렬 (비추)
- 지원 시: API 함수에 파라미터만 추가

---

## 4. Constraints & Risks

| Risk | Mitigation |
|------|------------|
| Backend가 sort 미지원 | Swagger UI 확인 → 미지원 시 Backend PDCA 선행 |
| FeedSortDropdown이 blog context에 맞지 않을 수 있음 | props 호환성 확인, 필요 시 BlogSortDropdown 분리 |
| SSR 초기 데이터와 클라이언트 필터 불일치 | 초기 렌더에 기본 정렬(popular) 사용, hydration mismatch 방지 |

---

## 5. Success Criteria

- [ ] `/blogs`에서 인기순/최신순 정렬 전환 가능
- [ ] `/my-blogs`에서 최신순/오래된순 정렬 전환 가능
- [ ] URL 파라미터에 필터 상태 반영
- [ ] 필터 초기화 버튼 동작
- [ ] 기존 area 필터와 sort 필터 조합 동작
- [ ] `pnpm type-check` 통과
- [ ] `pnpm build` 통과
