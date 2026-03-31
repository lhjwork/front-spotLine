# Plan: QR Partner System — QR 파트너 등록, 관리, 매장 연동

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | QR 기반 매장 발견이 핵심 Pillar지만, 현재 파트너 매장 0개. QR 코드 생성/관리 UI 없고, 파트너 등록 플로우가 존재하지 않아 수익화 기반이 없다. |
| **Solution** | Admin에 파트너 등록 + QR 코드 관리 UI 구축. Front에 파트너 배지/혜택 표시 + QR 스캔 시 파트너 전용 경험 제공. 기존 QR 시스템(`/qr/[qrId]` → Spot 리다이렉트)을 파트너 확장형으로 업그레이드. |
| **Function UX Effect** | Admin: 매장 검색 → 파트너 등록 → QR 생성 → 인쇄용 다운로드. Front: QR 스캔 → 파트너 Spot 상세(배지+혜택 표시). Spot/Route에서 파트너 매장 시각적 구분. |
| **Core Value** | 콘텐츠(Spot/Route) → 트래픽 → 파트너 유치 → 수익화의 비즈니스 루프 완성. QR 스캔 데이터 = 파트너에게 제공할 핵심 가치 지표. |

| Item | Detail |
|------|--------|
| Feature | QR Partner System (Phase 8) |
| Created | 2026-03-28 |
| Status | Planning |
| Level | Dynamic |
| Depends On | Phase 5 (QR System Integration) — completed, Phase 3 (Spot/Route Pages) — completed |
| Cross-Repo | admin-spotLine + front-spotLine |

---

## 1. Background & Context

### 1.1 현재 상태 (AS-IS)

**QR 시스템 구현 완료 (Phase 5):**
- `/qr/[qrId]` — QR 스캔 진입점 (v2 우선, 레거시 fallback)
- `resolveQrToSpot(qrId)` — v2 API로 slug 조회 → `/spot/{slug}` 리다이렉트
- `getStoreIdByQR(qrId)` — 레거시 API, QR→Store ID 매핑
- `getStoreByQR(qrId)` — 레거시 매장 정보 조회
- QR 분석 로깅: `logPageEnter`, `logSpotClick`, `logMapLinkClick` 등

**타입 시스템에 파트너 구조 정의됨 (미사용):**
```typescript
interface SpotLineAffiliation {
  spotlineId: string;
  spotlineName: string;
  spotlineColor: string;   // 브랜딩 컬러
  isPartner: boolean;       // 공식 파트너 여부
  partnerSince?: string;
  qrCodeId?: string;
  curatorName?: string;
}
```
- `MockupSpot`에 `affiliations: SpotLineAffiliation[]` 필드 존재하나 목업 데이터에서만 사용

**Admin 어드민 현황:**
- 페이지: Dashboard, SpotCuration, SpotManagement, RouteBuilder, RouteManagement, Admins, Login
- **파트너 관리 UI 없음** — QR 생성, 파트너 등록, 파트너 분석 모두 미구현

**파트너 매장 현황: 0개**
- Cold Start 전략: 콘텐츠 + SEO 우선 → 트래픽 확보 후 파트너 영업
- 현재 200~300 Spot + 15~20 Route 목표 (크루 큐레이션)

### 1.2 Backend API 현황

**현재 QR 관련 v2 API:**
```
GET /api/v2/qr/{qrId}/spot        ← QR → Spot slug 매핑
GET /analytics/qr/{qrId}          ← QR별 분석 데이터
```

**Phase 8에 필요한 신규 API** (Backend 구현 필요):
```
POST   /api/v2/admin/partners                    ← 파트너 등록
GET    /api/v2/admin/partners                    ← 파트너 목록
GET    /api/v2/admin/partners/{id}               ← 파트너 상세
PATCH  /api/v2/admin/partners/{id}               ← 파트너 정보 수정
DELETE /api/v2/admin/partners/{id}               ← 파트너 해지
POST   /api/v2/admin/partners/{id}/qr-codes      ← QR 코드 생성
GET    /api/v2/admin/partners/{id}/qr-codes      ← 파트너의 QR 목록
GET    /api/v2/admin/partners/{id}/analytics      ← 파트너 분석
GET    /api/v2/spots/{slug}                      ← 파트너 배지 정보 포함 (기존 확장)
```

