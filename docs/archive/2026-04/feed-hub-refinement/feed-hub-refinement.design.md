# Feed Hub Refinement Design Document

> **Feature**: feed-hub-refinement
> **Plan**: `docs/01-plan/features/feed-hub-refinement.plan.md`
> **Date**: 2026-04-05
> **Status**: Draft

---

## 1. Architecture Overview

### 1.1 Scope

기존 Feed/Theme/City 페이지의 **탐색 경험 개선**. 정렬/검색 추가, Theme Spot 통합, CTA 카드, 소셜 인디케이터.

- **수정 파일**: 7개 (기존 컴포넌트/스토어/API)
- **신규 파일**: 5개 (새 컴포넌트)
- **백엔드 변경**: 0 (기존 sort/keyword 파라미터 활용)
- **신규 의존성**: 0

### 1.2 Backend API 확인 결과

| Endpoint | sort 지원 | keyword 지원 |
|----------|:---------:|:------------:|
| `GET /api/v2/spots` | `POPULAR` (viewsCount), `NEWEST` (createdAt) | title OR crewNote LIKE |
| `GET /api/v2/spotlines/popular` | `POPULAR` (likesCount), `NEWEST` (createdAt) | title OR description LIKE |

> Plan에서 4개 정렬 옵션을 예상했으나, Backend는 POPULAR/NEWEST만 지원.
> **결정**: 2개 옵션으로 축소 (Backend 변경 없이 진행). views/rating 정렬은 Out of Scope.

---

## 2. Data Design

### 2.1 타입 변경

```typescript
// src/types/index.ts — 추가
export type FeedSort = "popular" | "newest";
```

### 2.2 useFeedStore 확장

```typescript
// src/store/useFeedStore.ts — 추가 상태/액션
interface FeedState {
  // ... 기존 유지
  sort: FeedSort;                        // NEW: "popular" 기본값
  keyword: string;                       // NEW: "" 기본값
  setSort: (sort: FeedSort) => void;     // NEW: 정렬 변경 시 spots 리셋
  setKeyword: (keyword: string) => void; // NEW: 검색 변경 시 spots 리셋
  resetFilters: () => void;              // NEW: 전체 필터 초기화
}
```

**setSort 로직**: sort 변경 시 `spots: [], spotsPage: 0, hasMoreSpots: true` 리셋 (setArea/setCategory와 동일 패턴)

**setKeyword 로직**: keyword 변경 시 동일 리셋. 디바운스는 컴포넌트(FeedSearchBar)에서 처리.

**resetFilters 로직**: `{ area: null, category: null, sort: "popular", keyword: "", spots: [], spotsPage: 0, hasMoreSpots: true, spotLines: [], error: null }`

---

## 3. Component Design

### 3.1 신규 컴포넌트 (5개)

#### FeedSortDropdown

```
파일: src/components/feed/FeedSortDropdown.tsx
Props: { selected: FeedSort; onSelect: (sort: FeedSort) => void }

UI: 드롭다운 버튼 (ChevronDown 아이콘)
  - "인기순" (popular) — 기본
  - "최신순" (newest)

패턴:
  - useState로 open/close 토글
  - 외부 클릭 시 닫기 (useEffect + document.addEventListener)
  - 선택 시 onSelect 호출 + 닫기

배치: FeedPage에서 FeedCategoryChips 아래, FeedSpotLineSection 위
레이아웃: 검색바 오른쪽 (flex row)
```

#### FeedSearchBar

```
파일: src/components/feed/FeedSearchBar.tsx
Props: { value: string; onChange: (keyword: string) => void }

UI:
  - Search 아이콘 + input (placeholder: "장소, 크루노트 검색")
  - 입력 시 300ms 디바운스 후 onChange 호출
  - 값이 있으면 X 버튼으로 클리어

패턴:
  - 내부 inputValue 상태 (즉시 반영)
  - useEffect + setTimeout으로 디바운스
  - onChange는 디바운스 후 호출 (외부에 전달하는 keyword)

배치: FeedCategoryChips 아래, FeedSortDropdown 왼쪽
레이아웃: flex-1 (검색바가 넓게, 정렬은 고정 너비)
```

#### FeedCreateCTA

```
파일: src/components/feed/FeedCreateCTA.tsx
Props: 없음

UI:
  - 카드형 배너 (rounded-xl, border-dashed border-purple-200, bg-purple-50/30)
  - Plus 아이콘 + "나만의 SpotLine 만들기" 타이틀
  - "좋아하는 장소를 모아 나만의 코스를 만들어보세요" 부제
  - Link → /create-spotline

배치: FeedSpotLineSection 상단 (spotLines 목록 위)
```

