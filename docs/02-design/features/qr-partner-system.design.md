# Design: QR Partner System — Phase 8

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | 파트너 매장 0개, QR 관리 UI 없음, 수익화 기반 부재 |
| **Solution** | Admin 파트너 CRUD + QR 생성/다운로드 + Front 파트너 배지/혜택 표시 |
| **Function UX Effect** | Admin: 파트너 등록→QR 생성→다운로드. Front: Spot 상세에서 파트너 배지+혜택 자동 표시 |
| **Core Value** | 콘텐츠→트래픽→파트너→수익화 루프 완성 |

| Item | Detail |
|------|--------|
| Feature | QR Partner System (Phase 8) |
| Plan | [qr-partner-system.plan.md](../../01-plan/features/qr-partner-system.plan.md) |
| Created | 2026-03-28 |
| Cross-Repo | admin-spotLine + front-spotLine |

---

## 1. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Admin Flow                               │
│                                                                 │
│  PartnerManagement ── PartnerRegistration ── PartnerDetail      │
│       (목록)              (등록 폼)          (상세+QR+분석)     │
│         │                    │                    │              │
│         └────── partnerAPI ──┘────────────────────┘              │
│                    │                                            │
│                    ▼                                            │
│           Backend /api/v2/admin/partners/*                      │
│                    │                                            │
│                    ▼                                            │
│           Partner DB + QR Code Table                           │
│                    │                                            │
│                    ▼                                            │
│         GET /api/v2/spots/{slug}  → partner?: SpotPartnerInfo  │
│                    │                                            │
│                    ▼                                            │
│                 Front Flow                                      │
│                                                                 │
│  /qr/[qrId] → resolveQrToSpot → /spot/[slug]                  │
│                                      │                          │
│                                 SpotHero (파트너 배지)          │
│                                 PartnerBenefit (혜택 카드)      │
│                                 SpotPreviewCard (파트너 아이콘) │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Model

### 2.1 Front 타입 추가 (`front-spotLine/src/types/index.ts`)

```typescript
// ── QR Partner System (Phase 8) ──

// 파트너 등급
export type PartnerTier = "basic" | "premium";

// Spot API 응답에 포함될 파트너 정보 (lightweight)
export interface SpotPartnerInfo {
  isPartner: boolean;
  brandColor: string;          // hex color (e.g., "#FF6B35")
  benefitText: string | null;  // "QR 스캔 고객 10% 할인"
  tier: PartnerTier;
  partnerSince: string;        // ISO date
}
```

`SpotDetailResponse` 확장:
```typescript
export interface SpotDetailResponse {
  // ... 기존 필드 유지
  partner: SpotPartnerInfo | null;  // ← 추가
}
```

### 2.2 Admin 타입 추가 (`admin-spotLine/src/types/v2.ts`)

```typescript
// ── Partner ──

export type PartnerTier = "BASIC" | "PREMIUM";
export type PartnerStatus = "ACTIVE" | "PAUSED" | "TERMINATED";

export interface PartnerDetailResponse {
  id: string;
  spotId: string;
  spotSlug: string;
  spotTitle: string;
  spotArea: string;
  status: PartnerStatus;
  tier: PartnerTier;
  brandColor: string;
  benefitText: string | null;
  contractStartDate: string;
  contractEndDate: string | null;
  note: string | null;
  qrCodes: PartnerQRCodeResponse[];
  totalScans: number;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerQRCodeResponse {
  id: string;
  qrId: string;           // URL에 사용되는 고유 ID
  label: string;           // "정문", "카운터"
  isActive: boolean;
  scansCount: number;
  createdAt: string;
}

export interface CreatePartnerRequest {
  spotId: string;
  tier: PartnerTier;
  brandColor: string;
  benefitText?: string;
  contractStartDate: string;
  note?: string;
}

export interface UpdatePartnerRequest {
  tier?: PartnerTier;
  brandColor?: string;
  benefitText?: string;
  contractEndDate?: string;
  note?: string;
  status?: PartnerStatus;
}

export interface PartnerAnalyticsResponse {
  totalScans: number;
  uniqueVisitors: number;
  conversionRate: number;
  lastScanAt: string | null;
  dailyTrend: { date: string; scans: number }[];
}
```

`SpotDetailResponse` 확장 (admin):
```typescript
export interface SpotDetailResponse {
  // ... 기존 필드 유지
  partner: { isPartner: boolean; partnerId: string } | null;  // ← 추가
}
```

---

## 3. API Specification

### 3.1 Admin Partner API (`admin-spotLine/src/services/v2/partnerAPI.ts`)

패턴: 기존 `spotAPI.ts`와 동일 — `apiClient` 기반 객체 리터럴.

```typescript
import { apiClient } from "../base/apiClient";
import type {
  PartnerDetailResponse,
  CreatePartnerRequest,
  UpdatePartnerRequest,
  PartnerQRCodeResponse,
  PartnerAnalyticsResponse,
  PartnerStatus,
  SpringPage,
} from "../../types/v2";

export interface PartnerListParams {
  page?: number;     // 1-indexed (UI)
  size?: number;
  status?: PartnerStatus;
  search?: string;   // spotTitle 검색
}

export const partnerAPI = {
  getList: (params: PartnerListParams = {}) => {
    const { page = 1, size = 20, ...rest } = params;
    return apiClient.get<SpringPage<PartnerDetailResponse>>("/api/v2/admin/partners", {
      params: { page: page - 1, size, ...rest },
    });
  },

  getById: (id: string) =>
    apiClient.get<PartnerDetailResponse>(`/api/v2/admin/partners/${id}`),

  create: (data: CreatePartnerRequest) =>
    apiClient.post<PartnerDetailResponse>("/api/v2/admin/partners", data),

  update: (id: string, data: UpdatePartnerRequest) =>
    apiClient.patch<PartnerDetailResponse>(`/api/v2/admin/partners/${id}`, data),

  terminate: (id: string) =>
    apiClient.delete(`/api/v2/admin/partners/${id}`),

  // QR 코드
  createQRCode: (partnerId: string, label: string) =>
    apiClient.post<PartnerQRCodeResponse>(`/api/v2/admin/partners/${partnerId}/qr-codes`, { label }),

  getQRCodes: (partnerId: string) =>
    apiClient.get<PartnerQRCodeResponse[]>(`/api/v2/admin/partners/${partnerId}/qr-codes`),

  deactivateQRCode: (partnerId: string, qrCodeId: string) =>
    apiClient.patch(`/api/v2/admin/partners/${partnerId}/qr-codes/${qrCodeId}`, { isActive: false }),

  // 분석
  getAnalytics: (partnerId: string, period: string = "30d") =>
    apiClient.get<PartnerAnalyticsResponse>(`/api/v2/admin/partners/${partnerId}/analytics`, {
      params: { period },
    }),
};
```

### 3.2 Front API 변경 (`front-spotLine/src/lib/api.ts`)

변경 **없음**. `fetchSpotDetail(slug)` → `GET /api/v2/spots/{slug}` 응답에 `partner` 필드가 포함되면 자동으로 타입이 반영됨. 별도 API 함수 추가 불필요.

---

## 4. Component Specifications

### 4.1 Admin Components

#### 4.1.1 PartnerManagement.tsx (Page)

**위치**: `admin-spotLine/src/pages/PartnerManagement.tsx`
**패턴**: `SpotManagement.tsx` 참조 — `useQuery` + 리스트 + 필터

```
┌──────────────────────────────────────────────────────────┐
│  파트너 관리                                 [+ 등록]     │
├──────────────────────────────────────────────────────────┤
│  상태: [전체 ▼]    검색: [매장명 입력...           ]      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ● 카페 소나무                        활성  basic  │  │
│  │    강남구 역삼동 · QR 3개 · 스캔 1,234회           │  │
│  │    계약: 2026-04-01 ~                  [상세 →]    │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ● 레스토랑 달빛                      일시정지      │  │
│  │    ...                                             │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  [< 1 2 3 ... >]  페이지네이션                           │
└──────────────────────────────────────────────────────────┘
```

**구현 세부사항**:
- `useQuery(["partners", status, page], () => partnerAPI.getList(...))`
- 상태 필터: `<select>` — 전체 / ACTIVE / PAUSED / TERMINATED
- 검색: `<input>` — `search` param으로 API 요청 (debounce 300ms)
- 페이지네이션: `SpringPage` → `toDataTablePagination()` 활용
- "등록" 버튼: `navigate("/partners/new")`
- 카드 클릭: `navigate(\`/partners/${id}\`)`

#### 4.1.2 PartnerRegistration.tsx (Page)

**위치**: `admin-spotLine/src/pages/PartnerRegistration.tsx`
**패턴**: `SpotCuration.tsx` 참조 — 2컬럼 폼

```
┌──────────────────────────────────────────────────────────┐
│  ← 파트너 등록                                           │
├──────────────────────┬───────────────────────────────────┤
│                      │                                   │
│  Spot 선택           │   미리보기                         │
│  [Spot 검색... ▼]    │   ┌──────────────────────────┐    │
│                      │   │ ● 카페 소나무             │    │
│  계약 시작일          │   │   강남구 역삼동            │    │
│  [2026-04-01]        │   │                          │    │
│                      │   │  ★ SpotLine 파트너        │    │
│  파트너 등급          │   │  since 2026.04           │    │
│  (●) Basic  ( ) Premium│   │                          │    │
│                      │   │  🎁 QR 스캔 고객 혜택     │    │
│  브랜딩 컬러          │   │  10% 할인                │    │
│  [#FF6B35  🎨]       │   └──────────────────────────┘    │
│                      │                                   │
│  혜택 텍스트          │                                   │
│  [QR 스캔 고객 10%...]│                                   │
│                      │                                   │
│  메모                │                                   │
│  [내부 메모...]       │                                   │
│                      │                                   │
│  [등록하기]           │                                   │
│                      │                                   │
└──────────────────────┴───────────────────────────────────┘
```

**구현 세부사항**:
- `react-hook-form` + `useMutation` 패턴
- Spot 검색: 기존 `spotAPI.getList({ search })` 활용하여 드롭다운
- 컬러 피커: `<input type="color">` (네이티브)
- 성공 시: `navigate(\`/partners/${newPartner.id}\`)` + 성공 알림
- 실패 시: 인라인 에러 배너 (`bg-red-50`)

#### 4.1.3 PartnerDetail.tsx (Page)

**위치**: `admin-spotLine/src/pages/PartnerDetail.tsx`
**탭 구조**: 정보 | QR 코드 | 분석

```
┌──────────────────────────────────────────────────────────┐
│  ← 카페 소나무                    [수정] [일시정지] [해지]│
├──────────────────────────────────────────────────────────┤
│  [정보]  [QR 코드 (3)]  [분석]                           │
├──────────────────────────────────────────────────────────┤
│  (탭 내용)                                               │
└──────────────────────────────────────────────────────────┘
```

**정보 탭**: 파트너 기본 정보 카드 (상태, 등급, 컬러, 혜택, 계약일, 메모)
**QR 코드 탭**: `QRCodeManager` 컴포넌트 렌더링
**분석 탭**: `PartnerAnalytics` 컴포넌트 렌더링

#### 4.1.4 QRCodeManager.tsx (Component)

**위치**: `admin-spotLine/src/components/QRCodeManager.tsx`
**Props**: `{ partnerId: string; qrCodes: PartnerQRCodeResponse[] }`

```
┌──────────────────────────────────────────────────────────┐
│  QR 코드 관리                            [+ 새 QR 생성]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────┐  정문 QR                                     │
│  │ [QR    │  ID: partner-cafe-sonamu-001                 │
│  │  코드  │  스캔 890회 · 활성                           │
│  │  SVG]  │  생성: 2026-04-01                            │
│  └────────┘  [SVG] [PNG] [비활성화]                      │
│                                                          │
│  ┌────────┐  카운터 QR                                   │
│  │ [QR    │  ID: partner-cafe-sonamu-002                 │
│  │  코드  │  스캔 344회 · 활성                           │
│  │  SVG]  │  생성: 2026-04-05                            │
│  └────────┘  [SVG] [PNG] [비활성화]                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**QR 생성 플로우**:
1. "새 QR 생성" 클릭 → 모달: 라벨 입력 (`<input>`)
2. `partnerAPI.createQRCode(partnerId, label)` → 서버가 `qrId` 발급
3. 응답의 `qrId`로 URL 생성: `https://spotline.kr/qr/{qrId}`
4. `qrcode.react`의 `<QRCodeSVG value={url} />` 렌더링

**다운로드 구현**:
- SVG: QRCodeSVG → `outerHTML` → Blob → `URL.createObjectURL` → `<a download>`
- PNG: SVG → `<canvas>` 렌더링 → `toDataURL("image/png")` → download

#### 4.1.5 PartnerAnalytics.tsx (Component)

**위치**: `admin-spotLine/src/components/PartnerAnalytics.tsx`
**Props**: `{ partnerId: string }`

```
┌──────────────────────────────────────────────────────────┐
│  기간: [7일] [30일] [90일]                               │
├──────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ 총 스캔   │  │ 방문자    │  │ 전환율    │               │
│  │  1,234    │  │   890    │  │  72%     │               │
│  └──────────┘  └──────────┘  └──────────┘               │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  📊 일별 스캔 추이 (라인 차트)                      │  │
│  │  ▂▃▅▆▇█▇▆▅▆▇██▇▅▃▂▃▅▆▇                            │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**차트**: 텍스트 기반 심플 바 차트 (의존성 최소화). `dailyTrend` 배열을 div height로 매핑.

### 4.2 Front Components

#### 4.2.1 PartnerBadge.tsx (Component)

**위치**: `front-spotLine/src/components/spot/PartnerBadge.tsx`
**Props**: `{ partner: SpotPartnerInfo }`

**SpotHero.tsx line 60**의 `flex items-center gap-2` div에 삽입:

```tsx
// SpotHero 내부, 카테고리 배지 옆
<div className="mb-1 flex items-center gap-2">
  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
    {categoryLabel}
  </span>
  {spot.partner?.isPartner && (
    <PartnerBadge partner={spot.partner} />
  )}
  <span className="text-xs text-gray-400">{spot.area}</span>
</div>
```

**PartnerBadge 렌더링**:
```tsx
<span
  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
  style={{ backgroundColor: partner.brandColor }}
>
  <Zap className="h-3 w-3" />
  파트너
</span>
```

- `partner.brandColor`를 `backgroundColor`로 사용 (inline style — 동적 컬러)
- Lucide `Zap` 아이콘 (기존 mockup 패턴 참조)
- 컬러 대비: 흰 텍스트 + 브랜딩 컬러 배경

#### 4.2.2 PartnerBenefit.tsx (Component)

**위치**: `front-spotLine/src/components/spot/PartnerBenefit.tsx`
**Props**: `{ partner: SpotPartnerInfo }`

**spot/[slug]/page.tsx** 삽입 위치: `SpotCrewNote` 바로 아래

```tsx
{spot.partner?.isPartner && spot.partner.benefitText && (
  <PartnerBenefit partner={spot.partner} />
)}
```

**렌더링**:
```
┌────────────────────────────────────────────┐
│  🎁 QR 스캔 고객 혜택                      │
│  10% 할인 (매장 직원에게 화면 제시)         │
│                                            │
│  SpotLine 파트너  since 2026.04            │
└────────────────────────────────────────────┘
```

```tsx
<section className="mt-4 rounded-xl border p-4" style={{ borderColor: partner.brandColor + "30", backgroundColor: partner.brandColor + "08" }}>
  <div className="flex items-center gap-2 mb-2">
    <Gift className="h-4 w-4" style={{ color: partner.brandColor }} />
    <span className="text-sm font-bold text-gray-900">QR 스캔 고객 혜택</span>
  </div>
  <p className="text-sm text-gray-700">{partner.benefitText}</p>
  <p className="mt-2 text-xs text-gray-400">
    SpotLine 파트너 · since {formatPartnerSince(partner.partnerSince)}
  </p>
</section>
```

- `borderColor`/`backgroundColor`에 opacity suffix 추가 (`"30"`, `"08"`)
- 기존 mockup/a의 `SpotLine 정보` 섹션 패턴과 일치

#### 4.2.3 SpotPreviewCard 수정

**위치**: `front-spotLine/src/components/shared/SpotPreviewCard.tsx`
**변경**: 이미지 영역에 파트너 아이콘 오버레이 추가

```tsx
<div className="relative h-36 w-full bg-gray-100">
  {imageUrl ? (
    <OptimizedImage src={imageUrl} alt={spot.title} fill className="object-cover" />
  ) : (
    <div className="flex h-full items-center justify-center">
      <MapPin className="h-8 w-8 text-gray-300" />
    </div>
  )}
  {/* Partner badge overlay */}
  {spot.partner?.isPartner && (
    <span
      className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm"
      style={{ backgroundColor: spot.partner.brandColor }}
    >
      <Zap className="h-2.5 w-2.5" />
      파트너
    </span>
  )}