**전략**: Front는 기존 `SpotLineAffiliation` 구조를 활용하여 표시만 담당. Admin에서 파트너 CRUD + QR 관리.

---

## 2. Scope

### 2.1 In Scope

| # | Item | Repo | Description |
|---|------|------|-------------|
| 1 | **파트너 등록 페이지** | admin | Spot 검색 → 파트너 계약 정보 입력 → 등록 |
| 2 | **파트너 관리 목록** | admin | 전체 파트너 목록 + 상태 필터 (활성/일시정지/해지) |
| 3 | **QR 코드 생성/관리** | admin | 파트너별 QR 코드 생성 + 다운로드 (SVG/PNG) |
| 4 | **파트너 분석 대시보드** | admin | QR 스캔 수, 방문 전환율, 기간별 추이 |
| 5 | **파트너 배지 표시** | front | Spot 상세에서 "SpotLine 파트너" 배지 + 혜택 |
| 6 | **QR 스캔 파트너 경험** | front | 파트너 QR 스캔 시 전용 혜택/프로모션 표시 |
| 7 | **피드 파트너 하이라이트** | front | 피드/탐색에서 파트너 Spot 시각적 구분 |

### 2.2 Out of Scope

| Item | Reason |
|------|--------|
| 결제 시스템 (파트너 월정액/수수료) | 별도 Phase — 유저 기반 확보 후 |
| 파트너 셀프 서비스 포털 | v1은 Admin 크루가 직접 등록. 셀프 서비스는 추후 |
| 쿠폰/할인 코드 시스템 | 파트너 혜택은 텍스트 표시만 (v1). 쿠폰 발행은 추후 |
| 파트너 리뷰 관리 | 기존 Spot 리뷰와 통합, 별도 관리 불필요 |
| 다중 지점 매장 관리 | v1은 1파트너 = 1Spot. 체인점은 추후 |

---

## 3. Core Changes

### 3.1 파트너 등록 플로우 (Admin)

```
Admin 크루가 파트너 관리 페이지 진입
  → "파트너 등록" 클릭
  → Spot 검색 (기존 SpotCuration의 Place API 검색 활용)
  → 이미 DB에 있는 Spot 선택 (또는 신규 등록)
  → 파트너 정보 입력:
    - 계약 시작일
    - 브랜딩 컬러
    - 혜택 텍스트 (예: "QR 스캔 고객 10% 할인")
    - 파트너 등급 (basic / premium)
    - 메모
  → "등록" 확인
  → POST /api/v2/admin/partners
  → QR 코드 자동 생성 여부 확인
```

### 3.2 QR 코드 관리 플로우 (Admin)

```
파트너 상세 페이지
  → "QR 코드 관리" 탭
  → 기존 QR 코드 목록 (활성/비활성)
  → "새 QR 코드 생성" 클릭
    → 라벨 입력 (예: "정문", "카운터")
    → POST /api/v2/admin/partners/{id}/qr-codes
    → QR 코드 미리보기 (SVG)
    → 다운로드 (SVG/PNG, 인쇄용 A4)
```

### 3.3 파트너 QR 스캔 경험 (Front)

```
사용자가 파트너 매장의 QR 코드 스캔
  → /qr/[qrId] 진입
  → resolveQrToSpot(qrId) — 기존과 동일
  → /spot/[slug]?qr={qrId}&partner=true 리다이렉트
  → Spot 상세 페이지:
    - "SpotLine 파트너" 배지 표시 (브랜딩 컬러)
    - 파트너 혜택 섹션 표시 ("QR 스캔 고객 10% 할인")
    - crewNote 강조
  → QR 분석 로깅 (기존 + 파트너 전환 추적)
```

### 3.4 파트너 배지 표시 (Front)

