# spotline-variations-ui Design Document

> **Summary**: SpotLine 변형 UI 강화 — Spot 비교, 포크 트리, 변형 생성 CTA, 검색/정렬 기능 추가
>
> **Project**: front-spotLine (Spotline)
> **Version**: 0.1.0
> **Author**: Claude
> **Date**: 2026-04-16
> **Status**: Draft
> **Plan Reference**: `docs/01-plan/features/spotline-variations-ui.plan.md`

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 현재 변형 UI는 단순 리스트(제목+지역+Spot 수)만 표시하여, 원본과 어떤 차이가 있는지 알 수 없고, 변형 계보(포크 트리)를 파악할 수 없으며, 변형 생성으로의 전환 유도가 없음 |
| **Solution** | Spot 단위 diff 비교(추가/제거/유지), 포크 트리 시각화, "나만의 변형 만들기" CTA 버튼, 변형 목록 정렬/필터 기능 추가 |
| **Function/UX Effect** | 사용자가 원본과 변형의 차이를 한눈에 파악하고, 변형 히스토리를 트리로 탐색하며, 바로 자신만의 변형을 생성할 수 있어 참여율 향상 |
| **Core Value** | Experience Replication(Phase 7)의 핵심 — 경험의 "진화"를 시각적으로 보여줌으로써 플랫폼의 차별화된 소셜 가치(Pillar 3) 실현 |

---

## 1. Overview

### 1.1 Design Objective

Plan 문서 FR-01~FR-06을 구체적인 컴포넌트, 타입, API 변경으로 매핑한다. 기존 `SpotLineVariations.tsx`/`SpotLineVariationsList.tsx`를 확장하고, 새 컴포넌트 3개를 추가한다. 이미 존재하는 fork 시스템(`/create-spotline?fork=slug`, `useSpotLineBuilderStore.initFromFork`)을 CTA와 연결한다.

### 1.2 Key Discoveries

| 항목 | 현재 상태 | 설계 영향 |
|------|----------|----------|
| Fork 시스템 | `/create-spotline?fork={slug}` + `initFromFork()` 이미 구현 | CTA 버튼은 단순 Link로 구현 가능 (새 로직 불필요) |
| `SpotLinePreview` 타입 | `spotCount`만 있고 `spots[]` 없음 | 카드 diff 배지는 spotCount 차이만 표시, 정확한 diff는 모달에서 |
| 변형 목록 API | `fetchSpotLineVariations(id, page)` — sort 파라미터 미지원 | `sort` 파라미터를 API 호출에 추가 (Backend가 지원한다고 가정, 미지원 시 클라이언트 정렬) |
| 변형 상세 fetch | `fetchSpotLineDetail(slug)` 재활용 가능 | 비교 모달에서 변형의 spots를 가져올 때 기존 함수 사용 |

---

## 2. Architecture

### 2.1 Component Diagram

```
page.tsx (SSR)
  └── <main>
        ├── ... (기존 컴포넌트들)
        ├── CommentSection
        └── SpotLineVariations (항상 렌더링, variationsCount 조건 제거)
              ├── VariationForkTree (parentSpotLineId 존재 시)
              │     └── 원본 → 현재 SpotLine 연결선 + 형제 변형 노드
              ├── SpotLineVariationsList (변형 있을 때)
              │     ├── 정렬 토글 (최신순 ↔ 좋아요순)
              │     ├── VariationCard (각 변형)
              │     │     ├── VariationDiffBadge (spotCount 차이)
              │     │     └── onClick → VariationCompareModal
              │     └── 더보기 버튼 (페이지네이션)
              ├── VariationCompareModal (모달, 포탈)
              │     ├── 원본 Spot 리스트 (왼쪽/위)
              │     └── 변형 Spot 리스트 (오른쪽/아래)
              └── CTA "나만의 변형 만들기" (항상 표시)
                    └── Link → /create-spotline?fork={slug}
```

### 2.2 Data Flow

