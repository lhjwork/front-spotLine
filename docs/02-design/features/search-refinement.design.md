# search-refinement Design Document

> **Summary**: 검색 페이지에 area/category/theme 필터 칩, 정렬 옵션, 결과 카운트, URL 동기화를 추가
>
> **Project**: Spotline
> **Author**: Crew
> **Date**: 2026-04-16
> **Status**: Draft
> **Planning Doc**: [search-refinement.plan.md](../01-plan/features/search-refinement.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 기존 `SearchPageClient.tsx`를 확장하여 필터/정렬 기능 추가 (파일 신규 생성 최소화)
- Backend API가 이미 지원하는 area, category, theme, sort 파라미터를 frontend에서 활용
- 기존 Explore 페이지의 상수(AREA_CENTERS, CATEGORY_COLORS, THEMES)를 재사용
- URL 쿼리 파라미터로 필터 상태 공유 가능

### 1.2 Design Principles

- **최소 변경**: SearchPageClient.tsx 수정 + 필터 컴포넌트 1개 추가
- **기존 패턴 재사용**: FeedCategoryChips 패턴, cn() 유틸리티, 모바일 퍼스트
- **Backend 변경 없음**: 이미 지원되는 API 파라미터만 활용

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────┐
│ SearchPageClient.tsx (수정)              │
│  ┌───────────────────────────────────┐  │
│  │ 검색 입력 (기존)                    │  │
│  ├───────────────────────────────────┤  │
│  │ SearchFilters (신규 컴포넌트)       │  │
│  │  ├ Area 칩 (7개 지역)              │  │
│  │  ├ Category 칩 (Spot탭, 10개)      │  │
│  │  └ Theme 칩 (SpotLine탭, 7개)      │  │
│  ├───────────────────────────────────┤  │
│  │ 결과 카운트 + 정렬 드롭다운         │  │
│  ├───────────────────────────────────┤  │
│  │ Spot/SpotLine 탭 + 결과 (기존)     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Backend API (기존)   │
│ GET /api/v2/spots   │
│ GET /api/v2/spotlines/popular │
└─────────────────────┘
```

### 2.2 Data Flow

```
URL params 초기화 → 필터 상태 설정
    ↓
사용자 필터/정렬 변경 → 상태 업데이트 → URL 동기화
    ↓
debouncedQuery + area + category/theme + sort → API 호출
    ↓
결과 렌더링 (카운트 표시)
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| SearchPageClient | fetchFeedSpots, fetchFeedSpotLines | API 호출 (기존) |
| SearchPageClient | AREA_CENTERS | area 필터 목록 (기존 상수) |
| SearchPageClient | CATEGORY_COLORS | category 필터 목록 (기존 상수) |
| SearchPageClient | THEMES | theme 필터 목록 (기존 상수) |
| SearchFilters | cn() | 조건부 클래스 (기존 유틸) |

---

## 3. Data Model

### 3.1 State Interface

```typescript
// SearchPageClient 내부 상태 (신규 추가)
// 별도 타입 파일 불필요 — 컴포넌트 내부에서 정의
type SortOption = "POPULAR" | "NEWEST";

// 신규 상태
const [area, setArea] = useState<string | null>(searchParams.get("area"));
const [category, setCategory] = useState<string | null>(searchParams.get("category"));
const [sort, setSort] = useState<SortOption>((searchParams.get("sort") as SortOption) || "POPULAR");
const [totalCount, setTotalCount] = useState<number>(0);
```

### 3.2 URL Query Parameters

```
/search?q=카페&tab=spot&area=성수&category=cafe&sort=POPULAR
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| q | string | "" | 검색 키워드 |
| tab | "spot" \| "spotline" | "spot" | 활성 탭 |
| area | string \| null | null | 지역 필터 (한글, e.g. "성수") |
| category | string \| null | null | 카테고리 필터 (Spot 탭 전용) |
| theme | string \| null | null | 테마 필터 (SpotLine 탭 전용, category 대신) |
| sort | "POPULAR" \| "NEWEST" | "POPULAR" | 정렬 기준 |

- 기본값인 경우 URL에서 제외 (깔끔한 URL 유지)
- 탭 전환 시 category/theme은 초기화

---

## 4. API Specification

### 4.1 기존 API 활용 (변경 없음)

#### `GET /api/v2/spots`

```typescript
fetchFeedSpots(
  area?: string,      // "성수", "을지로" 등
  category?: string,  // "cafe", "restaurant" 등
  page: number,
  size: number,
  sort?: string,      // "POPULAR" | "NEWEST"
  keyword?: string
): Promise<PaginatedResponse<SpotDetailResponse>>
```

#### `GET /api/v2/spotlines/popular`

```typescript
fetchFeedSpotLines(
  area?: string,
  theme?: string,     // "date", "travel" 등
  page: number,
  size: number,
  keyword?: string,
  sort?: string
): Promise<PaginatedResponse<SpotLinePreview>>
```

### 4.2 PaginatedResponse 구조

```typescript
interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;  // ← 이 필드로 결과 카운트 표시
  totalPages: number;
  last: boolean;
  // ...
}
```

---

## 5. UI/UX Design

### 5.1 Screen Layout (모바일 기준)

```
┌────────────────────────────────┐
│ [🔍 검색어 입력...]        [X] │  ← 기존 유지
├────────────────────────────────┤
│ 전체 | 성수 | 을지로 | 연남 | ▶│  ← Area 칩 (가로 스크롤)
├────────────────────────────────┤
│ 전체 | 카페 | 맛집 | 바 | ▶   │  ← Category/Theme 칩 (가로 스크롤)
├────────────────────────────────┤
│ [ Spot ] [ SpotLine ]          │  ← 탭 (기존)
├────────────────────────────────┤
│ 23개의 Spot     [인기순 ▾]     │  ← 결과 카운트 + 정렬
├────────────────────────────────┤
│ ┌──────┐ ┌──────┐              │
│ │ Card │ │ Card │              │  ← 결과 그리드 (기존)
│ └──────┘ └──────┘              │
│ ┌──────┐ ┌──────┐              │
│ │ Card │ │ Card │              │
│ └──────┘ └──────┘              │
├────────────────────────────────┤
│      [ 더 보기 ]               │  ← 기존 유지
└────────────────────────────────┘
```

### 5.2 빈 결과 상태 (개선)

```
┌────────────────────────────────┐
│                                │
│       🔍                       │
│  "성수 카페"에 대한             │
│  검색 결과가 없습니다            │
│                                │
│  [필터 초기화]  [탐색하기 →]    │
│                                │
└────────────────────────────────┘
```

### 5.3 필터 칩 스타일

| 상태 | 스타일 |
|------|--------|
| 비활성 | `bg-gray-100 text-gray-600` |
| 활성 | `bg-blue-600 text-white` |
| 호버 | `hover:bg-gray-200` (비활성), `hover:bg-blue-700` (활성) |

### 5.4 정렬 드롭다운

- 인라인 `<select>` 사용 (커스텀 드롭다운 불필요)
- 옵션: "인기순" (POPULAR), "최신순" (NEWEST)
- 우측 정렬, 결과 카운트와 같은 행

### 5.5 User Flow

```
검색 페이지 진입
  → URL에서 필터 상태 복원
  → 키워드 입력 OR 필터 선택
  → 300ms debounce 후 API 호출 (area + category/theme + sort + keyword)
  → 결과 렌더링 + 카운트 표시
  → 필터 변경 시 페이지 0으로 리셋 + URL 동기화
