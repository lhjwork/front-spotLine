# global-search Design Document

> **Summary**: 통합 검색 자동완성 + Blog 탭 추가 + 인기 검색어로 검색 경험 강화
>
> **Project**: Spotline
> **Author**: Crew
> **Date**: 2026-04-18
> **Status**: Draft
> **Plan Reference**: `docs/01-plan/features/global-search.plan.md`

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 검색 시 타이핑 중 미리보기가 없고, Blog 콘텐츠 검색 불가, 인기 검색어 안내 부재 |
| **Solution** | SearchAutocomplete(3종 통합 미리보기), Blog 탭 추가, 트렌딩 검색어 UI |
| **Function/UX Effect** | 2글자부터 실시간 자동완성, 3탭 통합 검색, 빈 검색 시 인기 검색어 가이드 |
| **Core Value** | Cold Start 시대 콘텐츠 발견 경험 극대화, 체류시간·소비율 향상 |

---

## 1. Architecture Overview

### 1.1 Component Hierarchy

```
SearchPageClient (기존)
├── SearchAutocomplete (NEW) ← FeedSearchBar 대체
│   ├── AutocompleteResults (NEW)
│   │   ├── Spot 섹션 (최대 3개)
│   │   ├── SpotLine 섹션 (최대 3개)
│   │   └── Blog 섹션 (최대 3개)
│   └── TrendingSearches (NEW) ← 빈 입력 시 포커스
├── SearchFilters (기존, MODIFY: blog 탭 지원)
├── SpotPreviewCard (기존)
├── SpotLinePreviewCard (기존)
└── BlogPreviewCard (NEW 또는 기존 재사용)

FeedPage (기존)
└── SearchAutocomplete (NEW) ← FeedSearchBar 교체
```

### 1.2 Data Flow

```
사용자 타이핑 (2+ 글자)
  → 300ms debounce
  → AbortController로 이전 요청 취소
  → Promise.allSettled([
      fetchFeedSpots(keyword, size=3),
      fetchFeedSpotLines(keyword, size=3),
      fetchBlogs(keyword?, size=3)     ← keyword 미지원 시 생략
    ])
  → AutocompleteResults에 결과 표시

항목 클릭 → /spot/[slug] | /spotline/[slug] | /blog/[slug]
"전체 결과 보기" → /search?q={keyword}&tab={tab}
Enter → /search?q={keyword}
```

---

## 2. Component Specifications

### 2.1 SearchAutocomplete (NEW)

**파일**: `src/components/search/SearchAutocomplete.tsx`

```typescript
interface SearchAutocompleteProps {
  defaultValue?: string;
  onSearch: (keyword: string) => void;  // Enter 또는 "전체 결과 보기" 시
  placeholder?: string;
  className?: string;
}
```

**상태 관리**:
```typescript
const [inputValue, setInputValue] = useState(defaultValue || "");
const [isOpen, setIsOpen] = useState(false);           // 드롭다운 열림
const [results, setResults] = useState<AutocompleteData | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [activeIndex, setActiveIndex] = useState(-1);     // 키보드 네비게이션
const abortRef = useRef<AbortController | null>(null);  // 이전 요청 취소
const timerRef = useRef<ReturnType<typeof setTimeout>>();
```

**핵심 로직**:
- `handleInputChange(value)`: 300ms debounce 후 `fetchAutocomplete(value)` 호출
- `fetchAutocomplete(keyword)`: AbortController로 이전 요청 취소, 3 API 병렬 호출
- `handleSelect(item)`: 상세 페이지로 이동 (`window.location.href`)
- `handleSearchAll()`: `onSearch(inputValue)` 호출
- 외부 클릭 시 드롭다운 닫기 (`useEffect` + `mousedown` 이벤트)
- 포커스 시 + 빈 입력: TrendingSearches 표시

**ARIA 속성**:
```html
<div role="combobox" aria-expanded={isOpen} aria-haspopup="listbox">
  <input
    role="searchbox"
    aria-autocomplete="list"
    aria-controls="autocomplete-listbox"
    aria-activedescendant={activeIndex >= 0 ? `ac-item-${activeIndex}` : undefined}
  />
  <ul id="autocomplete-listbox" role="listbox">
    <li id="ac-item-0" role="option" aria-selected={activeIndex === 0}>...</li>
  </ul>
</div>
```

