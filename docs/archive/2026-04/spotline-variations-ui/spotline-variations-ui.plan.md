# spotline-variations-ui Planning Document

> **Summary**: SpotLine 변형 UI 강화 — Spot 비교, 포크 트리, 변형 생성 CTA, 검색/정렬 기능 추가
>
> **Project**: front-spotLine (Spotline)
> **Version**: 0.1.0
> **Author**: Claude
> **Date**: 2026-04-16
> **Status**: Draft

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

### 1.1 Purpose

현재 SpotLine 변형 섹션은 변형 수 표시 + 단순 카드 리스트만 제공한다. 사용자가 "이 변형이 원본과 어떻게 다른지"를 알 수 없어 변형 탐색의 가치가 낮다. 원본-변형 간 Spot 비교, 계보 시각화, 변형 생성 유도를 통해 Experience Replication 기능을 완성한다.

### 1.2 Background

- Backend에 변형 관련 API가 이미 완비되어 있음 (`GET /variations`, `POST /replicate`, `POST /spotlines` with `parentSpotLineId`)
- `SpotLineDetailResponse`에 `parentSpotLineId`, `variationsCount` 필드 존재
- `SpotLinePreview`에 `spotCount`, `theme`, `area` 등 기본 메타데이터 존재
- 현재 `SpotLineVariations.tsx`와 `SpotLineVariationsList.tsx`가 기본 구현 상태
- Spot 비교를 위해서는 변형 SpotLine의 spots 데이터를 추가 fetch 필요

### 1.3 Related Documents

- Plan: `docs/01-plan/features/experience-social-platform.plan.md` (Phase 7: Experience Replication)
- CLAUDE.md: 프로젝트 아키텍처 및 컨벤션
- Backend: SpotLineController — variations, replicate 엔드포인트

---

## 2. Scope

### 2.1 In Scope

- [ ] 변형 카드에 Spot diff 요약 표시 (추가/제거/공통 Spot 수)
- [ ] 변형 상세 비교 모달 (원본 vs 변형 Spot 리스트 side-by-side)
- [ ] 포크 트리 시각화 (원본 → 변형 계보를 간단한 트리로 표시)
- [ ] "나만의 변형 만들기" CTA 버튼 (SpotLine 생성 폼으로 연결, parentSpotLineId 전달)
- [ ] 변형 목록 정렬 (최신순/인기순) 및 페이지네이션
- [ ] 원본 SpotLine인 경우에도 항상 변형 섹션 표시 (변형 0개일 때 CTA만 표시)

### 2.2 Out of Scope

- Backend API 신규 추가 (기존 API만 활용)
- 변형 간 실시간 Spot 이동 애니메이션
- 변형에 대한 투표/랭킹 시스템
- 변형 알림 (원본 작성자에게 알림)
- 변형 Spot의 상세 정보 비교 (카테고리, 체류시간 등 심층 비교)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 변형 카드에 원본 대비 Spot 변경 요약 배지 표시 ("+2 / -1 / =3 Spot") | High | Pending |
| FR-02 | 변형 카드 클릭 시 비교 모달 — 원본/변형 Spot 리스트를 나란히 표시, 추가된 Spot(초록), 제거된 Spot(빨강), 공통 Spot(회색)으로 색상 구분 | High | Pending |
| FR-03 | 포크 트리 컴포넌트 — 원본에서 갈라진 변형들을 세로 트리로 시각화, 각 노드 클릭 시 해당 SpotLine으로 이동 | Medium | Pending |
| FR-04 | "나만의 변형 만들기" CTA — SpotLine 생성 폼(`/create-spotline`)으로 이동 시 `parentSpotLineId`와 원본 Spot 데이터를 query param 또는 store로 전달 | High | Pending |
| FR-05 | 변형 목록 정렬 토글 (최신순 ↔ 좋아요순), fetchSpotLineVariations에 sort 파라미터 추가 | Medium | Pending |
| FR-06 | 변형이 0개인 원본 SpotLine에서도 변형 섹션 표시 (CTA만 노출하여 생성 유도) | Medium | Pending |

