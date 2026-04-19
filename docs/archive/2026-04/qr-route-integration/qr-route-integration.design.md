# qr-route-integration Design Document

> **Summary**: QR 스캔 히스토리 추적 + 기존 SpotLine에 Spot 추가 + 세션 기반 자동 SpotLine 초안 생성
>
> **Project**: Spotline
> **Version**: 0.1
> **Author**: AI
> **Date**: 2026-04-19
> **Status**: Draft
> **Planning Doc**: [qr-route-integration.plan.md](../01-plan/features/qr-route-integration.plan.md)

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | QR 스캔과 SpotLine 생성이 분리되어 있어, 유저가 여러 매장을 방문하며 자연스럽게 SpotLine을 만들 수 없음 |
| **Solution** | localStorage 기반 스캔 히스토리 + "기존 SpotLine에 추가" 바텀시트 + 세션 플로팅 배너 + 히스토리 페이지 |
| **Function/UX Effect** | QR 스캔 → Spot 상세 → "내 SpotLine에 추가" 원탭, 2개+ 스캔 시 플로팅 배너로 SpotLine 생성 유도 |
| **Core Value** | Pillar 1(QR Discovery) → Pillar 2(Experience Recording) 자연스러운 전환 루프 완성 |

---

## 1. Overview

### 1.1 Design Goals

- QR 스캔 히스토리를 클라이언트 측에서 추적하여 서버 부하 없이 세션 기반 경험 기록
- 기존 SpotLine에 Spot을 추가하는 원탭 플로우 제공
- 2개 이상 QR 스캔 시 자동으로 SpotLine 생성을 유도하는 플로팅 배너
- 기존 QR 플로우(`/qr/[qrId]` → `/spot/[slug]?qr=`)에 영향 없이 확장

### 1.2 Design Principles

- **Zero Backend Changes**: localStorage 기반으로 서버 API 추가 없음
- **Progressive Enhancement**: QR 모드가 아닌 일반 방문에는 영향 없음
- **Reuse Existing UI**: SpotLineBuilder 재활용, 새 API 엔드포인트 불필요
- **Mobile First**: 모든 UI는 모바일 뷰포트 최적화

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  /qr/[qrId]                                                 │
│    └── resolveQrToSpot() → redirect /spot/[slug]?qr=        │
│          └── ★ addQrScanToHistory()  ← NEW                  │
│                                                              │
│  /spot/[slug]?qr=                                            │
│    ├── SpotBottomBar                                         │
│    │     └── ★ "SpotLine에 추가" 버튼  ← NEW                │
│    │           └── AddToSpotLineSheet (바텀시트)              │
│    │                 └── 내 SpotLine 목록 → SpotLineBuilder  │
│    └── ★ QrSessionBanner (플로팅)  ← NEW                    │
│          └── "N개 Spot 방문 — SpotLine 만들기"               │
│                                                              │
│  ★ /qr-history  ← NEW PAGE                                  │
│    ├── 당일 스캔 타임라인                                    │
│    └── "이 Spot들로 SpotLine 만들기" 버튼                    │
│                                                              │
│  localStorage                                                │
│    └── qr-scan-history: QrScanHistoryItem[]                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
QR 스캔 → /qr/[qrId] → resolveQrToSpot → addQrScanToHistory(localStorage)
       → redirect /spot/[slug]?qr=[qrId]
       → SpotBottomBar에 "SpotLine에 추가" 표시
       → QrSessionBanner 스캔 카운트 업데이트
       → 사용자가 "SpotLine에 추가" 클릭
       → AddToSpotLineSheet에서 기존 SpotLine 선택
       → /create-spotline?spot=[slug]&edit=[spotlineId] 이동
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| `qr-history.ts` | localStorage API | 스캔 히스토리 CRUD |
| `AddToSpotLineSheet` | `GET /api/v2/spotlines/me` | 내 SpotLine 목록 조회 |
| `QrSessionBanner` | `qr-history.ts` | 세션 스캔 카운트 표시 |
| `SpotBottomBar` (수정) | `qr-history.ts` | QR 모드 시 추가 버튼 표시 |