**키보드 네비게이션** (FR-07):
| Key | Action |
|-----|--------|
| `ArrowDown` | activeIndex + 1 (순환) |
| `ArrowUp` | activeIndex - 1 (순환) |
| `Enter` | activeIndex >= 0 → 항목 선택, 아니면 전체 검색 |
| `Escape` | 드롭다운 닫기 |

### 2.2 AutocompleteResults (NEW)

**파일**: `src/components/search/AutocompleteResults.tsx`

```typescript
interface AutocompleteData {
  spots: SpotDetailResponse[];
  spotLines: SpotLinePreview[];
  blogs: BlogListItem[];
}

interface AutocompleteResultsProps {
  data: AutocompleteData;
  keyword: string;
  activeIndex: number;
  onSelect: (type: "spot" | "spotline" | "blog", slug: string) => void;
  onSearchAll: (tab?: SearchTab) => void;
}
```

**레이아웃**:
```
┌─────────────────────────────────┐
│ Spot                    더보기 > │
│ ┌─ 📍 카페 라뗄르              │
│ ├─ 📍 을지로 카페              │
│ └─ 📍 성수 카페                │
│─────────────────────────────────│
│ SpotLine                더보기 > │
│ ┌─ 🗺️ 성수동 카페 투어         │
│ └─ 🗺️ 을지로 야경 코스         │
│─────────────────────────────────│
│ Blog                    더보기 > │
│ ┌─ 📝 성수동 카페 리뷰         │
│ └─ 📝 을지로 맛집 탐방         │
│─────────────────────────────────│
│ "카페" 전체 결과 보기 →          │
└─────────────────────────────────┘
```

**각 항목 렌더링**:
- Spot: `MapPin` 아이콘 + title + area (1줄)
- SpotLine: `Route` 아이콘 + title + `{spotCount}곳` (1줄)
- Blog: `FileText` 아이콘 + title + userName (1줄)
- 섹션별 "더보기" → `/search?q={keyword}&tab={type}` 이동
- 하단 "전체 결과 보기" → `/search?q={keyword}` 이동

**스타일**:
- `max-h-[400px] overflow-y-auto` (모바일: `max-h-[60vh]`)
- `absolute top-full left-0 right-0 z-50`
- `bg-white rounded-lg shadow-lg border border-gray-200`
- 활성 항목: `bg-blue-50`

### 2.3 TrendingSearches (NEW)

**파일**: `src/components/search/TrendingSearches.tsx`

```typescript
interface TrendingSearchesProps {
  onSelect: (keyword: string) => void;
}
```

**데이터**: `src/constants/trendingSearches.ts`에서 정적 배열 import

```typescript
// src/constants/trendingSearches.ts
export const TRENDING_SEARCHES = [
  "성수동 카페",
  "을지로",
  "한남동",
  "익선동 맛집",
  "연남동",
  "북촌",
  "망원동 브런치",
  "서촌 산책",
] as const;
```

**레이아웃**:
```
┌─────────────────────────────────┐
│ 🔥 인기 검색어                   │
│ [성수동 카페] [을지로] [한남동]    │
│ [익선동 맛집] [연남동] [북촌]     │
│ [망원동 브런치] [서촌 산책]       │
└─────────────────────────────────┘
```

- 칩 형태 (`rounded-full bg-gray-100 px-3 py-1.5 text-sm`)
- 클릭 시 `onSelect(keyword)` → 검색 실행
- 검색 입력 포커스 + 빈 입력일 때만 표시

### 2.4 SearchFilters (MODIFY)

**파일**: `src/components/search/SearchFilters.tsx`

변경사항:
```typescript
// Before
export interface SearchFiltersProps {
  tab: "spot" | "spotline";
  // ...
}

// After
export interface SearchFiltersProps {
  tab: "spot" | "spotline" | "blog";
  // ...
}
```

**Blog 탭 필터 동작**:
- `tab === "blog"` → area 칩만 표시, category/theme 칩 숨김
- Blog은 area 기반 필터만 지원 (fetchBlogs의 파라미터 기반)

```tsx
{tab === "spot" ? (
  /* 카테고리 칩 */
) : tab === "spotline" ? (
  /* 테마 칩 */
) : null}
{/* blog 탭: 2번째 줄 필터 없음 (area만 표시) */}
```

