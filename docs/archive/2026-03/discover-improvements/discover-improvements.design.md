# discover-improvements Design

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 발견 페이지의 스켈레톤이 산만하고, 새로고침 시 콘텐츠 즉시 사라짐, SpotBlock 전환에 애니메이션 없음, 위치 거부 시 안내 부족 |
| **Solution** | 통합 스켈레톤 개선, 새로고침 dim+fade, SpotBlock fadeInUp, NearbySpots 스크롤 힌트, 위치 거부 부연 텍스트 |
| **Function/UX Effect** | 로딩 중 자연스러운 시각 피드백, 새로고침 시 콘텐츠 연속성, Spot 카드 등장 시 생동감 |
| **Core Value** | 발견 페이지 첫인상 품질 향상, 새로고침 유도 증가, 위치 허용 전환율 개선 |

## 1. File Specifications

### 1.1 DiscoverSkeleton.tsx (수정)

**경로**: `src/components/discover/DiscoverSkeleton.tsx`

현재: 개별 `animate-pulse`, ExploreNavBar 스켈레톤 없음, SpotBlock border 색상 없음.

**변경 사항**:

1. **ExploreNavBar 스켈레톤 추가** (최상단):
```
┌────────────────────────────────────┐
│ [발견] [피드]  ← tab pills        │  ← animate-pulse, h-8 w-14 rounded-full
│ [서울] [부산] [제주] [데이트] ...   │  ← quick link chips
└────────────────────────────────────┘
```
- sticky top-0 z-20 구조, border-b border-gray-100
- tabs: 2개 pill (`h-8 w-14 rounded-full bg-gray-200`)
- chips: 6개 (`h-7 w-12 rounded-full bg-gray-200`)

2. **SpotBlock 스켈레톤에 border 색상 반영**:
- Current spot: `border-blue-100` (기존 `border-gray-100`)
- Next spot: `border-green-100` (기존 `border-gray-100`)

3. **스태거드 딜레이**:
- 각 섹션(NavBar, Location, CurrentSpot, Transition, NextSpot)에 `style={{ animationDelay: N*150ms }}`
- 개별 `animate-pulse` 유지 (각 섹션)

### 1.2 LocationPermissionBanner.tsx (수정)

**경로**: `src/components/discover/LocationPermissionBanner.tsx`

**변경**: 메인 메시지 아래에 부연 텍스트 추가.

```diff
  <p className="text-sm text-blue-800">
    위치를 허용하면 근처 Spot을 찾아드려요
  </p>
+ <p className="text-xs text-blue-600/70">
+   위치 없이도 인기 Spot을 둘러볼 수 있어요
+ </p>
```

기존 레이아웃과 스타일 유지, `<p>` 1줄 추가만.

### 1.3 NearbySpotScroll.tsx (수정)

**경로**: `src/components/discover/NearbySpotScroll.tsx`

**변경**: 좌우 스크롤 힌트 그래디언트 추가.

현재: `overflow-x-auto scrollbar-hide`만 적용.
변경: 스크롤 컨테이너를 `relative` div로 감싸고 좌우 그래디���트 오버레이.

**구현**:
```tsx
const [showLeftGradient, setShowLeftGradient] = useState(false);
const [showRightGradient, setShowRightGradient] = useState(true);
const scrollRef = useRef<HTMLDivElement>(null);

const handleScroll = () => {
  const el = scrollRef.current;
  if (!el) return;
  setShowLeftGradient(el.scrollLeft > 0);
  setShowRightGradient(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
};
```

그래디언트 div:
- 우측: `absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white pointer-events-none`
- 좌측: `absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white pointer-events-none`
- 조건부 렌더링 (showLeftGradient / showRightGradient)

스크롤 컨테이너에 `ref={scrollRef} onScroll={handleScroll}` 추가.
`px-4`는 외부 래퍼가 아닌 스크롤 컨테이너 내부에 유지.

### 1.4 SpotBlock.tsx (수정)

**경로**: `src/components/discover/SpotBlock.tsx`

**변경**: 등장 애니메이션 (fadeInUp) 추가.

`className`에 커스텀 애니메��션 클래스 추가:
```tsx
<div
  className={cn(
    "animate-[fadeInUp_0.4s_ease-out] rounded-2xl border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md",
    ...
  )}
>
```