#### FeedFilterReset

```
파일: src/components/feed/FeedFilterReset.tsx
Props: {
  area: string | null;
  category: SpotCategory | null;
  sort: FeedSort;
  keyword: string;
  onReset: () => void;
}

UI:
  - 활성 필터가 있을 때만 표시 (area || category || sort !== "popular" || keyword)
  - "필터 초기화" 텍스트 + RotateCcw 아이콘
  - 클릭 시 onReset 호출

배치: 검색바+정렬 드롭다운 아래, 컨텐츠 위
스타일: text-xs text-gray-500, hover:text-gray-700
```

#### ThemeSpots

```
파일: src/components/theme/ThemeSpots.tsx
Props: { spots: SpotDetailResponse[]; themeName: string }

UI:
  - "추천 Spot" 타이틀
  - SpotPreviewCard 그리드 (2열 모바일, 3열 태블릿, 4열 데스크톱)
  - spots가 비어있으면 null 반환

패턴: CitySpots와 동일한 그리드 패턴, "더 보기" 링크 없음
배치: ThemePage에서 ThemeSpotLines 아래
```

### 3.2 수정 컴포넌트 (5개)

#### FeedPage.tsx 수정

```
변경 사항:
1. useFeedStore에서 sort, keyword, setSort, setKeyword, resetFilters 추가 구독
2. FeedSearchBar + FeedSortDropdown 렌더링 (검색+정렬 행)
3. FeedFilterReset 렌더링 (활성 필터 있을 때)
4. URL 동기화에 sort, keyword 추가
5. fetchFeedSpots 호출에 sort, keyword 전달
6. useEffect 의존 배열에 sort, keyword 추가

레이아웃 변경:
  ExploreNavBar
  FeedAreaTabs (sticky)
  FeedCategoryChips
  [FeedSearchBar | FeedSortDropdown]  ← NEW 행
  [FeedFilterReset]                    ← NEW (조건부)
  FeedSpotLineSection (with FeedCreateCTA)
  FeedSpotGrid
```

#### SpotPreviewCard.tsx 수정

```
변경 사항:
- 기존 viewsCount 옆에 likesCount 표시 추가
- Heart 아이콘 + 숫자 (text-xs text-gray-400)
- likesCount > 0일 때만 표시

변경 위치: 하단 meta 영역 (rating, viewsCount 옆)
```

#### SpotLinePreviewCard.tsx 수정

```
변경 사항:
- 기존 likesCount(Heart) 옆에 savesCount 미표시 (SpotLinePreview 타입에 savesCount 없음)
- 대신 viewsCount 추가? → SpotLinePreview에 viewsCount 없음
- 결론: 추가 변경 없음 (이미 likesCount 표시 중)

→ 이 항목은 Skip. SpotLinePreviewCard는 이미 likesCount를 표시하고 있음.
```

#### ThemePage (page.tsx) 수정

```
변경 사항:
1. fetchFeedSpots import 추가 (이미 있을 수 있음)
2. THEME_CATEGORY_MAP 상수 정의
3. theme에 해당하는 카테고리로 Spots 12개 페칭
4. ThemeSpots 컴포넌트 렌더링

데이터 페칭:
  const categories = THEME_CATEGORY_MAP[theme.theme] || [];
  // 첫 번째 카테고리로 검색 (가장 관련성 높은 것)
  const spotsResult = await fetchFeedSpots(undefined, categories[0], 0, 12)
    .catch(() => emptyPage);
```

#### CityHero.tsx 수정

```
변경 사항:
- spotCount, spotLineCount props 추가
- 통계 표시: "{N}개 Spot · {M}개 코스"

Props 변경:
  interface CityHeroProps {
    city: CityInfo;
    spotCount: number;      // NEW
    spotLineCount: number;  // NEW
  }

UI: description 아래에 통계 한 줄 추가
  <p className="mt-1 text-xs text-gray-400">{spotCount}개 Spot · {spotLineCount}개 코스</p>
```

#### CityPage (page.tsx) 수정

```
변경 사항:
- CityHero에 spotCount, spotLineCount props 전달

  <CityHero
    city={city}
    spotCount={spotsResult.totalElements}      // NEW
    spotLineCount={spotLinesResult.totalElements} // NEW
  />
```

---

## 4. API Integration

### 4.1 fetchFeedSpots 수정

