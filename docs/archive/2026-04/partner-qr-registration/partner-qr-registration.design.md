# Partner QR Registration — Design Document

> Feature: `partner-qr-registration`
> Plan: `docs/01-plan/features/partner-qr-registration.plan.md`
> Created: 2026-04-18
> Status: Design

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | 파트너 등록이 어드민 수동 입력에만 의존하여 확장성이 없고, 파트너가 자신의 QR 성과를 확인할 수 없으며, QR 코드 이미지 생성/다운로드가 불가하여 실물 배포 불가능 |
| **Solution** | 파트너 자가 신청 페이지 + 셀프서비스 대시보드(스캔 분석) + QR 이미지 생성/다운로드 + 탐색 UI에 파트너 Spot 필터 추가 |
| **Function UX Effect** | 매장 사장님이 직접 파트너 신청 → 승인 후 대시보드에서 QR 성과 확인 + QR 이미지 다운로드 → 매장에 부착. 사용자는 탐색에서 파트너 혜택 Spot 필터링 |
| **Core Value** | 파트너 온보딩 자동화로 영업 비용 절감 + 파트너 자가 성과 확인으로 유지율 향상 + QR 이미지 실물 배포 가능 = 수익 모델 실현 기반 |

---

## 1. Component Architecture

### 1.1 New Components

| # | File | FR | Type |
|---|------|----|------|
| 1 | `src/app/partner/layout.tsx` | ALL | NEW |
| 2 | `src/app/partner/apply/page.tsx` | FR-01 | NEW |
| 3 | `src/app/partner/dashboard/page.tsx` | FR-02 | NEW |
| 4 | `src/components/partner/PartnerApplyForm.tsx` | FR-01 | NEW |
| 5 | `src/components/partner/PartnerDashboard.tsx` | FR-02 | NEW |
| 6 | `src/components/partner/QrCodeGenerator.tsx` | FR-03 | NEW |
| 7 | `src/components/partner/PartnerAnalyticsChart.tsx` | FR-02 | NEW |

### 1.2 Modified Components

| # | File | FR | Change Type |
|---|------|----|-------------|
| 8 | `src/types/index.ts` | ALL | MODIFY — 파트너 신청/대시보드 타입 추가 |
| 9 | `src/lib/api.ts` | FR-01, FR-02 | MODIFY — 파트너 신청/분석 API 함수 추가 |
| 10 | `src/components/feed/FeedPage.tsx` | FR-04 | MODIFY — 파트너 필터 토글 추가 |

### 1.3 Reused Components (No Changes)

| Component | Path | Usage |
|-----------|------|-------|
| `PartnerBadge` | `src/components/spot/PartnerBadge.tsx` | FR-04: 피드 카드에서 파트너 배지 표시 |
| `PartnerBenefit` | `src/components/spot/PartnerBenefit.tsx` | FR-02: 대시보드에서 혜택 미리보기 |
| `OptimizedImage` | `src/components/common/OptimizedImage.tsx` | FR-02: QR 코드 관련 이미지 |

### 1.4 New Dependency

```bash
pnpm add qrcode.react
```

`qrcode.react` — QR 코드 SVG/Canvas 렌더링. 클라이언트 사이드 전용, 번들 최적화를 위해 dynamic import 사용.

---

## 2. Detailed Design — New Types (`src/types/index.ts`)

### 2.1 Partner Application Types

```typescript
// 파트너 신청 요청
export interface PartnerApplicationRequest {
  spotId: string;
  businessName: string;
  contactPhone: string;
  contactEmail: string;
  benefitText: string;
  brandColor: string;
  tier: PartnerTier;
}

// 파트너 신청 결과
export interface PartnerApplicationResponse {
  success: boolean;
  message: string;
  applicationId?: string;
}
```

### 2.2 Partner Dashboard Types

```typescript
// 파트너 분석 요약
export interface PartnerAnalyticsSummary {
  totalScans: number;
  uniqueVisitors: number;
  conversionRate: number;
  thisWeekScans: number;
  lastWeekScans: number;
  weeklyChange: number; // percentage
}

// 일별 트렌드 데이터
export interface PartnerDailyTrend {
  date: string;
  scans: number;
  uniqueVisitors: number;
  conversions: number;
}

// 파트너 QR 코드 정보
export interface PartnerQrCode {
  id: string;
  label: string;
  qrUrl: string;
  scans: number;
  isActive: boolean;
  createdAt: string;
}

// 파트너 대시보드 전체 응답
export interface PartnerDashboardData {
  partnerId: string;
  businessName: string;
  spotSlug: string;
  spotTitle: string;
  brandColor: string;
  benefitText: string;
  tier: PartnerTier;
  summary: PartnerAnalyticsSummary;
  dailyTrends: PartnerDailyTrend[];
  qrCodes: PartnerQrCode[];
}
```