</div>
```

#### 4.2.4 SpotHero.tsx 수정

**위치**: `front-spotLine/src/components/spot/SpotHero.tsx`
**변경**: 카테고리 배지 옆에 `PartnerBadge` 조건부 렌더링

Line 60 변경:
```tsx
// Before:
<div className="mb-1 flex items-center gap-2">
  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
    {categoryLabel}
  </span>
  <span className="text-xs text-gray-400">{spot.area}</span>
</div>

// After:
<div className="mb-1 flex items-center gap-2">
  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
    {categoryLabel}
  </span>
  {spot.partner?.isPartner && (
    <PartnerBadge partner={spot.partner} />
  )}
  <span className="text-xs text-gray-400">{spot.area}</span>
</div>
```

#### 4.2.5 spot/[slug]/page.tsx 수정

**위치**: `front-spotLine/src/app/spot/[slug]/page.tsx`
**변경**: `PartnerBenefit` import + 조건부 렌더링

Line 82-84 (SpotCrewNote 블록) 아래에 삽입:
```tsx
import PartnerBenefit from "@/components/spot/PartnerBenefit";

// ... render 내부, SpotCrewNote 아래:
{spot.partner?.isPartner && spot.partner.benefitText && (
  <PartnerBenefit partner={spot.partner} />
)}
```

---

## 5. Admin Routing

### 5.1 App.tsx 라우트 추가

```tsx
import PartnerManagement from "./pages/PartnerManagement";
import PartnerRegistration from "./pages/PartnerRegistration";
import PartnerDetail from "./pages/PartnerDetail";

