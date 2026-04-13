# Partner QR System Design Document

> **Summary**: 파트너 QR 스캔 시 혜택 강조 배너 + CTA, 전환 퍼널 추적 확장
>
> **Feature**: partner-qr-system
> **Version**: 1.0
> **Date**: 2026-04-13
> **Status**: Draft
> **Plan Reference**: `docs/01-plan/features/partner-qr-system.plan.md`

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | QR 스캔으로 파트너 매장에 진입해도 일반 QR 배너만 표시되어 파트너 혜택이 즉시 인지되지 않음 |
| **Solution** | 파트너 QR 모드 전용 혜택 강조 배너(PartnerQrBanner) + CTA 버튼 + 4단계 전환 퍼널 이벤트 |
| **Function/UX Effect** | QR 스캔 → 파트너 혜택 배너 즉시 노출 → "혜택 받기" CTA → 전환 이벤트 기록 |
| **Core Value** | 파트너 매장의 QR 투자 대비 가시적 전환 효과 제공 → 파트너 유지율 향상 |

---

## 1. Overview

### 1.1 Design Goal

기존 `QrBanner`(일반 QR 배너)와 `PartnerBenefit`(파트너 혜택 카드)를 결합한 파트너 전용 QR 배너를 만들어, QR 스캔 진입 시 파트너 혜택을 즉시 강조하고 전환 이벤트를 추적한다.

### 1.2 Current State

| Component | File | Status |
|-----------|------|--------|
| `QrBanner` | `src/components/qr/QrBanner.tsx` | 일반 QR 배너 (파트너 구분 없음) |
| `QrAnalytics` | `src/components/qr/QrAnalytics.tsx` | `logPageEnter` + `recordQrScan` 2개 이벤트 |
| `PartnerBenefit` | `src/components/spot/PartnerBenefit.tsx` | 파트너 혜택 카드 (QR 모드와 무관하게 표시) |
| `spot/[slug]/page.tsx` | `src/app/spot/[slug]/page.tsx` | QR 모드 시 `QrBanner` + `QrAnalytics` 렌더 |

### 1.3 Design Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| 파트너 QR 배너 위치 | 기존 QrBanner 교체 vs 별도 추가 | 기존 QrBanner 교체 | QR 모드 + 파트너일 때 전용 배너 1개만 표시. 일반 QrBanner와 중복 방지 |
| CTA 동작 | 모달 vs 인라인 확장 vs 스크롤 | 스크롤 to PartnerBenefit | 최소 구현. PartnerBenefit 섹션이 이미 아래에 존재하므로 스크롤 유도 |
| 이벤트 전송 | QrAnalytics 확장 vs 별도 컴포넌트 | QrAnalytics 확장 | 기존 fire-and-forget 패턴 재사용. 1개 파일에서 이벤트 관리 |

---

## 2. Component Design

### 2.1 PartnerQrBanner (NEW)

**File**: `src/components/qr/PartnerQrBanner.tsx`

**Purpose**: QR 스캔 + 파트너 매장일 때 표시되는 혜택 강조 배너

```tsx
// Props Interface
interface PartnerQrBannerProps {
  storeName: string;
  partner: SpotPartnerInfo;
  onBenefitClick: () => void;  // CTA 클릭 핸들러
}
```

**UI Structure**:
```
┌─────────────────────────────────────────┐
│ 🎁  [storeName] 방문 혜택               │
│                                         │
│  [benefitText]                          │
│                                         │
│  [ 혜택 받기 → ]  (CTA 버튼)            │
│                                         │
│  📍 QR 스캔으로 방문 확인 완료            │
└─────────────────────────────────────────┘
```

**Styling**:
- 배경/테두리: `partner.brandColor` 기반 (PartnerBenefit과 동일 패턴)
- CTA 버튼: `partner.brandColor` 배경, white 텍스트
- 서버 컴포넌트 불가 — `"use client"` (onBenefitClick 핸들러)

**Behavior**:
- CTA 클릭 → `onBenefitClick()` 호출 → 페이지 내 PartnerBenefit 섹션으로 스크롤
- CTA 클릭 시 `partner_benefit_click` 이벤트 기록 (api.ts 함수 호출)

### 2.2 spot/[slug]/page.tsx (MODIFY)

**변경 내용**: QR 모드 + 파트너 분기 로직 추가

**현재 코드** (L94-98):
```tsx
{isQrMode && (
  <>
    <QrBanner storeName={spot.title} />
    <QrAnalytics spotId={spot.id} qrId={qrId!} />
  </>
)}
```

**변경 후**:
```tsx
{isQrMode && (
  <>
    {spot.partner?.isPartner && spot.partner.benefitText ? (
      <PartnerQrBannerWrapper
        storeName={spot.title}
        partner={spot.partner}
        spotId={spot.id}
        qrId={qrId!}
      />
    ) : (
      <QrBanner storeName={spot.title} />
    )}
    <QrAnalytics spotId={spot.id} qrId={qrId!} />
  </>
)}
```