```
Spot 상세 페이지 (/spot/[slug])
  → API 응답에 partner 정보 포함
  → SpotLineAffiliation.isPartner === true 이면:
    - 상단에 파트너 배지 (브랜딩 컬러 배경)
    - 혜택 카드 표시
    - 지도 마커에 파트너 아이콘

피드/탐색 페이지
  → Spot 카드에 작은 파트너 아이콘 (파트너 매장 구분)
  → 정렬 옵션: "파트너 매장 우선" (optional boost)
```

---

## 4. Data Flow

### 4.1 파트너 등록 (Admin → Backend)

```
Admin: PartnerRegistrationForm
  → POST /api/v2/admin/partners
    Body: {
      spotId: "spot-123",
      contractStartDate: "2026-04-01",
      brandColor: "#FF6B35",
      benefitText: "QR 스캔 고객 10% 할인",
      tier: "basic",
      note: "강남 카페"
    }
    Authorization: Bearer {adminToken}
  → Response: { partner: Partner, qrCodes: [] }
```

### 4.2 QR 스캔 → 파트너 Spot 표시 (Front)

```
/qr/[qrId] 진입
  → resolveQrToSpot(qrId) — slug 받음
  → /spot/[slug]?qr={qrId} 리다이렉트

/spot/[slug] 페이지 (SSR)
  → GET /api/v2/spots/{slug}
  → 응답에 partner 정보 포함:
    {
      ...spotData,
      partner: {
        isPartner: true,
        brandColor: "#FF6B35",
        benefitText: "QR 스캔 고객 10% 할인",
        tier: "basic",
        partnerSince: "2026-04-01"
      }
    }
  → SpotDetail 렌더링 시 파트너 배지 + 혜택 표시
```

### 4.3 파트너 분석 (Admin)

```
Admin: PartnerAnalytics 페이지
  → GET /api/v2/admin/partners/{id}/analytics?period=30d
  → Response: {
      qrScans: 1234,
      uniqueVisitors: 890,
      conversionRate: 0.72,
      dailyTrend: [...],
      topReferrers: [...]
    }
  → 차트 + 요약 카드 렌더링
```

---

## 5. New/Modified Components

### 5.1 Admin — New Pages

| Page | File | Description |
|------|------|-------------|
| 파트너 목록 | `admin-spotLine/src/pages/PartnerManagement.tsx` | 전체 파트너 목록 + 상태 필터 + 검색 |
| 파트너 등록 | `admin-spotLine/src/pages/PartnerRegistration.tsx` | Spot 검색 → 계약 정보 → 등록 |
| 파트너 상세 | `admin-spotLine/src/pages/PartnerDetail.tsx` | 파트너 정보 + QR 관리 + 분석 탭 |

### 5.2 Admin — New Components

| Component | File | Description |
|-----------|------|-------------|
| PartnerCard | `admin-spotLine/src/components/PartnerCard.tsx` | 파트너 목록 카드 (이름, Spot, 상태, QR 수) |
| PartnerForm | `admin-spotLine/src/components/PartnerForm.tsx` | 파트너 등록/수정 폼 |
| QRCodeManager | `admin-spotLine/src/components/QRCodeManager.tsx` | QR 코드 생성 + 목록 + 다운로드 |
| QRCodePreview | `admin-spotLine/src/components/QRCodePreview.tsx` | QR 코드 SVG 미리보기 + 다운로드 |
| PartnerAnalytics | `admin-spotLine/src/components/PartnerAnalytics.tsx` | 스캔 수, 전환율 차트 |

### 5.3 Admin — New Services

| File | Description |
|------|-------------|
| `admin-spotLine/src/services/partnerApi.ts` | 파트너 CRUD + QR 관리 API 함수 |

### 5.4 Front — New Components

| Component | File | Description |
|-----------|------|-------------|
| PartnerBadge | `front-spotLine/src/components/spot/PartnerBadge.tsx` | "SpotLine 파트너" 배지 (브랜딩 컬러) |
| PartnerBenefit | `front-spotLine/src/components/spot/PartnerBenefit.tsx` | 파트너 혜택 카드 (QR 스캔 시 표시) |