// Route 추가 (기존 routes 라우트 아래):
<Route path="partners" element={<PartnerManagement />} />
<Route path="partners/new" element={<PartnerRegistration />} />
<Route path="partners/:id" element={<PartnerDetail />} />
```

### 5.2 Layout.tsx 내비게이션 추가

```typescript
import { Store, QrCode } from "lucide-react";

// navigation 배열에 추가 (curation 섹션):
{ name: "파트너 관리", href: "/partners", icon: Store, section: "partner" },
```

`NavSection` 추가:
```tsx
<NavSection title="파트너" section="partner" onClick={onNav} />
```

---

## 6. Dependencies

### 6.1 Admin 의존성

```bash
# QR 코드 클라이언트 사이드 생성
npm install qrcode.react
```

- `qrcode.react`: QR 코드 SVG/Canvas 렌더링 (Admin에서만 사용)
- 다른 신규 의존성 없음

### 6.2 Front 의존성

없음. 기존 패키지로 충분.

---

## 7. File Structure (전체)

```
admin-spotLine/src/
├── App.tsx                           ← 수정: 3개 라우트 추가
├── components/
│   ├── Layout.tsx                    ← 수정: 파트너 내비게이션 추가
│   ├── PartnerCard.tsx               ← 신규: 파트너 목록 카드
│   ├── PartnerForm.tsx               ← 신규: 등록/수정 폼
│   ├── QRCodeManager.tsx             ← 신규: QR 관리 (생성+다운로드)
│   ├── QRCodePreview.tsx             ← 신규: 단일 QR 카드 (SVG+다운로드)
│   └── PartnerAnalytics.tsx          ← 신규: 분석 차트
│
├── pages/
│   ├── PartnerManagement.tsx         ← 신규: 목록 페이지
│   ├── PartnerRegistration.tsx       ← 신규: 등록 페이지
│   └── PartnerDetail.tsx             ← 신규: 상세 페이지 (탭)
│
├── services/v2/
│   └── partnerAPI.ts                 ← 신규: API 함수
│
└── types/
    └── v2.ts                         ← 수정: Partner 타입 추가