```typescript
// src/lib/api.ts — 시그니처 변경
export const fetchFeedSpots = async (
  area?: string,
  category?: string,
  page = 0,
  size = 20,
  sort?: string,    // NEW: "popular" | "newest"
  keyword?: string  // NEW: 검색어
): Promise<PaginatedResponse<SpotDetailResponse>> => {
  const params: Record<string, string | number> = { page, size };
  if (area) params.area = area;
  if (category) params.category = category;
  if (sort) params.sort = sort;          // NEW
  if (keyword) params.keyword = keyword; // NEW
  // ... 나머지 동일
};
```

### 4.2 fetchFeedSpotLines 수정

```typescript
// src/lib/api.ts — keyword 파라미터 추가 (향후 사용 대비)
export const fetchFeedSpotLines = async (
  area?: string,
  theme?: string,
  page = 0,
  size = 10,
  keyword?: string  // NEW (optional, 현재는 미사용)
): Promise<PaginatedResponse<SpotLinePreview>> => {
  // ... keyword 전달 추가
};
```

---

## 5. State Flow

### 5.1 Feed 필터/정렬/검색 플로우

```
사용자 액션               Store 변경                    API 호출
─────────────────────────────────────────────────────────────────
정렬 선택 (newest)  → setSort("newest")           → fetchFeedSpots(area, cat, 0, 20, "newest", keyword)
                      spots=[], page=0, hasMore=true

검색어 입력 (300ms) → setKeyword("커피")          → fetchFeedSpots(area, cat, 0, 20, sort, "커피")
                      spots=[], page=0, hasMore=true

필터 초기화         → resetFilters()               → fetchFeedSpots(null, null, 0, 20, "popular", "")
                      area=null, cat=null, sort="popular", keyword=""

무한 스크롤         → nextSpotsPage()              → fetchFeedSpots(area, cat, page+1, 20, sort, keyword)
```

### 5.2 URL 동기화

```
URL: /feed?area=성수&category=cafe&sort=newest&keyword=커피

규칙:
- 기본값은 URL에서 생략 (sort=popular, keyword="" 일 때)
- 뒤로가기 시 URL에서 상태 복원
- 페이지 새로고침 시 필터 유지
```

---

## 6. UI Specifications

### 6.1 FeedPage 레이아웃

```
┌─────────────────────────────────────────────┐
│  Discover │ Feed (active)                    │ ← ExploreNavBar
├─────────────────────────────────────────────┤
│  전체 │ 성수 │ 을지로 │ 연남 │ 홍대 │ ...    │ ← FeedAreaTabs (sticky)
├─────────────────────────────────────────────┤
│  전체 │ 카페 │ 맛집 │ 문화 │ ...             │ ← FeedCategoryChips
├─────────────────────────────────────────────┤
│  🔍 장소, 크루노트 검색      │ 인기순 ▾ │    │ ← NEW: SearchBar + SortDropdown
├─────────────────────────────────────────────┤
│  ↻ 필터 초기화                               │ ← NEW: FeedFilterReset (조건부)
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐    │
│  │ + 나만의 SpotLine 만들기            │    │ ← NEW: FeedCreateCTA
│  │   좋아하는 장소를 모아 코스 만들기   │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  인기 SpotLine                               │ ← FeedSpotLineSection
│  ┌──────────────┐ ┌──────────────┐          │
│  │ SpotLine 1   │ │ SpotLine 2   │          │
│  └──────────────┘ └──────────────┘          │
│                                              │
│  인기 Spot                                   │ ← FeedSpotGrid
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ ★4.5 │ │ ★4.2 │ │ ★4.8 │ │ ★4.1 │       │
│  │ ♡ 12 │ │ ♡ 8  │ │ ♡ 25 │ │ ♡ 3  │       │ ← NEW: likesCount
│  └──────┘ └──────┘ └──────┘ └──────┘       │
└─────────────────────────────────────────────┘
```

### 6.2 FeedSortDropdown 스타일

```
드롭다운 버튼: rounded-lg border border-gray-200 px-3 py-2 text-sm
선택된 옵션: font-medium text-gray-900
화살표: ChevronDown h-4 w-4 text-gray-400
메뉴: absolute right-0 top-full mt-1 rounded-lg border bg-white shadow-lg z-20
옵션: px-3 py-2 text-sm hover:bg-gray-50
선택됨: text-blue-600 font-medium
```

### 6.3 FeedSearchBar 스타일

```
컨테이너: flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2
아이콘: Search h-4 w-4 text-gray-400
input: bg-transparent text-sm placeholder:text-gray-400 flex-1 outline-none
클리어: X h-4 w-4 text-gray-400 hover:text-gray-600 (keyword 있을 때만)
```