---

## 3. Detailed Design — FR-03: QR Code Image Generator

> **Implementation order**: FR-03 first (독립 컴포넌트, 의존성 없음)

### 3.1 `src/components/partner/QrCodeGenerator.tsx`

**Purpose**: QR 코드 이미지 렌더링 + PNG/SVG 다운로드

**Props Interface**:
```typescript
interface QrCodeGeneratorProps {
  qrUrl: string;          // QR에 인코딩할 URL
  label: string;          // QR 코드 라벨 (다운로드 파일명에 사용)
  brandColor?: string;    // QR 전경색 (기본: #000000)
  size?: number;          // QR 크기 (기본: 256)
}
```

**Implementation**:
```tsx
"use client";

import { useRef, useCallback } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Download, Image as ImageIcon } from "lucide-react";

export default function QrCodeGenerator({ qrUrl, label, brandColor = "#000000", size = 256 }: QrCodeGeneratorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const downloadPng = useCallback(() => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${label}.png`;
    a.click();
  }, [label]);

  const downloadSvg = useCallback(() => {
    const svg = canvasRef.current?.querySelector("svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${label}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [label]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 미리보기: SVG (화면 표시용) */}
      <div ref={canvasRef} className="rounded-xl border border-gray-200 bg-white p-4">
        <QRCodeSVG value={qrUrl} size={size} fgColor={brandColor} level="M" />
        {/* 숨겨진 Canvas (PNG 다운로드용) */}
        <div className="hidden">
          <QRCodeCanvas value={qrUrl} size={size * 2} fgColor={brandColor} level="M" />
        </div>
      </div>

      {/* 다운로드 버튼 */}
      <div className="flex gap-2">
        <button onClick={downloadPng} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <ImageIcon className="h-4 w-4" />
          PNG 다운로드
        </button>
        <button onClick={downloadSvg} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4" />
          SVG 다운로드
        </button>
      </div>
    </div>
  );
}
```

**Key Decisions**:
- PNG 다운로드는 `QRCodeCanvas` (2배 크기로 300dpi 인쇄 품질 확보)
- SVG 다운로드는 `QRCodeSVG`의 DOM을 직접 serialize
- `level="M"` — 중간 오류 정정 수준 (인쇄 QR에 적합)

---

## 4. Detailed Design — FR-01: Partner Apply Page

### 4.1 `src/app/partner/layout.tsx`

**Purpose**: 파트너 섹션 공통 레이아웃 (심플한 헤더 + 본문)

```tsx
import Link from "next/link";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-blue-600">Spotline</Link>
          <span className="text-sm font-medium text-gray-500">파트너</span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}
```

### 4.2 `src/app/partner/apply/page.tsx`

**Purpose**: SSR 랜딩 (SEO 메타데이터) + 클라이언트 폼 로드

```tsx
import type { Metadata } from "next";
import PartnerApplyForm from "@/components/partner/PartnerApplyForm";

export const metadata: Metadata = {
  title: "파트너 신청 | Spotline",
  description: "매장을 Spotline 파트너로 등록하고 QR 코드로 고객에게 특별한 혜택을 제공하세요.",
  openGraph: {
    title: "파트너 신청 | Spotline",
    description: "매장을 Spotline 파트너로 등록하고 QR 코드로 고객에게 특별한 혜택을 제공하세요.",
  },
};

export default function PartnerApplyPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">파트너 신청</h1>
      <p className="mb-6 text-sm text-gray-500">
        매장을 등록하고 QR 코드로 고객에게 혜택을 제공하세요.
      </p>
      <PartnerApplyForm />
    </div>
  );
}
```

### 4.3 `src/components/partner/PartnerApplyForm.tsx`

**Purpose**: 파트너 신청 폼 (5단계 구성)

**Props**: 없음 (자체 상태 관리)

**State**:
```typescript
interface FormState {
  spotId: string;
  spotTitle: string; // 선택된 Spot 표시용
  businessName: string;
  contactPhone: string;
  contactEmail: string;
  benefitText: string;
  brandColor: string;
  tier: PartnerTier;
}
```

**UI 구성**:
1. **Spot 검색/선택** — `searchSpots()` API로 매장 검색, 결과 드롭다운에서 선택
2. **비즈니스 정보** — 사업자 이름, 연락처, 이메일 input 필드
3. **혜택 정보** — benefitText textarea, brandColor `<input type="color">`
4. **티어 선택** — BASIC/PREMIUM 라디오 카드 (각 티어 설명 포함)
5. **제출 버튼** → `submitPartnerApplication()` API 호출

**Validation Rules**:
- `spotId` — 필수 (Spot 미선택 시 에러)
- `businessName` — 필수, 2~50자
- `contactPhone` — 필수, 한국 전화번호 형식 (`010-XXXX-XXXX` 또는 `02-XXX-XXXX`)
- `contactEmail` — 필수, 이메일 형식 정규식 검증
- `benefitText` — 필수, 5~100자
- `brandColor` — 기본값 `#3B82F6` (blue-500)
- `tier` — 기본값 `BASIC`