```

### 5.6 Component List

| Component | Location | Responsibility |
|-----------|----------|----------------|
| SearchPageClient | `src/app/search/SearchPageClient.tsx` | 검색 페이지 전체 (수정) |
| SearchFilters | `src/components/search/SearchFilters.tsx` | area/category/theme 필터 칩 (신규) |

---

## 6. Error Handling

| Scenario | Handling |
|----------|----------|
| API 호출 실패 | 기존 패턴 유지 — catch 블록에서 조용히 처리 |
| 잘못된 URL 파라미터 | 기본값으로 fallback (area=null, sort=POPULAR) |
| 빈 결과 | "검색 결과가 없습니다" + 필터 초기화 버튼 + Explore 링크 |

---

## 7. Security Considerations

- [x] URL 파라미터는 display only (XSS 위험 없음 — React 자동 이스케이프)
- [x] API 호출은 기존 api.ts 레이어 경유 (이미 검증됨)
- [x] 사용자 입력은 keyword만 — 기존 debounce + trim 유지

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Method |
|------|--------|--------|
| Manual | 필터/정렬 동작 | 브라우저 테스트 |
| Manual | URL 동기화 | URL 복사 → 새 탭에서 열기 |
| Manual | 모바일 반응형 | 뷰포트 축소 테스트 |
| Build | 빌드 성공 | `pnpm build` |
| Lint | 코드 품질 | `pnpm lint` |

### 8.2 Test Cases

- [x] 키워드 없이 필터만으로 검색 가능
- [x] 필터 변경 시 결과 갱신 + 페이지 리셋
- [x] 탭 전환 시 category↔theme 전환
- [x] URL에서 필터 상태 복원 (새로고침/공유)
- [x] "전체" 선택 시 필터 해제
- [x] 빈 결과에서 필터 초기화 동작
- [x] 모바일에서 필터 칩 가로 스크롤

---

## 9. Implementation Guide

### 9.1 File Structure

```
front-spotLine/src/
├── app/search/
│   ├── page.tsx                     (변경 없음)
│   └── SearchPageClient.tsx         (수정: 필터/정렬/카운트 추가)
├── components/search/
│   └── SearchFilters.tsx            (신규: area/category/theme 필터 칩)
└── constants/
    ├── explore.ts                   (기존: AREA_CENTERS, CATEGORY_COLORS 재사용)
    └── themes.ts                    (기존: THEMES 재사용)