### 5.5 Front — Modified Components

| File | Change |
|------|--------|
| `front-spotLine/src/app/spot/[slug]/page.tsx` | 파트너 정보 조건부 렌더링 (PartnerBadge + PartnerBenefit) |
| `front-spotLine/src/app/qr/[qrId]/page.tsx` | 파트너 QR 시 `?partner=true` 쿼리 추가 (분석용) |
| `front-spotLine/src/components/spot/SpotCard.tsx` (또는 해당 카드) | 파트너 아이콘 표시 |
| `front-spotLine/src/types/index.ts` | `Partner`, `PartnerBenefit`, `QRCode` 타입 추가 |
| `front-spotLine/src/lib/api.ts` | 파트너 정보 포함 응답 처리 (기존 Spot API 확장) |

### 5.6 Preserved (No Change)

| File | Reason |
|------|--------|
| `resolveQrToSpot()` | QR → Spot 매핑 로직 변경 불필요, 파트너 정보는 Spot API에서 반환 |
| `getStoreByQR()`, `getStoreIdByQR()` | 레거시 호환 유지, 건드리지 않음 |
| QR 분석 로깅 함수들 | 기존 로깅 파라미터로 충분, Backend에서 파트너 여부 판별 |

---

## 6. New Types

### 6.1 Front (front-spotLine/src/types/index.ts)

```typescript
// 파트너 등급
type PartnerTier = "basic" | "premium";

// 파트너 상태
type PartnerStatus = "active" | "paused" | "terminated";

// Spot API 응답에 포함될 파트너 정보 (lightweight)
interface SpotPartnerInfo {
  isPartner: boolean;
  brandColor: string;
  benefitText: string | null;
  tier: PartnerTier;
  partnerSince: string;
}

// QR 코드 (Admin에서 주로 사용, Front는 참조용)
interface PartnerQRCode {
  id: string;
  qrId: string;           // 스캔 URL에 사용되는 고유 ID
  label: string;           // "정문", "카운터" 등
  isActive: boolean;
  createdAt: string;
  scansCount: number;
}
```

### 6.2 Admin (admin-spotLine/src/types/)

```typescript
// 파트너 전체 정보 (Admin 전용)
interface Partner {
  id: string;
  spotId: string;
  spotName: string;
  spotSlug: string;
  status: PartnerStatus;
  tier: PartnerTier;
  brandColor: string;
  benefitText: string | null;
  contractStartDate: string;
  contractEndDate: string | null;
  note: string;
  qrCodes: PartnerQRCode[];
  analytics: PartnerAnalyticsSummary;
  createdAt: string;
  updatedAt: string;
}

// 파트너 등록 요청
interface CreatePartnerRequest {
  spotId: string;
  contractStartDate: string;
  brandColor: string;
  benefitText?: string;
  tier: PartnerTier;
  note?: string;
}

// 파트너 분석 요약
interface PartnerAnalyticsSummary {
  totalScans: number;
  uniqueVisitors: number;
  conversionRate: number;
  lastScanAt: string | null;
}
```

---

## 7. File Structure

```
admin-spotLine/src/
├── pages/
│   ├── PartnerManagement.tsx     ← 신규: 파트너 목록
│   ├── PartnerRegistration.tsx   ← 신규: 파트너 등록
│   └── PartnerDetail.tsx         ← 신규: 파트너 상세 (QR + 분석)
│
├── components/
│   ├── PartnerCard.tsx           ← 신규: 파트너 카드
│   ├── PartnerForm.tsx           ← 신규: 파트너 등록/수정 폼
│   ├── QRCodeManager.tsx         ← 신규: QR 코드 관리
│   ├── QRCodePreview.tsx         ← 신규: QR 미리보기 + 다운로드
│   └── PartnerAnalytics.tsx      ← 신규: 분석 차트
│
├── services/
│   └── partnerApi.ts             ← 신규: 파트너 API 함수
│
└── types/
    └── partner.ts                ← 신규: 파트너 타입 정의

front-spotLine/src/
├── components/
│   └── spot/
│       ├── PartnerBadge.tsx      ← 신규: 파트너 배지
│       └── PartnerBenefit.tsx    ← 신규: 파트너 혜택 카드
│
├── app/
│   ├── spot/[slug]/page.tsx      ← 수정: 파트너 정보 표시
│   └── qr/[qrId]/page.tsx       ← 수정: 파트너 쿼리 파라미터
│
├── types/
│   └── index.ts                  ← 수정: SpotPartnerInfo 등 추가
│
└── lib/
    └── api.ts                    ← 수정: Spot 응답에서 파트너 파싱
```