---

## 3. Data Model

### 3.1 Entity Definition (localStorage)

```typescript
// src/types/index.ts에 추가

/** QR 스캔 히스토리 항목 (localStorage 저장) */
interface QrScanHistoryItem {
  spotId: string;          // Spot ID
  slug: string;            // Spot slug (URL 생성용)
  title: string;           // Spot 이름
  category: string;        // Spot 카테고리
  thumbnailUrl?: string;   // 썸네일 이미지 URL
  qrId: string;            // QR 코드 ID
  scannedAt: string;       // ISO 8601 타임스탬프
}
```

### 3.2 localStorage Schema

```typescript
// key: "qr-scan-history"
// value: QrScanHistoryItem[]
// TTL: 24시간 (만료된 항목은 읽기 시 자동 정리)
// 최대 항목: 50개 (FIFO)

// key: "qr-session-banner-dismissed"
// value: string (ISO date — 마지막 배너 닫은 날짜)
```

### 3.3 기존 API 활용

```
GET /api/v2/spotlines/me         — 내 SpotLine 목록 (AddToSpotLineSheet에서 사용)
GET /api/v2/spots/{slug}         — Spot 상세 (QR 리졸브 후 히스토리 저장 시 정보 참조)
```

> **Note**: 새로운 백엔드 API 없음. "기존 SpotLine에 Spot 추가"는 SpotLineBuilder를 통해 처리.

---

## 4. API Specification

### 4.1 사용하는 기존 API

| Method | Path | Description | 사용 위치 |
|--------|------|-------------|-----------|
| GET | `/api/v2/spotlines/me` | 내 SpotLine 목록 | AddToSpotLineSheet |
| GET | `/api/v2/qr/{qrId}/resolve` | QR → Spot 매핑 | /qr/[qrId] (기존) |

### 4.2 신규 API

없음. 모든 신규 기능은 클라이언트 측 localStorage로 처리.

---

## 5. UI/UX Design

### 5.1 DI-01: QR 스캔 히스토리 저장 (FR-01)

**변경 파일**: `src/app/qr/[qrId]/page.tsx`

QR 리졸브 성공 후 리다이렉트 전에 localStorage에 스캔 기록 저장:

```
기존 플로우:
  resolveQrToSpot → router.replace(/spot/[slug]?qr=)

변경 플로우:
  resolveQrToSpot → addQrScanToHistory(result) → router.replace(/spot/[slug]?qr=)
```

Spot 상세 정보(title, category, thumbnail)는 QR 리졸브 응답에서 가져옴. 응답에 없으면 slug만 저장하고, Spot 상세 페이지 로드 시 보완.

### 5.2 DI-02: "기존 SpotLine에 추가" 버튼 (FR-02)

**변경 파일**: `src/components/spot/SpotBottomBar.tsx`

QR 모드(`?qr=` 파라미터 존재) 시 하단 바에 "추가" 버튼 표시:

```
┌──────────────────────────────────────────────────────────┐
│ ❤️ 12  🔖 저장  📍 체크인  📤 공유  [+SpotLine]  [길찾기] │
└──────────────────────────────────────────────────────────┘
                                    ↑ NEW (QR 모드에서만)
```

**SpotBottomBar 수정사항**:
- Props에 `isQrMode?: boolean` 추가
- QR 모드일 때 기존 "코스" 버튼 옆에 "추가" 버튼 추가
- 클릭 시 `AddToSpotLineSheet` 바텀시트 열기

**신규 파일**: `src/components/qr/AddToSpotLineSheet.tsx`