### 2.5 SearchPageClient (MODIFY)

**파일**: `src/app/search/SearchPageClient.tsx`

#### 타입 변경

```typescript
// Before
type SearchTab = "spot" | "spotline";

// After
type SearchTab = "spot" | "spotline" | "blog";
```

#### Blog 탭 추가 (탭 배열)

```typescript
const TABS: { key: SearchTab; label: string }[] = [
  { key: "spot", label: "Spot" },
  { key: "spotline", label: "SpotLine" },
  { key: "blog", label: "Blog" },
];
```

#### Blog 검색 실행

```typescript
// Blog 탭 검색 분기 추가
if (activeTab === "blog") {
  const data = await fetchBlogs(0, PAGE_SIZE, selectedArea || undefined, selectedSort);
  // Note: fetchBlogs에 keyword 파라미터 미지원
  // → 클라이언트 필터링 또는 Backend 수정 필요 (Risk 참조)
  setBlogResults(data.content);
  setHasMoreBlogs(!data.last);
}
```

#### 새로운 상태 변수

```typescript
const [blogResults, setBlogResults] = useState<BlogListItem[]>([]);
const [hasMoreBlogs, setHasMoreBlogs] = useState(false);
const [blogPage, setBlogPage] = useState(0);
```

#### Blog 결과 렌더링

기존 `SpotPreviewCard`/`SpotLinePreviewCard` 패턴을 따르는 `BlogPreviewCard` 사용.
- title, summary, coverImageUrl, userName, viewsCount, likesCount 표시
- 클릭 시 `/blog/{slug}` 이동

#### FeedSearchBar → SearchAutocomplete 교체

```typescript
// Before (SearchPageClient 상단 검색 영역)
<input type="text" ... />

// After
<SearchAutocomplete
  defaultValue={query}
  onSearch={(keyword) => {
    setQuery(keyword);
    addRecentSearch(keyword);
    router.push(`/search?q=${encodeURIComponent(keyword)}&tab=${activeTab}`);
  }}
  placeholder="Spot, SpotLine, Blog 검색"
/>
```

### 2.6 FeedSearchBar → SearchAutocomplete 교체 (FR-06)

**파일**: `src/components/feed/FeedSearchBar.tsx`

FeedSearchBar를 유지하되, 내부에서 SearchAutocomplete를 사용하도록 변경:

```typescript
import SearchAutocomplete from "@/components/search/SearchAutocomplete";

export default function FeedSearchBar({ value, onChange }: FeedSearchBarProps) {
  return (
    <SearchAutocomplete
      defaultValue={value}
      onSearch={onChange}
      placeholder="장소, 크루노트 검색"
    />
  );
}
```

이렇게 하면 FeedSearchBar를 사용하는 기존 코드 변경 최소화.

### 2.7 피드 페이지 텍스트 수정 (FR-08)

**파일**: `src/app/feed/page.tsx`

```typescript
// Before
<p>인기 Spot과 Route를 탐색하세요</p>

// After
<p>인기 Spot과 SpotLine을 탐색하세요</p>
```

---

## 3. API Specification

### 3.1 기존 API 활용

| API Function | Endpoint | keyword 지원 | 용도 |
|-------------|----------|:---:|------|
| `fetchFeedSpots` | `GET /api/v2/spots` | ✅ | Spot 검색 + 자동완성 |
| `fetchFeedSpotLines` | `GET /api/v2/spotlines/popular` | ✅ | SpotLine 검색 + 자동완성 |
| `fetchBlogs` | `GET /api/v2/blogs` | ❌ | Blog 탭 (area/sort만) |

### 3.2 fetchBlogs keyword 미지원 대응

**현재 상태**: `fetchBlogs(page, size, area?, sort?)` — keyword 파라미터 없음.

**대응 전략** (우선순위 순):

1. **Backend 확인**: Spring Boot Backend에서 `/api/v2/blogs` 엔드포인트가 `keyword` 쿼리 파라미터를 이미 지원하는지 Swagger에서 확인 → 지원하면 `fetchBlogs`에 `keyword` 파라미터 추가만 하면 됨
2. **Backend 미지원 시**: `fetchBlogs`에 keyword 추가하되, Backend에서 무시됨 → Blog 탭은 area/sort 필터만으로 동작, 자동완성에서 Blog 섹션은 최신순 3개 표시 (keyword 매칭 없음)
3. **클라이언트 필터링**: Blog 결과를 가져온 후 title/summary에서 keyword를 포함하는 항목만 필터 → 정확도 낮고 페이지네이션 문제