```

### 9.2 Implementation Order

1. [ ] **SearchFilters.tsx** — 필터 칩 컴포넌트 생성
   - Props: `area`, `category`, `theme`, `tab`, `onAreaChange`, `onCategoryChange`, `onThemeChange`
   - Area 칩 행: "전체" + 7개 지역 (AREA_CENTERS 키 사용)
   - Category 칩 행: Spot 탭일 때 — "전체" + 10개 카테고리
   - Theme 칩 행: SpotLine 탭일 때 — "전체" + 7개 테마
   - 가로 스크롤: `overflow-x-auto scrollbar-hide`

2. [ ] **SearchPageClient.tsx 상태 추가** — area, category/theme, sort, totalCount 상태
   - URL 초기화: `searchParams.get("area")`, `searchParams.get("category")` 등
   - SortOption 타입 정의

3. [ ] **SearchPageClient.tsx URL 동기화** — 기존 useEffect 확장
   - area, category/theme, sort를 URL params에 추가
   - 기본값은 URL에서 제외

4. [ ] **SearchPageClient.tsx API 호출 수정** — 필터 파라미터 전달
   - `fetchFeedSpots(area, category, 0, PAGE_SIZE, sort, debouncedQuery)`
   - `fetchFeedSpotLines(area, theme, 0, PAGE_SIZE, debouncedQuery, sort)`
   - `result.totalElements`를 `totalCount`에 저장
   - 필터 변경 시 페이지 리셋

5. [ ] **결과 카운트 + 정렬 UI** — 탭 아래, 결과 위에 배치
   - 좌: "{N}개의 Spot/SpotLine" (totalCount 활용)
   - 우: `<select>` 정렬 드롭다운

6. [ ] **빈 결과 개선** — 현재 텍스트만 → 필터 초기화 버튼 + Explore 링크
   - 활성 필터 조건 표시
   - "필터 초기화" 버튼 → area/category/theme null로 리셋

7. [ ] **Explore 크로스 링크** (FR-08, Low)
   - 검색 빈 결과에 "탐색하기 →" 링크 (`/explore`)

### 9.3 SearchFilters.tsx 상세 설계

```typescript
"use client";

import { cn } from "@/lib/utils";
import { AREA_CENTERS, CATEGORY_COLORS } from "@/constants/explore";
import { THEMES } from "@/constants/themes";
import type { SpotCategory } from "@/types";

interface SearchFiltersProps {
  tab: "spot" | "spotline";
  area: string | null;
  category: string | null;   // Spot 탭 전용
  theme: string | null;      // SpotLine 탭 전용
  onAreaChange: (area: string | null) => void;
  onCategoryChange: (category: string | null) => void;
  onThemeChange: (theme: string | null) => void;
}