### 3.2 Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-01 | 비교 모달 열기 시 추가 API 호출 1회 이내 (변형 SpotLine 상세 fetch) | High |
| NFR-02 | 변형 목록 초기 로드 5개, 더보기로 추가 로드 (페이지네이션) | Medium |
| NFR-03 | 모바일 퍼스트 반응형 — 비교 모달은 모바일에서 세로 스택 | High |
| NFR-04 | Purple 테마 유지 (기존 변형 섹션 컬러 계승) | Low |

---

## 4. Technical Approach

### 4.1 Existing Code (수정 대상)

| File | 변경 내용 |
|------|----------|
| `src/components/spotline/SpotLineVariations.tsx` | CTA 버튼 추가, 변형 0개 조건 제거, 포크 트리 통합 |
| `src/components/spotline/SpotLineVariationsList.tsx` | Spot diff 배지, 정렬 토글, 페이지네이션 추가 |
| `src/app/spotline/[slug]/page.tsx` | `variationsCount > 0` 조건 제거 (항상 렌더링) |
| `src/lib/api.ts` | `fetchSpotLineVariations`에 sort 파라미터 추가 |
| `src/types/index.ts` | Spot diff 관련 유틸 타입 추가 |

### 4.2 New Components

| File | 역할 |
|------|------|
| `src/components/spotline/VariationCompareModal.tsx` | 원본 vs 변형 Spot side-by-side 비교 모달 |
| `src/components/spotline/VariationForkTree.tsx` | 포크 트리 시각화 컴포넌트 |
| `src/components/spotline/VariationDiffBadge.tsx` | Spot 변경 요약 배지 (+N / -N / =N) |

### 4.3 Data Flow

```
SpotLine 상세 페이지 (page.tsx)
  └─ SpotLineVariations (항상 렌더링)
       ├─ VariationForkTree (parentSpotLineId가 있으면 트리 표시)
       ├─ SpotLineVariationsList (변형 카드 목록)
       │    ├─ VariationDiffBadge (각 카드에 diff 요약)
       │    └─ onClick → VariationCompareModal 열기
       └─ CTA "나만의 변형 만들기" 버튼
```

### 4.4 Spot Diff 계산 로직

비교 모달 열기 시:
1. `fetchSpotLineDetail(variationSlug)`로 변형 SpotLine의 spots 가져오기
2. 원본 spots의 `spotId` Set vs 변형 spots의 `spotId` Set 비교
3. `added` = 변형에만 있는 spotId, `removed` = 원본에만 있는 spotId, `common` = 양쪽 모두
4. diff 결과를 모달에 렌더링

카드의 diff 배지는 SpotLinePreview에 `spotCount`만 있으므로, 상세 비교 없이 "N곳" 수준만 표시하고, 모달에서 정확한 diff를 보여줌.

---

## 5. Implementation Order

1. **VariationDiffBadge** — 독립 컴포넌트, 단순 UI
2. **SpotLineVariationsList 개선** — 정렬 토글, 페이지네이션, diff 배지 통합
3. **VariationCompareModal** — 비교 모달 (fetchSpotLineDetail 활용)
4. **VariationForkTree** — 포크 트리 시각화
5. **SpotLineVariations 통합** — CTA 추가, 항상 렌더링 조건, 전체 조합
6. **page.tsx 수정** — variationsCount 조건 제거

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 변형 SpotLine의 spots를 가져오려면 추가 API 호출 필요 | 비교 모달 열기 시 지연 | 모달 열기 시에만 lazy fetch, 로딩 스켈레톤 표시 |
| SpotLinePreview에 spots 배열이 없어 카드에서 정확한 diff 불가 | 카드 diff 배지가 부정확할 수 있음 | 카드에는 spotCount 차이만 표시, 정확한 diff는 모달에서 |
| 포크 트리가 깊어질 경우 (N세대 변형) | 렌더링 복잡도 증가 | 최대 2단계까지만 표시, 이후는 "더보기" 링크 |