**구현 결정**: 전략 1 시도 → 실패 시 전략 2로 폴백. 자동완성에서 Blog 섹션은 keyword 미지원 시 "최신 Blog" 라벨로 표시.

### 3.3 자동완성 API 호출 패턴

```typescript
async function fetchAutocomplete(keyword: string, signal: AbortSignal) {
  const [spotsResult, spotLinesResult, blogsResult] = await Promise.allSettled([
    fetchFeedSpots(undefined, undefined, 0, 3, undefined, keyword),
    fetchFeedSpotLines(undefined, undefined, 0, 3, keyword),
    fetchBlogs(0, 3),  // keyword 미지원 시 최신 3개
  ]);

  return {
    spots: spotsResult.status === "fulfilled" ? spotsResult.value.content : [],
    spotLines: spotLinesResult.status === "fulfilled" ? spotLinesResult.value.content : [],
    blogs: blogsResult.status === "fulfilled" ? blogsResult.value.content : [],
  };
}
```

**AbortController 패턴** (stale-while-revalidate):
```typescript
const handleInputChange = (value: string) => {
  setInputValue(value);
  clearTimeout(timerRef.current);

  if (value.length < 2) {
    setResults(null);
    return;
  }

  timerRef.current = setTimeout(async () => {
    // 이전 요청 취소
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    // 이전 결과는 유지 (stale-while-revalidate)
    const data = await fetchAutocomplete(value, abortRef.current.signal);
    setResults(data);
    setIsLoading(false);
  }, 300);
};
```

---

## 4. UI/UX Design

### 4.1 자동완성 드롭다운 (모바일)

```
┌──────────────────────────────────────┐
│ 🔍 [카페                      ✕]   │  ← SearchAutocomplete
├──────────────────────────────────────┤
│                                      │
│  Spot                                │
│  ──────────────────────────────      │
│  📍 카페 라뗄르 · 성수동              │
│  📍 을지로 카페 거리 · 을지로          │
│  📍 카페 온도 · 한남동               │
│                       Spot 더보기 >  │
│                                      │
│  SpotLine                            │
│  ──────────────────────────────      │
│  🗺️ 성수동 카페 투어 · 5곳           │
│  🗺️ 한남동 카페 코스 · 3곳           │
│                   SpotLine 더보기 >  │
│                                      │
│  Blog                                │
│  ──────────────────────────────      │
│  📝 성수 카페 리뷰 · @crew           │
│                       Blog 더보기 >  │
│                                      │
│  ──────────────────────────────────  │
│  "카페" 전체 결과 보기 →              │
│                                      │
└──────────────────────────────────────┘
```

### 4.2 인기 검색어 (포커스 + 빈 입력)

```
┌──────────────────────────────────────┐
│ 🔍 [                          ]     │  ← 포커스 상태
├──────────────────────────────────────┤
│                                      │
│  🔥 인기 검색어                       │
│                                      │
│  [성수동 카페] [을지로] [한남동]       │
│  [익선동 맛집] [연남동] [북촌]        │
│  [망원동 브런치] [서촌 산책]          │
│                                      │
└──────────────────────────────────────┘
```

### 4.3 검색 결과 3탭 (Blog 탭 추가)

```
┌──────────────────────────────────────┐
│ 🔍 [카페                      ✕]   │
├──────────────────────────────────────┤
│  [Spot]  [SpotLine]  [Blog]         │  ← 3탭
├──────────────────────────────────────┤
│  [전체] [성수] [을지로] [한남]  ...   │  ← area 필터
│  (Blog 탭: area만. category/theme X) │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 📝 성수동 카페 투어 리뷰       │   │
│  │ 서울 성수동의 카페를 돌아...    │   │
│  │ @crew · 👁 123 · ❤ 45         │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 📝 을지로 야경 맛집 가이드     │   │
│  │ 을지로 3가역 주변의 숨은...    │   │
│  │ @user1 · 👁 89 · ❤ 23         │   │
│  └──────────────────────────────┘   │
│                                      │
│         [더 보기]                     │
│                                      │
└──────────────────────────────────────┘
```

---

## 5. Error Handling