export default function SearchFilters({ ... }: SearchFiltersProps) {
  const areas = Object.keys(AREA_CENTERS);
  const categories = Object.keys(CATEGORY_COLORS) as SpotCategory[];

  return (
    <div className="space-y-2 px-4 py-2 border-b border-gray-100">
      {/* Area 칩 행 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        <ChipButton active={!area} onClick={() => onAreaChange(null)}>전체</ChipButton>
        {areas.map(a => (
          <ChipButton key={a} active={area === a} onClick={() => onAreaChange(area === a ? null : a)}>
            {a}
          </ChipButton>
        ))}
      </div>

      {/* Category/Theme 칩 행 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {tab === "spot" ? (
          <>
            <ChipButton active={!category} onClick={() => onCategoryChange(null)}>전체</ChipButton>
            {categories.map(c => (
              <ChipButton key={c} active={category === c} onClick={() => onCategoryChange(category === c ? null : c)}>
                {CATEGORY_LABELS[c]}
              </ChipButton>
            ))}
          </>
        ) : (
          <>
            <ChipButton active={!theme} onClick={() => onThemeChange(null)}>전체</ChipButton>
            {THEMES.map(t => (
              <ChipButton key={t.slug} active={theme === t.slug} onClick={() => onThemeChange(theme === t.slug ? null : t.slug)}>
                {t.name}
              </ChipButton>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function ChipButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      )}
    >
      {children}
    </button>
  );
}
```

### 9.4 카테고리 한글 레이블

```typescript
const CATEGORY_LABELS: Record<SpotCategory, string> = {
  cafe: "카페",
  restaurant: "맛집",
  bar: "바",
  nature: "자연",
  culture: "문화",
  exhibition: "전시",
  walk: "산책",
  activity: "액티비티",
  shopping: "쇼핑",
  other: "기타",
};
```

> 이 맵은 SearchFilters 컴포넌트 내부 또는 constants/explore.ts에 추가

### 9.5 SearchPageClient.tsx 수정 핵심

```typescript
// 신규 상태 (기존 상태 아래에 추가)
type SortOption = "POPULAR" | "NEWEST";
const [area, setArea] = useState<string | null>(searchParams.get("area"));
const [category, setCategory] = useState<string | null>(searchParams.get("category"));
const [theme, setTheme] = useState<string | null>(searchParams.get("theme"));
const [sort, setSort] = useState<SortOption>((searchParams.get("sort") as SortOption) || "POPULAR");
const [totalCount, setTotalCount] = useState(0);

// URL 동기화 useEffect 수정
useEffect(() => {
  const params = new URLSearchParams();
  if (debouncedQuery) params.set("q", debouncedQuery);
  if (tab !== "spot") params.set("tab", tab);
  if (area) params.set("area", area);
  if (tab === "spot" && category) params.set("category", category);
  if (tab === "spotline" && theme) params.set("theme", theme);
  if (sort !== "POPULAR") params.set("sort", sort);
  const qs = params.toString();
  router.replace(`/search${qs ? `?${qs}` : ""}`, { scroll: false });
}, [debouncedQuery, tab, area, category, theme, sort, router]);

// API 호출 수정 — 필터 전달 + totalCount 저장
// 검색어 없어도 필터만으로 검색 가능하도록 조건 변경
useEffect(() => {
  const hasFilter = debouncedQuery || area || category || theme;
  if (!hasFilter) { setSpots([]); setSpotLines([]); setTotalCount(0); return; }
  // ... API 호출에 area, category/theme, sort 전달
  // result.totalElements → setTotalCount(result.totalElements)
}, [debouncedQuery, tab, area, category, theme, sort]);

// 탭 변경 시 category/theme 초기화
const handleTabChange = useCallback((newTab: SearchTab) => {
  setTab(newTab);
  setCategory(null);
  setTheme(null);
  // ... 기존 리셋 로직
}, []);

// 필터 변경 핸들러 — 페이지 리셋
const handleAreaChange = (newArea: string | null) => { setArea(newArea); setSpotsPage(0); setSpotLinesPage(0); };
const handleCategoryChange = (newCategory: string | null) => { setCategory(newCategory); setSpotsPage(0); };
const handleThemeChange = (newTheme: string | null) => { setTheme(newTheme); setSpotLinesPage(0); };
```

---

## 10. Coding Convention Reference

| Item | Convention Applied |
|------|-------------------|
| Component naming | PascalCase: `SearchFilters` |
| Props interface | `SearchFiltersProps` |
| File naming | PascalCase: `SearchFilters.tsx` |
| State management | React useState (Zustand 불필요) |
| Styling | Tailwind CSS 4 + cn() |
| Import order | React → lucide-react → @/lib → @/constants → @/types |
| UI text | 한국어 ("전체", "인기순", "최신순") |
| 경로 별칭 | `@/*` |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-16 | Initial draft | Crew |