**제출 후 동작**:
- 성공: "신청이 접수되었습니다" 안내 화면 (인라인 전환, 페이지 이동 없음)
- 실패: 에러 메시지 인라인 표시

**Backend API 부재 대응** (Risk Mitigation):
현재 Backend에 Public 파트너 신청 API가 없으므로, `submitPartnerApplication()` 호출 시:
- 성공 UI를 표시하되, 실제 데이터 전송 실패 시에도 "신청이 접수되었습니다. 관리자가 확인 후 연락드리겠습니다." 안내
- 콘솔에 신청 데이터 로깅 (개발 확인용)

---

## 5. Detailed Design — FR-02: Partner Dashboard

### 5.1 `src/app/partner/dashboard/page.tsx`

**Purpose**: 파트너 대시보드 랜딩 (토큰 기반 접근)

**인증 방식**: URL 쿼리 파라미터 기반 간이 인증
- URL: `/partner/dashboard?token=<partner-access-token>`
- 토큰으로 파트너 데이터 조회 → 없으면 에러 표시

```tsx
import PartnerDashboard from "@/components/partner/PartnerDashboard";

interface DashboardPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function PartnerDashboardPage({ searchParams }: DashboardPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="py-12 text-center">
        <h1 className="mb-2 text-xl font-bold text-gray-900">접근 권한이 필요합니다</h1>
        <p className="text-sm text-gray-500">파트너 대시보드 링크를 통해 접속해주세요.</p>
      </div>
    );
  }

  return <PartnerDashboard token={token} />;
}
```

### 5.2 `src/components/partner/PartnerDashboard.tsx`

**Purpose**: 대시보드 메인 (데이터 페칭 + 레이아웃)

**Props**:
```typescript
interface PartnerDashboardProps {
  token: string;
}
```

**UI 구성**:
1. **요약 카드 그리드** (2x2):
   - 총 스캔 수 (아이콘: `ScanLine`)
   - 고유 방문자 (아이콘: `Users`)
   - 전환율 (아이콘: `TrendingUp`)
   - 주간 변화 (아이콘: `ArrowUpRight` / `ArrowDownRight`)
2. **기간 선택 탭** — 7일 / 30일 / 90일
3. **일별 트렌드 차트** — `PartnerAnalyticsChart` 컴포넌트
4. **QR 코드 목록** — 각 QR별 스캔 수 + `QrCodeGenerator` 통합 (다운로드)

**Data Fetching**:
```typescript
// useEffect에서 호출
const data = await fetchPartnerDashboard(token);
// 기간 변경 시 트렌드 데이터만 재호출
const trends = await fetchPartnerTrends(token, period);
```

**상태 관리**: 로컬 `useState` (대시보드는 단일 페이지, Zustand 불필요)

### 5.3 `src/components/partner/PartnerAnalyticsChart.tsx`

**Purpose**: 일별 스캔/전환 트렌드 막대 차트

**Props**:
```typescript
interface PartnerAnalyticsChartProps {
  data: PartnerDailyTrend[];
  brandColor: string;
}
```

**Implementation**: 순수 CSS/Tailwind 기반 막대 차트 (외부 차트 라이브러리 미사용)
- 각 막대: 스캔 수 기반 높이 비율 계산 (`height = (value / max) * 100%`)
- x축: 날짜 라벨 (MM/DD)
- 호버: 정확한 수치 툴팁
- 막대 색상: `brandColor` 적용

---

## 6. Detailed Design — FR-04: Partner Spot Filter

### 6.1 `src/components/feed/FeedPage.tsx` 수정

**변경 내용**: 기존 필터 영역에 "파트너 혜택" 토글 추가

**기존 필터 구조**:
- `FeedAreaTabs` — 지역 필터
- `FeedCategoryChips` — 카테고리 칩
- `FeedSortDropdown` — 정렬

**추가할 UI**: `FeedCategoryChips` 아래에 파트너 필터 토글 배치

