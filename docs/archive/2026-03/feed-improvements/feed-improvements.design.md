# feed-improvements Design

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 피드 스켈레톤이 동시에 깜빡이고, 필터 전환 시 콘텐츠가 즉시 사라지며, 무한 스크롤 로딩이 불명확하고, 빈 상태가 단조로움 |
| **Solution** | 스태거드 스켈레톤 카드, 필터 전환 dim+fade 효과, 스켈레톤 카드 로딩 인디케이터, 아이콘+CTA 빈 상태 |
| **Function/UX Effect** | 콘텐츠 로딩 중 자연스러운 시각 피드백, 필터 전환 시 연속적 경험, 빈 상태에서 탐색 유도 |
| **Core Value** | 피드 체류 시간 증가, 콘텐츠 소비량 확대, 탐색 이탈률 감소 |

## 1. File Specifications

### 1.1 SpotCardSkeleton.tsx (신규)

**경로**: `src/components/feed/SpotCardSkeleton.tsx`

SpotPreviewCard(h-36 이미지 + p-3 텍스트)와 동일한 레이아웃의 스켈레톤 컴포넌트.

```
┌──────────────────────┐
│  ████████████████████ │  ← h-36 bg-gray-200 rounded-t-xl
│  ████████████████████ │
│  ████████████████████ │
├──────────────────────┤
│  p-3                 │
│  ██ · ██             │  ← h-3 w-10 + w-8 (category · area)
│  ████████████        │  ← h-4 w-3/4 (title)
│  ██████████████████  │  ← h-3 w-full (crewNote)
│  ★ ██  👁 ██        │  ← h-3 w-16 (rating + views)
└──────────────────────┘
```

**Props**:
```typescript
interface SpotCardSkeletonProps {
  index?: number; // 스태거드 딜레이용 (index * 100ms)
}
```

**구현 규칙**:
- `animate-pulse` 적용, `animation-delay`는 inline style로 `index * 100`ms
- 외부 div: `overflow-hidden rounded-xl border border-gray-100 bg-white`
- 이미지 영역: `h-36 w-full bg-gray-200`
- 텍스트 영역: `p-3` 내에 `rounded bg-gray-200` div들
- 크기는 SpotPreviewCard 실제 렌더링과 일치

### 1.2 FeedSkeleton.tsx (수정)

**경로**: `src/components/feed/FeedSkeleton.tsx`

현재: 전체에 `animate-pulse` 1개, 모든 요소 동시 깜빡임.
변경: SpotCardSkeleton을 사용하여 스태거드 효과 적용.

**변경 사항**:
- Area tabs / Category chips 스켈레톤은 유지 (기존 구조)
- Route section 스켈레톤은 유지
- **Spot grid 영역**: 기존 `div.h-52` 4개 → `SpotCardSkeleton` 4개 (index 0~3)
- 상위 div에서 `animate-pulse` 제거 → 각 섹션에 개별 `animate-pulse`
- SpotCardSkeleton이 개별 딜레이로 스태거드 효과 생성

### 1.3 EmptyFeed.tsx (신규)

**경로**: `src/components/feed/EmptyFeed.tsx`

**Props**:
```typescript
interface EmptyFeedProps {
  type: "spot" | "route";
}
```

**레이아웃**:
```
┌────────────────────────┐
│                        │
│      (Compass 48px)    │  ← type=spot: Compass, type=route: MapPin
│                        │
│  이 지역에 Spot이       │  ← text-sm font-medium text-gray-600
│  아직 없어요            │
│                        │
│  [피드 둘러보기]         │  ← CTA button (type=spot)
│  또는                   │
│  [다른 지역 보기]        │  ← area=null로 리셋
└────────────────────────┘
```

**메시지 매핑**:
| type | icon | 메시지 | CTA |
|------|------|--------|-----|
| spot | Compass (lucide) | "이 지역에 Spot이 아직 없어요" | "전체 지역 보기" (area → null) |
| route | MapPin (lucide) | "이 지역에 Route가 아직 없어요" | "전체 지역 보기" (area → null) |

**스타일**:
- 컨테이너: `px-4 py-16 text-center`
- 아이콘: `mx-auto mb-4 h-12 w-12 text-gray-300`
- 메시지: `mb-1 text-sm font-medium text-gray-600`
- CTA 버튼: `mt-4 rounded-xl bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200`

### 1.4 FeedSpotGrid.tsx (수정)

**경로**: `src/components/feed/FeedSpotGrid.tsx`

**변경 1 — 빈 상태**: 기존 텍스트 → `EmptyFeed` 컴포넌트 사용
```diff
- <div className="px-4 py-12 text-center text-sm text-gray-400">
-   이 지역에 등록된 Spot이 없습니다
- </div>
+ <EmptyFeed type="spot" />
```