```
1. 페이지 SSR → spotLine (spots 포함) props 전달
2. SpotLineVariations 렌더링
   - parentSpotLineId → VariationForkTree에 전달
   - variationsCount → 변형 목록 표시 여부 결정
3. SpotLineVariationsList
   - fetchSpotLineVariations(id, page, sort) → SpotLinePreview[]
   - 각 카드에 원본 spotCount vs 변형 spotCount 차이 계산
4. 비교 모달 열기
   - fetchSpotLineDetail(variation.slug) → SpotLineDetailResponse (spots 포함)
   - 원본 spots (page.tsx에서 전달) vs 변형 spots → spotId Set 비교
   - diff 결과: added[], removed[], common[] 계산
5. CTA 클릭
   - /create-spotline?fork={currentSpotLine.slug} 이동
```

---

## 3. Detailed Design

### 3.1 Type Changes (`src/types/index.ts`)

```typescript
// 추가: Spot diff 결과 타입
export interface SpotDiffResult {
  added: SpotLineSpotDetail[];   // 변형에만 있는 Spot
  removed: SpotLineSpotDetail[]; // 원본에만 있는 Spot
  common: SpotLineSpotDetail[];  // 양쪽 모두 있는 Spot (원본 기준)
}
```

### 3.2 API Changes (`src/lib/api.ts`)

**`fetchSpotLineVariations` 수정** — sort 파라미터 추가:

```typescript
export const fetchSpotLineVariations = async (
  spotLineId: string,
  page: number = 0,
  sort: "latest" | "popular" = "latest"
): Promise<{ items: SpotLinePreview[]; hasMore: boolean }> => {
  try {
    const response = await apiV2.get<{ items: SpotLinePreview[]; hasMore: boolean }>(
      `/spotlines/${spotLineId}/variations`,
      { params: { page, sort }, timeout: 5000 }
    );
    return response.data;
  } catch {
    return { items: [], hasMore: false };
  }
};
```

### 3.3 New Component: `VariationDiffBadge.tsx`

**역할**: 원본 대비 Spot 수 차이를 시각적 배지로 표시

| Props | Type | Description |
|-------|------|-------------|
| `originalSpotCount` | `number` | 원본 SpotLine의 Spot 수 |
| `variationSpotCount` | `number` | 변형 SpotLine의 Spot 수 |

**렌더링 로직**:
- `diff = variationSpotCount - originalSpotCount`
- `diff > 0` → 초록 배지 `+{diff}곳`
- `diff < 0` → 빨강 배지 `{diff}곳`
- `diff === 0` → 회색 배지 `동일`

**UI**: `<span>` 인라인, `text-xs`, 각 색상의 `bg-{color}-50 text-{color}-600` pill 스타일

### 3.4 Modified Component: `SpotLineVariationsList.tsx`

**변경사항**:

1. **Props 확장**:
   ```typescript
   interface SpotLineVariationsListProps {
     spotLineId: string;
     originalSpotCount: number;          // diff 배지용
     originalSpots: SpotLineSpotDetail[]; // 비교 모달용
     spotLineSlug: string;               // CTA fork 링크용
   }
   ```

2. **정렬 토글**: 상단에 `최신순 | 좋아요순` 토글 버튼 추가
   - state: `sort: "latest" | "popular"`
   - 토글 시 `fetchSpotLineVariations` 재호출

3. **페이지네이션**: 하단에 "더보기" 버튼
   - state: `page`, `hasMore`
   - 클릭 시 `page + 1` fetch → 기존 목록에 concat

4. **카드 구조 변경**:
   - 기존: MapPin 아이콘 + 제목 + 지역/Spot수/시간
   - 변경: MapPin + 제목 + **VariationDiffBadge** + 지역/시간
   - 클릭: 기존 Link → **onClick으로 변경** (비교 모달 열기)
   - 별도 "상세 보기" 링크로 실제 페이지 이동 분리

5. **비교 모달 상태**:
   ```typescript
   const [compareTarget, setCompareTarget] = useState<SpotLinePreview | null>(null);
   ```
   - 카드 클릭 → `setCompareTarget(variation)` → `VariationCompareModal` 렌더링