```
┌──────────────────────────────────┐
│  SpotLine에 추가          ✕ 닫기 │
├──────────────────────────────────┤
│                                  │
│  📂 내 SpotLine                  │
│  ┌────────────────────────────┐  │
│  │ 🔹 홍대 카페 투어          │  │
│  │    3개 Spot · 도보 25분    │  │
│  ├────────────────────────────┤  │
│  │ 🔹 성수동 데이트 코스      │  │
│  │    5개 Spot · 도보 40분    │  │
│  ├────────────────────────────┤  │
│  │ 🔹 이태원 맛집 투어        │  │
│  │    4개 Spot · 도보 30분    │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ ＋ 새 SpotLine 만들기      │  │
│  └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

동작:
- 기존 SpotLine 클릭 → `/create-spotline?spot=[slug]&edit=[spotlineSlug]` 이동 (SpotLineBuilder가 해당 SpotLine에 이 Spot 추가)
- "새 SpotLine 만들기" → `/create-spotline?spot=[slug]` 이동 (기존 동작)
- 내 SpotLine이 없으면 빈 상태 메시지 + "새로 만들기" 버튼만 표시

### 5.3 DI-03: `/qr-history` 페이지 (FR-03)

**신규 파일**: `src/app/qr-history/page.tsx`

```
┌──────────────────────────────────┐
│ ← 오늘의 발견                    │
├──────────────────────────────────┤
│                                  │
│  📍 오늘 방문한 Spot (3)         │
│                                  │
│  14:30  ☕ 블루보틀 성수점       │
│         성수동 · cafe            │
│                                  │
│  15:15  🍰 어니언 성수           │
│         성수동 · cafe            │
│                                  │
│  16:00  🎨 피크닉                │
│         성수동 · culture         │
│                                  │
│  ┌────────────────────────────┐  │
│  │ 🚀 이 Spot들로 SpotLine   │  │
│  │    만들기                  │  │
│  └────────────────────────────┘  │
│                                  │
│  히스토리가 없으면:              │
│  "아직 QR 스캔 기록이 없어요"    │
│  "QR 코드를 스캔하면 여기에      │
│   방문 기록이 쌓여요"            │
│                                  │
└──────────────────────────────────┘
```

- 타임라인 형태로 당일 스캔 기록 표시
- 각 항목 클릭 → `/spot/[slug]` 이동
- "SpotLine 만들기" 버튼 → `/create-spotline?spots=[slug1],[slug2],[slug3]` 이동
- 선택적 삭제 기능 (스와이프 or X 버튼)

### 5.4 DI-04: SpotLine 자동 생성 제안 (FR-04)

"SpotLine 만들기" 버튼 클릭 시 SpotLineBuilder에 여러 Spot을 전달:

```
/create-spotline?spots=bluebottle-seongsu,onion-seongsu,piknic-seongsu
```

**변경 파일**: `src/app/create-spotline/page.tsx`
- `spots` 쿼리 파라미터 지원 추가 (복수 Spot slug, 콤마 구분)
- SpotLineBuilder에 `spotSlugs?: string[]` prop 전달

**변경 파일**: `src/components/spotline-builder/SpotLineBuilder.tsx`
- `spotSlugs` prop 수신 시 해당 Spot들을 초기 목록에 추가

### 5.5 DI-05: QR 세션 플로팅 배너 (FR-05)

**신규 파일**: `src/components/qr/QrSessionBanner.tsx`

```
┌──────────────────────────────────────────────┐
│  📍 3개 Spot 방문 · SpotLine 만들기 →   ✕   │
└──────────────────────────────────────────────┘
  ↑ 화면 하단, SpotBottomBar 위에 고정
  ↑ QR 모드 + 2개 이상 스캔 시에만 표시
  ↑ X로 닫으면 당일 재표시 안 함