**총 예상 파일**: Admin 신규 9개, Front 신규 2개 + 수정 4개 = **15개**

---

## 8. Implementation Order

| Step | Repo | Files | Description |
|------|------|-------|-------------|
| **Step 1** | front | `types/index.ts` | `SpotPartnerInfo`, `PartnerTier`, `PartnerQRCode` 타입 추가 |
| **Step 2** | admin | `types/partner.ts`, `services/partnerApi.ts` | Admin 타입 + API 함수 |
| **Step 3** | admin | `PartnerCard.tsx`, `PartnerManagement.tsx` | 파트너 목록 페이지 |
| **Step 4** | admin | `PartnerForm.tsx`, `PartnerRegistration.tsx` | 파트너 등록 페이지 |
| **Step 5** | admin | `QRCodePreview.tsx`, `QRCodeManager.tsx`, `PartnerDetail.tsx` | QR 관리 + 파트너 상세 |
| **Step 6** | admin | `PartnerAnalytics.tsx` | 파트너 분석 대시보드 |
| **Step 7** | front | `PartnerBadge.tsx`, `PartnerBenefit.tsx` | 파트너 UI 컴포넌트 |
| **Step 8** | front | `spot/[slug]/page.tsx`, `api.ts` | Spot 상세에 파트너 정보 연동 |
| **Step 9** | front | `qr/[qrId]/page.tsx`, SpotCard | QR 파트너 경험 + 피드 하이라이트 |

---

## 9. API Functions

### 9.1 Admin API (`admin-spotLine/src/services/partnerApi.ts`)

```typescript
// 파트너 등록
createPartner(data: CreatePartnerRequest): Promise<Partner>

// 파트너 목록
fetchPartners(status?: PartnerStatus, page?: number): Promise<{ items: Partner[]; total: number }>

// 파트너 상세
fetchPartner(partnerId: string): Promise<Partner>

// 파트너 수정
updatePartner(partnerId: string, data: Partial<CreatePartnerRequest>): Promise<Partner>

// 파트너 해지
terminatePartner(partnerId: string): Promise<void>

// QR 코드 생성
createQRCode(partnerId: string, label: string): Promise<PartnerQRCode>

// QR 코드 목록
fetchQRCodes(partnerId: string): Promise<PartnerQRCode[]>

// QR 코드 비활성화
deactivateQRCode(partnerId: string, qrCodeId: string): Promise<void>

// 파트너 분석
fetchPartnerAnalytics(partnerId: string, period?: string): Promise<PartnerAnalyticsDetail>
```

### 9.2 Front API (기존 api.ts 확장)

```typescript
// 기존 Spot API 응답에서 partner 정보 파싱 (별도 함수 불필요)
// GET /api/v2/spots/{slug} 응답에 partner?: SpotPartnerInfo 포함
```

**인증 헤더**: Admin API는 `Authorization: Bearer {adminToken}` 필요.

**에러 처리**:
- Admin: 표준 에러 토스트 (등록 실패, 네트워크 오류)
- Front: `partner` 필드 없으면 배지 미표시 (graceful — `partner?.isPartner && ...`)

---

## 10. UI/UX Specifications

### 10.1 파트너 목록 (Admin)