Tailwind 4에서 arbitrary animation 사용:
- `animate-[fadeInUp_0.4s_ease-out]`
- `@keyframes fadeInUp` 정의는 `tailwind.css` 또는 inline `<style>` 대신, `globals.css`에 추가

**globals.css에 추가할 keyframes**:
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 1.5 DiscoverPage.tsx (수정)

**경로**: `src/components/discover/DiscoverPage.tsx`

**변경 1 — isRefreshing 상태 추가**:
```typescript
const [isRefreshing, setIsRefreshing] = useState(false);
```

`handleRefresh` 수정:
```typescript
const handleRefresh = async () => {
  setIsRefreshing(true);
  const currentSpotId = data?.currentSpot?.spot?.id;
  await loadDiscover(currentSpotId);
  setIsRefreshing(false);
};
```

`loadDiscover`를 Promise를 반환하도록 유지 (이미 async).

**변경 2 — 콘텐츠 dim 효과**:
SpotBlock들을 감싸는 영역에 조건부 opacity:
```tsx
<div className={cn("transition-opacity duration-200", isRefreshing && "opacity-50")}>
  {/* currentSpot + TransitionInfo + nextSpot */}
</div>
```

**변경 3 — SpotBlock key 기반 재마운트**:
SpotBlock에 `key={spot.id}`를 설정하여 데이터 변경 시 재마운트 → fadeInUp 재실행:
```tsx
<SpotBlock
  key={data.currentSpot.spot.id}
  spot={data.currentSpot.spot}
  ...
/>
```

## 2. Implementation Order

| Step | File | Action | Dependencies |
|------|------|--------|-------------|
| 1 | `globals.css` | fadeInUp keyframes 추가 | 없음 |
| 2 | `DiscoverSkeleton.tsx` | NavBar 스켈레톤 + border 색상 + 스태���드 | 없음 |
| 3 | `LocationPermissionBanner.tsx` | 부연 텍스트 1줄 추가 | 없음 |
| 4 | `NearbySpotScroll.tsx` | 스크롤 힌트 그래디언트 | 없음 |
| 5 | `SpotBlock.tsx` | animate-[fadeInUp] 적용 | Step 1 |
| 6 | `DiscoverPage.tsx` | isRefreshing dim + key 재마운트 | Step 5 |

## 3. Component Tree (변경 후)

```
DiscoverPage
├── DiscoverSkeleton (초기 로딩)
│   ├── NavBar skeleton (신규)
│   ├── Location skeleton
│   ├── Current SpotBlock skeleton (border-blue-100)
│   ├── Transition skeleton
│   └── Next SpotBlock skeleton (border-green-100)
├── ExploreNavBar
├── LocationPermissionBanner (위치 거부 시)
│   └── + 부연 텍스트 (수정)
├── LocationHeader
├── <div className={cn(...isRefreshing)}>  ← dim 래퍼 (신규)
│   ├── SpotBlock key={currentSpot.id} (fadeInUp)  ← 수정
│   ├── TransitionInfo
│   └── SpotBlock key={nextSpot.id} (fadeInUp)  ← 수정
├── RefreshButton
├── NearbySpotScroll
│   ├── scroll container (ref + onScroll)  ← 수정
│   ├── left gradient (조건부)  ← 신규
│   └── right gradient (조건부)  ← 신규
└── PopularRoutesList
```

## 4. Verification Criteria

| # | 항목 | 기대 결과 |
|---|------|-----------|
| 1 | 초기 로딩 | NavBar + SpotBlock 스켈레톤 순차 fade-in, border 색상 반영 |
| 2 | 새로고침 | 기존 콘텐츠 opacity 50% → 새 데이터 후 fadeInUp |
| 3 | SpotBlock 등장 | 아래에서 위로 12px 슬라이드 + 0.4s fade-in |
| 4 | NearbySpots | 우측 흰색 그래디언트, 스크롤 시 좌측도 표시 |
| 5 | 위치 거부 | "위치 없이도 인기 Spot을 둘러볼 수 있어요" 부연 텍스트 |
| 6 | 빌드 | `pnpm build` 에러 없음 |

## 5. Dependencies

- 외부 라이브러리 추가 없음
- `globals.css`에 `@keyframes fadeInUp` 1개 추가