```

표시 조건:
- URL에 `?qr=` 파라미터 존재 (QR 모드)
- 당일 QR 스캔 히스토리 2개 이상
- 배너를 닫지 않은 상태

동작:
- 배너 클릭 → `/qr-history` 페이지 이동
- X 버튼 → `qr-session-banner-dismissed` 에 오늘 날짜 저장

### 5.6 DI-06: SpotLine 추천 강화 (FR-06)

**변경 파일**: `src/app/spot/[slug]/page.tsx`

QR 모드 시 `SpotSpotLines` 컴포넌트 위치를 기존 위치보다 상단에 배치하고, 헤딩 텍스트를 변경:

```
기존: "이 Spot이 포함된 SpotLine" (하단 배치)
QR 모드: "이 장소가 포함된 추천 코스" (상단 배치, 강조 스타일)
```

### 5.7 Component List

| Component | Location | Type | Responsibility |
|-----------|----------|------|----------------|
| `qr-history.ts` | `src/lib/` | Utility | localStorage CRUD (add, get, remove, clear, cleanup) |
| `AddToSpotLineSheet` | `src/components/qr/` | Client | 기존 SpotLine에 추가 바텀시트 |
| `QrSessionBanner` | `src/components/qr/` | Client | 하단 플로팅 배너 |
| `qr-history/page.tsx` | `src/app/qr-history/` | Client | 스캔 히스토리 페이지 |
| `SpotBottomBar` | `src/components/spot/` | Client (수정) | QR 모드 시 "추가" 버튼 |
| `spot/[slug]/page.tsx` | `src/app/spot/[slug]/` | Server (수정) | QR 모드 시 SpotLine 추천 상단 배치 |
| `qr/[qrId]/page.tsx` | `src/app/qr/[qrId]/` | Client (수정) | 스캔 히스토리 기록 추가 |
| `create-spotline/page.tsx` | `src/app/create-spotline/` | Client (수정) | `spots` 쿼리 파라미터 지원 |

---

## 6. Error Handling

| Scenario | Handling | UX |
|----------|----------|------|
| localStorage 접근 불가 (시크릿 모드) | try-catch로 감싸고 graceful fallback | QR 히스토리 기능 비활성, 기존 플로우 유지 |
| 내 SpotLine 목록 API 실패 | 에러 상태 표시 + "새로 만들기"만 제공 | "목록을 불러올 수 없어요" 메시지 |
| QR 리졸브 실패 | 기존 에러 핸들링 유지 | 히스토리에 기록하지 않음 |
| localStorage 용량 초과 | 가장 오래된 항목 삭제 후 재시도 | 사용자에게 알림 없이 자동 처리 |

---

## 7. Security Considerations

- [x] localStorage는 동일 출처 정책(Same-origin)으로 보호
- [x] 스캔 히스토리에 민감 정보 미포함 (spotId, slug, title만)
- [x] 24시간 자동 만료로 장기 추적 방지
- [x] XSS 방지: localStorage 데이터 렌더링 시 React의 자동 이스케이핑 활용
- [x] 인증 필요 동작(SpotLine 추가)은 기존 AuthGuard 활용

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Method |
|------|--------|--------|
| Manual | QR 스캔 → 히스토리 저장 | 브라우저에서 /qr/[id] 접근 후 localStorage 확인 |
| Manual | AddToSpotLineSheet 플로우 | 내 SpotLine 목록 표시 및 선택 동작 |
| Manual | /qr-history 페이지 | 타임라인 렌더링, SpotLine 생성 연동 |
| Manual | QrSessionBanner 조건 표시 | 2개+ 스캔 후 배너 표시, X로 닫기 |
| Build | TypeScript 타입 검사 | `pnpm type-check` |
| Build | ESLint 검사 | `pnpm lint` |

### 8.2 Test Cases

- [ ] QR 스캔 시 localStorage에 히스토리 항목 추가됨
- [ ] 24시간 지난 항목은 조회 시 자동 정리됨
- [ ] 동일 Spot 중복 스캔 시 타임스탬프만 업데이트
- [ ] AddToSpotLineSheet에서 내 SpotLine 목록 정상 표시
- [ ] SpotLine 선택 시 SpotLineBuilder로 올바른 파라미터 전달
- [ ] /qr-history 페이지에서 타임라인 정상 렌더링
- [ ] "SpotLine 만들기" 클릭 시 모든 Spot slug 전달
- [ ] 배너는 QR 모드 + 2개+ 스캔에서만 표시
- [ ] 배너 X 클릭 시 당일 재표시 안 함
- [ ] 시크릿 모드에서 히스토리 기능 비활성 (에러 없이)

---

## 9. Clean Architecture

### 9.1 Layer Structure

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | UI 컴포넌트, 페이지 | `src/components/qr/`, `src/app/qr-history/` |
| **Infrastructure** | localStorage 접근 | `src/lib/qr-history.ts` |
| **Domain** | 타입 정의 | `src/types/index.ts` (QrScanHistoryItem) |

### 9.2 This Feature's Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| `QrSessionBanner` | Presentation | `src/components/qr/QrSessionBanner.tsx` |
| `AddToSpotLineSheet` | Presentation | `src/components/qr/AddToSpotLineSheet.tsx` |
| `qr-history/page.tsx` | Presentation | `src/app/qr-history/page.tsx` |
| `qr-history.ts` | Infrastructure | `src/lib/qr-history.ts` |
| `QrScanHistoryItem` | Domain | `src/types/index.ts` |

---

## 10. Coding Convention Reference

### 10.1 This Feature's Conventions

| Item | Convention Applied |
|------|-------------------|
| Component naming | PascalCase (`QrSessionBanner`, `AddToSpotLineSheet`) |
| File organization | `components/qr/` 디렉토리에 QR 관련 신규 컴포넌트 |
| State management | localStorage + React state (Zustand 미사용) |
| Error handling | try-catch with graceful fallback |
| Styling | Tailwind CSS 4 + `cn()` 유틸리티, 모바일 퍼스트 |
| Imports | `@/*` 경로 별칭, `import type` for 타입 |
| UI 텍스트 | 한국어 |

---

## 11. Implementation Guide

### 11.1 File Structure

```
src/
├── lib/
│   └── qr-history.ts                    ← NEW (localStorage CRUD)
├── types/
│   └── index.ts                         ← MODIFY (QrScanHistoryItem 추가)
├── components/
│   ├── qr/
│   │   ├── AddToSpotLineSheet.tsx        ← NEW (바텀시트)
│   │   └── QrSessionBanner.tsx           ← NEW (플로팅 배너)
│   └── spot/
│       └── SpotBottomBar.tsx             ← MODIFY (QR 모드 버튼 추가)
└── app/
    ├── qr/[qrId]/
    │   └── page.tsx                      ← MODIFY (히스토리 저장 추가)
    ├── qr-history/
    │   └── page.tsx                      ← NEW (히스토리 페이지)
    ├── create-spotline/
    │   └── page.tsx                      ← MODIFY (spots 파라미터 지원)
    └── spot/[slug]/
        └── page.tsx                      ← MODIFY (QR 모드 추천 상단 배치)
```

### 11.2 Implementation Order

1. [ ] **DI-01**: `src/lib/qr-history.ts` — localStorage CRUD 유틸리티 생성
2. [ ] **DI-01**: `src/types/index.ts` — `QrScanHistoryItem` 인터페이스 추가
3. [ ] **DI-01**: `src/app/qr/[qrId]/page.tsx` — 스캔 시 히스토리 저장 로직 추가
4. [ ] **DI-02**: `src/components/qr/AddToSpotLineSheet.tsx` — 바텀시트 컴포넌트 생성
5. [ ] **DI-02**: `src/components/spot/SpotBottomBar.tsx` — QR 모드 시 "추가" 버튼
6. [ ] **DI-03**: `src/app/qr-history/page.tsx` — 히스토리 페이지 생성
7. [ ] **DI-04**: `src/app/create-spotline/page.tsx` — `spots` 쿼리 파라미터 지원
8. [ ] **DI-05**: `src/components/qr/QrSessionBanner.tsx` — 플로팅 배너 생성
9. [ ] **DI-05**: `src/app/spot/[slug]/page.tsx` — 배너 렌더링 + SpotLine 추천 상단 배치 (DI-06)

### 11.3 Dependencies

```
DI-01 (qr-history.ts, types, QR page)
  ├── DI-02 (AddToSpotLineSheet, SpotBottomBar) — depends on DI-01
  ├── DI-03 (qr-history page) — depends on DI-01
  ├── DI-04 (create-spotline spots param) — depends on DI-03
  ├── DI-05 (QrSessionBanner) — depends on DI-01
  └── DI-06 (SpotLine 추천 상단 배치) — independent
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-19 | Initial draft | AI |