```
┌────────────────────────────────────────────┐
│  파트너 관리                    [+ 등록]    │
├────────────────────────────────────────────┤
│  [전체 (12)] [활성 (8)] [일시정지 (3)] [해지 (1)]  │
├────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐  │
│  │ ● 카페 소나무                 활성    │  │
│  │   강남구 역삼동 · QR 3개             │  │
│  │   스캔 1,234회 · 전환 72%           │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │ ● 레스토랑 달빛                활성   │  │
│  │   ...                                │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

### 10.2 QR 코드 관리 (Admin)

```
┌────────────────────────────────────────────┐
│  QR 코드 관리                [+ 새 QR]     │
├────────────────────────────────────────────┤
│  ┌─────────┐  정문 QR                     │
│  │ [QR코드] │  qr-cafe-sonamu-001          │
│  │ 미리보기 │  스캔 890회 · 활성            │
│  └─────────┘  [SVG 다운로드] [PNG 다운로드] │
│                                            │
│  ┌─────────┐  카운터 QR                    │
│  │ [QR코드] │  qr-cafe-sonamu-002          │
│  │ 미리보기 │  스캔 344회 · 활성            │
│  └─────────┘  [SVG 다운로드] [PNG 다운로드] │
└────────────────────────────────────────────┘
```

### 10.3 파트너 배지 (Front — Spot 상세)

```
┌────────────────────────────────────────────┐
│  [Spot 이미지]                             │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │ ★ SpotLine 파트너         since 2026 │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  카페 소나무                               │
│  강남구 역삼동 · 카페                       │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │ 🎁 QR 스캔 고객 혜택                  │  │
│  │    10% 할인 (매장 직원에게 화면 제시)   │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

### 10.4 피드 파트너 하이라이트 (Front)

```
┌────────────────────────────────────────────┐
│  [Spot 이미지]       ★ 파트너              │
│  카페 소나무                               │
│  강남구 역삼동 · ☕ 카페                    │
│  ♡ 23  💬 5                               │
└────────────────────────────────────────────┘
```

---

## 11. Discussion Points

### 11.1 QR 코드 생성 라이브러리

- **옵션 A**: `qrcode.react` — React 컴포넌트, Admin에서 SVG 렌더링 + 다운로드
- **옵션 B**: Backend에서 생성 후 이미지 URL 반환
- **결정**: 옵션 A — Admin에서 클라이언트 사이드 생성. QR URL만 Backend에서 발급.

### 11.2 파트너 정보 전달 방식

- Spot API 응답에 `partner?: SpotPartnerInfo` 필드를 optional로 추가
- 파트너가 아닌 Spot은 `partner` 필드 없음 (null이 아닌 부재)
- Front는 `spot.partner?.isPartner && <PartnerBadge />` 패턴

### 11.3 QR 스캔 시 파트너 구분

- `resolveQrToSpot()` 응답에 `isPartner: boolean` 추가 가능
- 또는 `/spot/[slug]` 렌더링 시 Spot API 응답에서 판단 (현재 접근)
- **결정**: Spot API 응답에서 판단. QR resolve 단계에서는 빠른 리다이렉트 우선.

### 11.4 Admin 라우팅

- admin-spotLine은 React + React Router (Vite 기반)
- 새 라우트: `/partners`, `/partners/new`, `/partners/:id`
- App.tsx에 라우트 추가 필요

### 11.5 QR 코드 URL 형식

- 현재: `https://spotline.kr/qr/{qrId}` → 그대로 유지
- 파트너 QR의 `qrId` 형식: `partner-{spotSlug}-{seq}` (예: `partner-cafe-sonamu-001`)
- Backend에서 QR ID 발급, Front는 기존 `/qr/[qrId]` 플로우 그대로 사용

### 11.6 Backend API 미구현 전략

- Admin: 파트너 관리는 Backend API 필수 — 목업 데이터로 UI 먼저 구축
- Front: Spot API 응답에 `partner` 필드 없으면 배지 미표시 (zero-config fallback)
- QR 코드 생성: 클라이언트에서 URL 기반 QR 이미지 생성, ID만 Backend 발급

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-28 | Initial draft | Development Team |