**PartnerQrBannerWrapper**: `"use client"` 래퍼 컴포넌트 (page.tsx는 서버 컴포넌트)
- PartnerQrBanner를 렌더하고 `onBenefitClick`에서 스크롤 + 이벤트 전송 처리
- 래퍼를 별도 파일로 분리하지 않고 PartnerQrBanner.tsx 내에 포함

**변경 사항**:
- `PartnerQrBanner` import 추가
- QR 모드 렌더링 블록에 파트너 분기 조건 추가
- PartnerBenefit 섹션에 `id="partner-benefit"` 추가 (스크롤 타겟)

### 2.3 QrAnalytics.tsx (MODIFY)

**변경 내용**: 전환 퍼널 이벤트 확장

**현재 이벤트**: `logPageEnter` + `recordQrScan` (2개)

**추가 이벤트**: `benefit_view` — 파트너 혜택 배너가 뷰포트에 진입했을 때

**변경 사항**:
```tsx
interface QrAnalyticsProps {
  spotId: string;
  qrId: string;
  isPartner?: boolean;  // 추가
}
```

- `isPartner`가 true일 때 `benefit_view` 이벤트 추가 기록
- 기존 `logPageEnter` + `recordQrScan`은 그대로 유지
- fire-and-forget 패턴 동일

**전환 퍼널 (4단계)**:
```
qr_scan (recordQrScan) → page_view (logPageEnter) → benefit_view (NEW) → benefit_click (NEW)
```

### 2.4 api.ts (MODIFY)

**추가 함수**:

```tsx
// 파트너 혜택 전환 이벤트 기록 (fire-and-forget)
export const recordPartnerEvent = async (
  qrId: string,
  eventType: "benefit_view" | "benefit_click",
  sessionId: string,
): Promise<void> => {
  try {
    await apiV2.post(`/qr/${qrId}/event`, null, {
      params: { sessionId, eventType },
      timeout: 3000,
    });
  } catch {
    // fire-and-forget
  }
};
```

**패턴**: 기존 `recordQrScan`과 동일한 fire-and-forget, 3초 타임아웃

---

## 3. Data Flow

### 3.1 QR 스캔 진입 플로우

```
QR 스캔
  → /qr/[qrId] (리다이렉트)
  → /spot/[slug]?qr=[qrId]
  → page.tsx (SSR)
    → spot.partner?.isPartner 확인
    → true:  PartnerQrBanner 렌더 (혜택 강조)
    → false: QrBanner 렌더 (일반)
    → QrAnalytics 렌더 (이벤트 기록)
```

### 3.2 전환 이벤트 타임라인

```
1. QR 스캔      → recordQrScan(qrId, sessionId)        [QrAnalytics]
2. 페이지 진입   → logPageEnter(spotId, qrId)           [QrAnalytics]
3. 혜택 배너 노출 → recordPartnerEvent(qrId, "benefit_view")  [QrAnalytics]
4. CTA 클릭     → recordPartnerEvent(qrId, "benefit_click")  [PartnerQrBanner]
```

---

## 4. File Changes Summary

| # | File | Type | Changes | LOC |
|---|------|------|---------|:---:|
| 1 | `src/components/qr/PartnerQrBanner.tsx` | NEW | 파트너 QR 혜택 배너 + CTA + 래퍼 | ~65 |
| 2 | `src/app/spot/[slug]/page.tsx` | MODIFY | 파트너 QR 모드 분기, PartnerBenefit id 추가 | ~12 |
| 3 | `src/components/qr/QrAnalytics.tsx` | MODIFY | `isPartner` prop + `benefit_view` 이벤트 | ~10 |
| 4 | `src/lib/api.ts` | MODIFY | `recordPartnerEvent` 함수 추가 | ~12 |
| | **Total** | 1 NEW, 3 MODIFY | | **~99** |

---

## 5. Implementation Order

```
Step 1: api.ts — recordPartnerEvent 함수 추가
Step 2: PartnerQrBanner.tsx — 파트너 QR 혜택 배너 컴포넌트
Step 3: QrAnalytics.tsx — isPartner prop + benefit_view 이벤트
Step 4: spot/[slug]/page.tsx — 파트너 QR 모드 분기 + PartnerBenefit id
```

**의존성**: Step 1 → Step 2 (api 함수 사용), Step 1 → Step 3 (api 함수 사용). Step 4는 Step 2, 3 완료 후.

---

## 6. Error Handling

| Scenario | Handling |
|----------|----------|
| `recordPartnerEvent` API 실패 | fire-and-forget, 무시 (UX 차단 없음) |
| `partner` 데이터 null | 일반 QrBanner 폴백 (분기 조건에서 처리) |
| `benefitText` 없음 | 일반 QrBanner 폴백 |
| 스크롤 타겟 없음 | `document.getElementById` null 체크 |

---

## 7. Coding Conventions

- `"use client"` — PartnerQrBanner (이벤트 핸들러), QrAnalytics (useEffect)
- Tailwind CSS 4 + `cn()` 유틸리티
- `partner.brandColor`를 inline style로 적용 (Tailwind 동적 색상 불가)
- 한국어 UI 텍스트, 영어 코드
- import 순서: React/Next → lucide-react → @/lib → @/types

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-04-13 | Initial design | Claude |