### 3.5 New Component: `VariationCompareModal.tsx`

**역할**: 원본과 변형의 Spot 리스트를 side-by-side로 비교

| Props | Type | Description |
|-------|------|-------------|
| `originalSpots` | `SpotLineSpotDetail[]` | 원본의 Spot 리스트 |
| `variationSlug` | `string` | 비교 대상 변형의 slug |
| `variationTitle` | `string` | 비교 대상 변형의 제목 |
| `onClose` | `() => void` | 모달 닫기 콜백 |

**내부 로직**:

1. `useEffect` → `fetchSpotLineDetail(variationSlug)` → 변형 spots 가져오기
2. Spot diff 계산:
   ```typescript
   function computeSpotDiff(
     original: SpotLineSpotDetail[],
     variation: SpotLineSpotDetail[]
   ): SpotDiffResult {
     const origIds = new Set(original.map(s => s.spotId));
     const varIds = new Set(variation.map(s => s.spotId));
     return {
       added: variation.filter(s => !origIds.has(s.spotId)),
       removed: original.filter(s => !varIds.has(s.spotId)),
       common: original.filter(s => varIds.has(s.spotId)),
     };
   }
   ```
3. diff 결과 렌더링

**UI 레이아웃**:

```
┌──────────────────────────────────┐
│ 원본 vs {variationTitle}    [X]  │
├─────────────┬────────────────────┤
│  원본 Spots │  변형 Spots        │  ← md 이상: side-by-side
│  ─────────  │  ─────────         │
│  🟢 카페A   │  🟢 카페A          │  ← 공통: 보라색 배경
│  🔴 식당B   │  🟣 바C            │  ← 제거: 빨강, 추가: 초록
│  🟢 공원D   │  🟢 공원D          │
│             │  🟣 카페E          │
├─────────────┴────────────────────┤
│ +2곳 추가 · -1곳 제거 · 2곳 동일 │  ← 요약
│ [변형 SpotLine 보러가기]          │
└──────────────────────────────────┘
```

**모바일**: 세로 스택 (원본 위, 변형 아래)
**로딩**: 오른쪽(변형) 영역에 스켈레톤 표시

### 3.6 New Component: `VariationForkTree.tsx`

**역할**: 원본 → 현재 SpotLine의 계보 + 형제 변형들을 간단한 트리로 표시

| Props | Type | Description |
|-------|------|-------------|
| `parentSpotLineId` | `string` | 부모 SpotLine ID |
| `parentSpotLineSlug` | `string` | 부모 SpotLine slug (링크용) |
| `currentTitle` | `string` | 현재 SpotLine 제목 |
| `variationsCount` | `number` | 형제 변형 수 |

**UI**:

```
┌─────────────────────────────────┐
│ 📌 원본 SpotLine               │  ← Link to parent
│   └─ ✦ 현재 SpotLine (이 페이지) │
│   └─ 다른 변형 {N-1}개           │  ← 작은 텍스트
└─────────────────────────────────┘
```

- CSS `border-left` + `padding-left`로 트리 라인 표현
- 최대 1단계만 표시 (부모→현재)
- 부모가 없으면 (`parentSpotLineId === null`) 렌더링하지 않음

### 3.7 Modified Component: `SpotLineVariations.tsx`

**변경사항**:

1. **Props 확장**:
   ```typescript
   interface SpotLineVariationsProps {
     spotLineId: string;
     spotLineSlug: string;              // CTA fork 링크용 (추가)
     parentSpotLineId: string | null;
     variationsCount: number;
     parentSpotLineSlug?: string;
     originalSpots: SpotLineSpotDetail[]; // diff 비교용 (추가)
   }
   ```

2. **항상 렌더링**: `variationsCount > 0` 조건 제거
   - 변형 있을 때: 기존 expandable 리스트 + CTA
   - 변형 없을 때: CTA만 표시 ("첫 번째 변형을 만들어보세요!")

3. **VariationForkTree 통합**: parentSpotLineId 존재 시 상단에 포크 트리 표시