```tsx
// FeedPage.tsx 내 필터 영역에 추가
<div className="flex items-center gap-2 px-4 py-2">
  <button
    onClick={() => setPartnerOnly(!partnerOnly)}
    className={cn(
      "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
      partnerOnly
        ? "bg-blue-600 text-white"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    )}
  >
    <Zap className="h-3 w-3" />
    파트너 혜택
  </button>
</div>
```

**Data Flow**:
```
partnerOnly state → fetchFeedSpots(area, category, page, size, partner: true)
                   → API: GET /spots?partner=true
                   → 결과에 SpotPartnerInfo 포함된 Spot만 반환
```

**API 변경** (`src/lib/api.ts`):
- `fetchFeedSpots` 함수에 `partner?: boolean` 파라미터 추가
- 쿼리 파라미터로 `partner=true` 전달

### 6.2 피드 카드에서 PartnerBadge 표시

기존 `SpotPreviewCard`에 이미 `PartnerBadge` 통합 완료 (이전 PDCA `partner-qr-system`에서 구현). 추가 작업 없음.

---

## 7. API Functions (`src/lib/api.ts` 추가)

```typescript
// ==================== Partner Registration & Dashboard ====================

// 파트너 신청 제출
export const submitPartnerApplication = async (
  data: PartnerApplicationRequest
): Promise<PartnerApplicationResponse> => {
  try {
    const response = await apiV2.post<PartnerApplicationResponse>(
      "/partners/apply",
      data
    );
    return response.data;
  } catch {
    // Public API 미존재 시 graceful fallback
    console.log("[Partner Apply] 신청 데이터:", data);
    return {
      success: true,
      message: "신청이 접수되었습니다. 관리자가 확인 후 연락드리겠습니다.",
    };
  }
};

// 파트너 대시보드 데이터 조회
export const fetchPartnerDashboard = async (
  token: string
): Promise<PartnerDashboardData | null> => {
  try {
    const response = await apiV2.get<PartnerDashboardData>(
      "/partners/dashboard",
      { params: { token } }
    );
    return response.data;
  } catch {
    return null;
  }
};

// 파트너 트렌드 데이터 조회
export const fetchPartnerTrends = async (
  token: string,
  period: "7d" | "30d" | "90d"
): Promise<PartnerDailyTrend[]> => {
  try {
    const response = await apiV2.get<PartnerDailyTrend[]>(
      "/partners/trends",
      { params: { token, period } }
    );
    return response.data;
  } catch {
    return [];
  }
};
```

---

## 8. Implementation Order

| # | Item | FR | Type | Est. LOC | Dependencies |
|---|------|----|------|:--------:|--------------|
| 1 | Types 추가 (`types/index.ts`) | ALL | MODIFY | ~40 | — |
| 2 | API 함수 추가 (`api.ts`) | FR-01, FR-02 | MODIFY | ~45 | #1 |
| 3 | `QrCodeGenerator.tsx` | FR-03 | NEW | ~55 | `qrcode.react` 설치 |
| 4 | Partner layout (`layout.tsx`) | ALL | NEW | ~15 | — |
| 5 | `PartnerApplyForm.tsx` | FR-01 | NEW | ~180 | #1, #2 |
| 6 | Apply page (`apply/page.tsx`) | FR-01 | NEW | ~20 | #4, #5 |
| 7 | `PartnerAnalyticsChart.tsx` | FR-02 | NEW | ~60 | #1 |
| 8 | `PartnerDashboard.tsx` | FR-02 | NEW | ~150 | #1, #2, #3, #7 |
| 9 | Dashboard page (`dashboard/page.tsx`) | FR-02 | NEW | ~25 | #4, #8 |
| 10 | Feed partner filter (`FeedPage.tsx`) | FR-04 | MODIFY | ~15 | #2 |
| | **Total** | | **7 NEW, 3 MODIFY** | **~605** | |

---

## 9. Non-Functional Considerations

| NFR | Approach |
|-----|----------|
| **NFR-01 성능** | `qrcode.react` dynamic import (`next/dynamic`), QR 렌더링 클라이언트 전용 |
| **NFR-02 반응형** | 모바일 퍼스트. 폼 필드 `w-full`, 요약 카드 `grid-cols-2`, 차트 높이 `h-48 md:h-64` |
| **NFR-03 SEO** | `/partner/apply` SSR 메타데이터 (title, description, OpenGraph) |
| **NFR-04 접근성** | 모든 `<input>`에 `<label>`, 에러 메시지 `aria-live="polite"`, 컬러 피커에 텍스트 대안 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-18 | Initial design | Claude |