**변경 2 — 로딩 인디케이터**: 기존 Loader2 스피너 → SpotCardSkeleton 그리드
```diff
- <div className="flex justify-center py-6">
-   <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
- </div>
+ <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
+   {Array.from({ length: 2 }).map((_, i) => (
+     <SpotCardSkeleton key={`loading-${i}`} index={i} />
+   ))}
+ </div>
+ <p className="mt-2 text-center text-xs text-gray-400">더 불러오는 중...</p>
```

**변경 3 — EmptyFeed에 onResetArea prop 전달**: FeedSpotGrid가 area reset 콜백을 받아 EmptyFeed에 전달

**Props 변경**:
```typescript
interface FeedSpotGridProps {
  spots: SpotDetailResponse[];
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
  onResetArea?: () => void; // 추가: EmptyFeed CTA용
}
```

### 1.5 FeedPage.tsx (수정)

**경로**: `src/components/feed/FeedPage.tsx`

**변경 1 — isFiltering 상태 추가**:
필터(area/category) 변경 시 기존 콘텐츠를 유지하면서 dim 효과.

useFeedStore에 `isFiltering` 추가 불필요 — FeedPage 로컬에서 관리:
```typescript
const [isFiltering, setIsFiltering] = useState(false);
```

area 또는 category 변경 감지 시:
1. `setIsFiltering(true)`
2. 데이터 로딩 완료 후 `setIsFiltering(false)`

**변경 2 — 필터 전환 시 dim 효과**:
FeedSpotGrid 래핑 div에 조건부 opacity:
```tsx
<div className={cn("transition-opacity duration-200", isFiltering && "opacity-50")}>
  <FeedSpotGrid ... />
</div>
```

**변경 3 — 스크롤 위치 리셋**:
area/category 변경 시 콘텐츠 영역으로 스크롤:
```typescript
const contentRef = useRef<HTMLDivElement>(null);

// area 또는 category 변경 시
useEffect(() => {
  contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
}, [area, category]);
```

`contentRef`는 FeedRouteSection 바로 위 (필터 영역 아래)에 부착.

**변경 4 — onResetArea 전달**:
```tsx
<FeedSpotGrid
  ...
  onResetArea={() => setArea(null)}
/>
```

## 2. Implementation Order

| Step | File | Action | Dependencies |
|------|------|--------|-------------|
| 1 | `SpotCardSkeleton.tsx` | 신규 생성 | 없음 |
| 2 | `FeedSkeleton.tsx` | SpotCardSkeleton 적용 | Step 1 |
| 3 | `EmptyFeed.tsx` | 신규 생성 | 없음 |
| 4 | `FeedSpotGrid.tsx` | EmptyFeed + 스켈레톤 로딩 적용 | Step 1, 3 |
| 5 | `FeedPage.tsx` | isFiltering + 스크롤 관리 | Step 4 |

## 3. Component Tree (변경 후)

```
FeedPage
├── ExploreNavBar
├── FeedAreaTabs
├── FeedCategoryChips
├── <div ref={contentRef}>     ← 스크롤 앵커 (신규)
├── FeedRouteSection
├── <div className={cn(...isFiltering)}>  ← dim 래퍼 (신규)
│   └── FeedSpotGrid
│       ├── SpotPreviewCard[]
│       ├── SpotCardSkeleton[] (로딩 시)  ← 변경
│       └── EmptyFeed (빈 상태 시)         ← 변경
└── (초기 로딩 시)
    └── FeedSkeleton
        ├── tabs/chips/route 스켈레톤
        └── SpotCardSkeleton[4] (스태거드) ← 변경
```

## 4. Verification Criteria

| # | 항목 | 기대 결과 |
|---|------|-----------|
| 1 | 초기 로딩 | SpotCardSkeleton 4개가 순차적으로 fade-in (0ms, 100ms, 200ms, 300ms) |
| 2 | 무한 스크롤 | 하단에 SpotCardSkeleton 2개 + "더 불러오는 중..." 텍스트 |
| 3 | 필터 전환 | 기존 콘텐츠 opacity 50% → 새 데이터 로드 후 opacity 100% |
| 4 | 빈 상태 (Spot) | Compass 아이콘 + "이 지역에 Spot이 아직 없어요" + "전체 지역 보기" 버튼 |
| 5 | 스크롤 리셋 | area/category 변경 시 콘텐츠 영역 top으로 smooth 스크롤 |
| 6 | 빌드 | `pnpm build` 에러 없음 |

## 5. Dependencies

- 외부 라이브러리 추가 없음
- lucide-react (기존): Compass, MapPin 아이콘
- Tailwind CSS 4 (기존): animate-pulse, transition-opacity