| Scenario | Handling |
|----------|----------|
| 자동완성 API 전체 실패 | 드롭다운 숨김, 에러 미표시 (fire-and-forget) |
| 자동완성 일부 API 실패 | 성공한 섹션만 표시 (Promise.allSettled) |
| Blog 탭 검색 실패 | "검색 결과를 불러올 수 없습니다" 에러 메시지 |
| 네트워크 지연 (>3초) | 로딩 스피너 표시, 이전 결과 유지 |
| AbortError | 무시 (정상적인 요청 취소) |

---

## 6. Clean Architecture Compliance

| Rule | Implementation |
|------|---------------|
| API 레이어 | `api.ts`를 통해서만 HTTP 호출 (컴포넌트에서 직접 axios 금지) |
| 타입 안전성 | 모든 Props는 `[Component]Props` 인터페이스 정의 |
| 상태 관리 | 자동완성은 component-local state (Zustand 미사용) |
| 경로 별칭 | `@/*` 사용, 상대 경로 지양 |
| UI 텍스트 | 한국어, 코드는 영어 |
| 스타일링 | Tailwind CSS 4 + `cn()` 유틸리티 |
| 반응형 | 모바일 퍼스트 (기본 → `md:` → `lg:`) |

---

## 7. Implementation Guide

### 7.1 Implementation Order

```
Step 1: trendingSearches.ts (상수 데이터)
  └── 의존성 없음

Step 2: TrendingSearches.tsx
  └── depends: trendingSearches.ts

Step 3: AutocompleteResults.tsx
  └── depends: types (SpotDetailResponse, SpotLinePreview, BlogListItem)

Step 4: SearchAutocomplete.tsx
  └── depends: AutocompleteResults, TrendingSearches, api.ts

Step 5: SearchFilters.tsx (MODIFY: blog 탭 지원)
  └── depends: 기존 코드

Step 6: SearchPageClient.tsx (MODIFY: Blog 탭 + SearchAutocomplete)
  └── depends: SearchAutocomplete, SearchFilters, api.ts (fetchBlogs)

Step 7: FeedSearchBar.tsx (MODIFY: SearchAutocomplete 래핑)
  └── depends: SearchAutocomplete

Step 8: feed/page.tsx (MODIFY: "Route" → "SpotLine")
  └── 의존성 없음 (독립 변경)
```

### 7.2 New Files

| File | LOC (est.) | Purpose |
|------|-----------|---------|
| `src/constants/trendingSearches.ts` | ~15 | 인기 검색어 정적 데이터 |
| `src/components/search/TrendingSearches.tsx` | ~40 | 인기 검색어 칩 UI |
| `src/components/search/AutocompleteResults.tsx` | ~120 | 자동완성 결과 렌더링 |
| `src/components/search/SearchAutocomplete.tsx` | ~180 | 자동완성 메인 컴포넌트 |

### 7.3 Modified Files

| File | Change Scope |
|------|-------------|
| `src/components/search/SearchFilters.tsx` | tab 타입에 "blog" 추가, blog 탭 시 2nd row 숨김 |
| `src/app/search/SearchPageClient.tsx` | Blog 탭 추가, SearchAutocomplete 교체, blogResults 상태 |
| `src/components/feed/FeedSearchBar.tsx` | SearchAutocomplete로 내부 구현 교체 |
| `src/app/feed/page.tsx` | "Route" → "SpotLine" 텍스트 수정 |

### 7.4 Dependencies

추가 패키지 설치 없음. 기존 의존성으로 충분:
- `lucide-react` (아이콘)
- `axios` (API 호출, api.ts 경유)
- `clsx` + `tailwind-merge` (`cn()`)

---

## 8. Risk Assessment

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| `fetchBlogs` keyword 미지원 | Blog 자동완성/검색 정확도 저하 | Backend Swagger 확인 → 미지원 시 최신순 폴백 | Open |
| 3 API 동시 호출 성능 | 자동완성 지연 | size=3 최소화, AbortController, Promise.allSettled | Mitigated |
| 빠른 타이핑 깜빡임 | UX 저하 | 300ms debounce + stale-while-revalidate | Mitigated |
| SearchPageClient 회귀 | 기존 필터/정렬 깨짐 | 기존 로직 유지, 탭 배열 확장만 | Low |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-18 | Initial design | Crew |