4. **CTA 버튼**: 하단에 항상 표시
   ```tsx
   <Link
     href={`/create-spotline?fork=${spotLineSlug}`}
     className="flex items-center justify-center gap-2 rounded-xl
       border-2 border-dashed border-purple-200 bg-purple-50/30
       p-3 text-sm font-medium text-purple-600
       hover:border-purple-300 hover:bg-purple-50"
   >
     <GitBranch className="h-4 w-4" />
     나만의 변형 만들기
   </Link>
   ```

### 3.8 Modified: `page.tsx`

**변경사항**:

1. `variationsCount > 0` 조건 제거 → 항상 `SpotLineVariations` 렌더링
2. 새 props 전달:
   ```tsx
   <SpotLineVariations
     spotLineId={spotLine.id}
     spotLineSlug={slug}
     parentSpotLineId={spotLine.parentSpotLineId}
     variationsCount={spotLine.variationsCount}
     parentSpotLineSlug={spotLine.parentSpotLineSlug}
     originalSpots={spotLine.spots}
   />
   ```

**참고**: `parentSpotLineSlug` 필드가 `SpotLineDetailResponse`에 존재하지 않으므로, 부모 slug를 가져오는 방법은:
- 방법 A: Backend에서 `parentSpotLineSlug` 필드 추가 (Out of Scope이므로 제외)
- 방법 B: `parentSpotLineId`로 `fetchSpotLineDetail`을 호출하여 slug를 얻기 → 포크 트리 컴포넌트 내부에서 lazy fetch
- **채택: 방법 B** — `VariationForkTree` 내부에서 `parentSpotLineId`를 slug로 변환

---

## 4. Implementation Order

| 순서 | 항목 | 파일 | FR | 의존성 |
|------|------|------|----|--------|
| 1 | SpotDiffResult 타입 추가 | `src/types/index.ts` | - | 없음 |
| 2 | fetchSpotLineVariations sort 파라미터 | `src/lib/api.ts` | FR-05 | 없음 |
| 3 | VariationDiffBadge 컴포넌트 | `src/components/spotline/VariationDiffBadge.tsx` | FR-01 | 타입 |
| 4 | SpotLineVariationsList 개선 | `src/components/spotline/SpotLineVariationsList.tsx` | FR-01, FR-05 | VariationDiffBadge, API |
| 5 | VariationCompareModal 컴포넌트 | `src/components/spotline/VariationCompareModal.tsx` | FR-02 | 타입, API |
| 6 | VariationForkTree 컴포넌트 | `src/components/spotline/VariationForkTree.tsx` | FR-03 | API |
| 7 | SpotLineVariations 통합 | `src/components/spotline/SpotLineVariations.tsx` | FR-04, FR-06 | 위 전체 |
| 8 | page.tsx 조건 수정 | `src/app/spotline/[slug]/page.tsx` | FR-06 | SpotLineVariations |

---

## 5. File Change Summary

| Type | File | Description |
|------|------|-------------|
| MODIFY | `src/types/index.ts` | `SpotDiffResult` 인터페이스 추가 |
| MODIFY | `src/lib/api.ts` | `fetchSpotLineVariations`에 sort 파라미터 추가 |
| NEW | `src/components/spotline/VariationDiffBadge.tsx` | Spot 수 차이 배지 컴포넌트 |
| MODIFY | `src/components/spotline/SpotLineVariationsList.tsx` | 정렬 토글, 페이지네이션, diff 배지, 비교 모달 통합 |
| NEW | `src/components/spotline/VariationCompareModal.tsx` | 원본 vs 변형 Spot 비교 모달 |
| NEW | `src/components/spotline/VariationForkTree.tsx` | 포크 트리 시각화 |
| MODIFY | `src/components/spotline/SpotLineVariations.tsx` | CTA 추가, 항상 렌더링, 포크 트리 통합, props 확장 |
| MODIFY | `src/app/spotline/[slug]/page.tsx` | variationsCount 조건 제거, 새 props 전달 |

**Total**: 3 NEW + 5 MODIFY = 8 files