front-spotLine/src/
├── components/
│   ├── spot/
│   │   ├── PartnerBadge.tsx          ← 신규: 파트너 배지
│   │   ├── PartnerBenefit.tsx        ← 신규: 혜택 카드
│   │   └── SpotHero.tsx              ← 수정: PartnerBadge 삽입
│   │
│   └── shared/
│       └── SpotPreviewCard.tsx       ← 수정: 파트너 아이콘 오버레이
│
├── app/
│   └── spot/[slug]/
│       └── page.tsx                  ← 수정: PartnerBenefit 삽입
│
└── types/
    └── index.ts                      ← 수정: SpotPartnerInfo + SpotDetailResponse 확장
```

**총**: Admin 신규 8개 + 수정 2개, Front 신규 2개 + 수정 4개 = **16개 파일**

---

## 8. Implementation Order

| Step | Repo | Files | Description | Depends |
|------|------|-------|-------------|---------|
| **1** | front | `types/index.ts` | `SpotPartnerInfo`, `PartnerTier` 타입 + `SpotDetailResponse.partner` 추가 | — |
| **2** | admin | `types/v2.ts` | Partner 관련 타입 추가 | — |
| **3** | admin | `services/v2/partnerAPI.ts` | Partner CRUD + QR + Analytics API 함수 | Step 2 |
| **4** | admin | `PartnerCard.tsx`, `PartnerManagement.tsx` | 파트너 목록 페이지 | Step 3 |
| **5** | admin | `PartnerForm.tsx`, `PartnerRegistration.tsx` | 파트너 등록 페이지 | Step 3 |
| **6** | admin | `QRCodePreview.tsx`, `QRCodeManager.tsx` | QR 코드 관리 컴포넌트 | Step 3 |
| **7** | admin | `PartnerDetail.tsx`, `PartnerAnalytics.tsx` | 파트너 상세 + 분석 | Step 4,5,6 |
| **8** | admin | `App.tsx`, `Layout.tsx` | 라우팅 + 내비게이션 연결 | Step 4,5,7 |
| **9** | front | `PartnerBadge.tsx`, `PartnerBenefit.tsx` | 파트너 UI 컴포넌트 | Step 1 |
| **10** | front | `SpotHero.tsx`, `spot/[slug]/page.tsx`, `SpotPreviewCard.tsx` | 기존 컴포넌트에 파트너 표시 삽입 | Step 9 |

---

## 9. Error Handling & Fallback

### 9.1 Admin

| Scenario | Handling |
|----------|----------|
| Partner API 401 | `apiClient` interceptor → `/login` 리다이렉트 |
| Partner API 404 | "파트너를 찾을 수 없습니다" 에러 배너 |
| QR 생성 실패 | 모달 내 에러 메시지 + 재시도 |
| 파트너 등록 실패 | 폼 에러 배너 (`bg-red-50`) + 필드 유효성 표시 |

### 9.2 Front

| Scenario | Handling |
|----------|----------|
| `spot.partner` 없음 | 배지/혜택 미표시 (graceful — optional chaining) |
| `spot.partner.benefitText` null | `PartnerBenefit` 미렌더링 |
| `spot.partner.brandColor` 없음 | fallback `"#6366F1"` (indigo) |

**원칙**: Front는 `partner` 필드의 존재 여부만으로 분기. Backend API 미구현이면 `partner: null` → 배지/혜택 모두 숨김. Zero-config fallback.

---

## 10. Convention Compliance

| Rule | Implementation |
|------|---------------|
| UI 텍스트 한국어 | 모든 버튼/레이블/에러 메시지 한국어 |
| 코드 영어 | 변수명, 타입명, 주석 영어 |
| Admin 패턴 | `useQuery`/`useMutation` + `apiClient` + `SpringPage` |
| Front cn() | Tailwind 조건부 클래스에 `cn()` 사용 |
| Front "use client" | `PartnerBadge`, `PartnerBenefit`은 서버 컴포넌트 (인터랙션 없음) → 디렉티브 불필요 |
| Lucide icons | 기존 아이콘 세트 활용 (Zap, Gift, Store, QrCode) |
| Admin enum | SCREAMING_SNAKE_CASE (`"ACTIVE"`, `"BASIC"`) — Spring Boot DTO 미러 |
| Front enum | lowercase (`"basic"`, `"premium"`) — 기존 front 패턴 유지 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-28 | Initial design | Development Team |