### 6.4 ThemePage 레이아웃 변경

```
┌─────────────────────────────────────────────┐
│  ThemeHero (아이콘 + 이름 + 설명)            │
├─────────────────────────────────────────────┤
│  인기 SpotLine                               │ ← ThemeSpotLines (기존)
│  ┌──────────────┐ ┌──────────────┐          │
├─────────────────────────────────────────────┤
│  추천 Spot                                   │ ← NEW: ThemeSpots
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
├─────────────────────────────────────────────┤
│  다른 테마: 데이트 │ 여행 │ 산책 │ ...       │ ← ThemeNavigation (기존)
└─────────────────────────────────────────────┘
```

### 6.5 CityHero 통계 위젯

```
기존:
  성수 탐색
  성수의 인기 카페, 맛집, 문화 공간을 만나보세요

변경 후:
  성수 탐색
  성수의 인기 카페, 맛집, 문화 공간을 만나보세요
  12개 Spot · 5개 코스                          ← NEW 통계 라인
```

---

## 7. EmptyFeed 개선

### 7.1 검색 결과 없음 상태

```
EmptyFeed에 keyword prop 추가:

Props: { type, onResetArea?, keyword?, onResetFilters? }

keyword가 있을 때:
  "'{keyword}' 검색 결과가 없어요"
  [필터 초기화] 버튼 (onResetFilters)

keyword가 없고 area가 있을 때:
  "이 지역에 {type}이 아직 없어요"
  [전체 지역 보기] 버튼 (onResetArea) ← 기존
```

---

## 8. Implementation Order

| Step | Task | Files | 의존성 |
|:----:|------|-------|--------|
| 1 | 타입 + Store 확장 | types/index.ts, useFeedStore.ts | 없음 |
| 2 | API 함수 수정 | api.ts | Step 1 |
| 3 | FeedSearchBar 컴포넌트 | FeedSearchBar.tsx | 없음 |
| 4 | FeedSortDropdown 컴포넌트 | FeedSortDropdown.tsx | 없음 |
| 5 | FeedCreateCTA 컴포넌트 | FeedCreateCTA.tsx | 없음 |
| 6 | FeedFilterReset 컴포넌트 | FeedFilterReset.tsx | Step 1 |
| 7 | FeedPage 통합 | FeedPage.tsx | Step 1-6 |
| 8 | EmptyFeed 개선 | EmptyFeed.tsx | 없음 |
| 9 | SpotPreviewCard 좋아요 표시 | SpotPreviewCard.tsx | 없음 |
| 10 | ThemeSpots + ThemePage 수정 | ThemeSpots.tsx, theme/[name]/page.tsx | 없음 |
| 11 | CityHero + CityPage 수정 | CityHero.tsx, city/[name]/page.tsx | 없음 |
| 12 | 타입 체크 + 최종 검증 | — | Step 1-11 |

---

## 9. THEME_CATEGORY_MAP

```typescript
// src/constants/themes.ts에 추가
export const THEME_CATEGORY_MAP: Record<string, string[]> = {
  date: ["cafe", "restaurant", "culture"],
  travel: ["culture", "nature", "walk"],
  walk: ["walk", "nature", "cafe"],
  hangout: ["activity", "bar", "shopping"],
  "food-tour": ["restaurant"],
  "cafe-tour": ["cafe"],
  culture: ["culture", "exhibition"],
};
```

---

## 10. Checklist

- [ ] FeedSort 타입 추가
- [ ] useFeedStore: sort, keyword, setSort, setKeyword, resetFilters
- [ ] fetchFeedSpots: sort, keyword 파라미터
- [ ] FeedSearchBar: 디바운스 300ms, 클리어 버튼
- [ ] FeedSortDropdown: 2옵션 (인기순/최신순), 외부 클릭 닫기
- [ ] FeedCreateCTA: dashed border, Link to /create-spotline
- [ ] FeedFilterReset: 조건부 표시, resetFilters 연결
- [ ] FeedPage: 4개 컴포넌트 통합, URL 동기화 확장
- [ ] EmptyFeed: keyword prop, 검색 결과 없음 메시지
- [ ] SpotPreviewCard: Heart + likesCount 표시
- [ ] ThemeSpots: 그리드 컴포넌트, CitySpots 패턴 참고
- [ ] ThemePage: THEME_CATEGORY_MAP으로 Spots 페칭
- [ ] CityHero: spotCount, spotLineCount 통계
- [ ] CityPage: totalElements 전달
- [ ] pnpm type-check 통과
- [ ] pnpm lint 에러 0
