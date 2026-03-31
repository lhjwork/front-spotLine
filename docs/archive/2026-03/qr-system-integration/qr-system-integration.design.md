# Design: QR System Integration

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | QR Discovery(`/spotline/[qrId]`)가 레거시 API를 사용하며 Phase 3~4의 Spot/Route/Feed 콘텐츠와 완전 분리 |
| **Solution** | QR 진입 → `/spot/[slug]?qr=[qrId]` 리다이렉트, QR 배너+분석 컴포넌트로 QR 모드 지원 |
| **Function UX Effect** | QR 사용자가 crewNote, Place API 정보, Route, 주변 Spot을 한 페이지에서 확인하고 Feed로 자연 이동 |
| **Core Value** | QR→Spot→Route→Feed 연결로 체류 시간 극대화, 레거시/v2 fallback 구조로 점진적 마이그레이션 |

| Item | Detail |
|------|--------|
| Feature | QR System Integration (Phase 5) |
| Created | 2026-03-27 |
| Plan Doc | `docs/01-plan/features/qr-system-integration.plan.md` |
| Total Files | 7 (New 3 + Modified 4) |

---

## 1. Implementation Checklist

| # | Type | File | Description |
|---|------|------|-------------|
| 1 | MOD | `src/lib/api.ts` | `resolveQrToSpot()` — QR ID → Spot slug 조회 (v2 우선, 레거시 fallback) |
| 2 | NEW | `src/components/qr/QrBanner.tsx` | QR 진입 배너 — "QR 코드로 방문하셨습니다" 안내 |
| 3 | NEW | `src/components/qr/QrAnalytics.tsx` | QR 분석 이벤트 — 페이지 진입 로깅 + 이탈 시 체류 시간 (invisible) |
| 4 | NEW | `src/components/shared/AreaCta.tsx` | "이 지역 더 보기" CTA → `/feed?area={area}` |
| 5 | MOD | `src/app/spot/[slug]/page.tsx` | QR 쿼리파라미터 감지 → QrBanner + QrAnalytics + AreaCta 렌더링 |
| 6 | MOD | `src/app/qr/[qrId]/page.tsx` | v2 기반 리다이렉트 (`resolveQrToSpot` 사용) |
| 7 | MOD | `src/app/spotline/[qrId]/page.tsx` | 301 영구 리다이렉트 → `/spot/[slug]` |

---

## 2. Detailed Specifications

### 2.1 `src/lib/api.ts` — `resolveQrToSpot()` 추가

**목적**: QR ID → Spot slug 매핑을 v2 API 우선, 레거시 fallback으로 조회.

```typescript
// 반환 타입
interface QrSpotResolution {
  slug: string;
  spotId: string;
  source: "v2" | "legacy";
}

// 함수 시그니처
export const resolveQrToSpot = async (
  qrId: string
): Promise<QrSpotResolution | null>
```

**로직 흐름**:
1. `GET /api/v2/qr/${qrId}/spot` 시도 → 성공 시 `{ slug, spotId, source: "v2" }` 반환
2. v2 실패(404/네트워크 오류) → 레거시 `getStoreIdByQR(qrId)` 호출
3. 레거시 성공 시 storeId를 slug로 사용: `{ slug: storeId, spotId: storeId, source: "legacy" }`
4. 모두 실패 → `null` 반환

**구현 세부**:
- v2 API 호출은 `apiV2` axios 인스턴스 사용 (기존 패턴)
- 타임아웃: 3초 (빠른 fallback을 위해)
- 레거시 fallback에서 slug = storeId인 이유: v2 DB에 QR 매핑이 없으면 레거시 storeId가 유일한 식별자이므로, `/spotline/[storeId]`로 최종 fallback 가능
- `null` 반환 시 호출자가 에러 처리

**위치**: 기존 `getStoreIdByQR` 함수 바로 아래 (line ~480 부근)

---

### 2.2 `src/components/qr/QrBanner.tsx` — QR 진입 배너

**목적**: QR 스캔으로 진입한 사용자에게 안내 배너 표시.

```typescript
"use client";

interface QrBannerProps {
  storeName: string;
}
```

**렌더링 조건**: `searchParams`에 `qr` 파라미터가 존재할 때만 표시 (부모에서 제어).

**UI 스펙**:
- 배경: `bg-green-50 border border-green-200 rounded-xl`
- 아이콘: 📍 (기존 SpotLine 페이지 패턴 계승)
- 텍스트: `"현재 방문 중인 매장 — QR 코드로 접속하셨습니다"` (기존 `/spotline/[qrId]` 배너와 동일)
- 폰트: `text-sm text-green-800`, 강조: `font-semibold`
- 패딩: `px-4 py-3`

**`"use client"` 필요 여부**: 없음 — 순수 표시 컴포넌트이지만, `useSearchParams` 사용 시 필요. 부모에서 qrId를 props로 전달하면 서버 컴포넌트로 작성 가능. → **서버 컴포넌트로 작성** (props로 `storeName` 수신).

---

### 2.3 `src/components/qr/QrAnalytics.tsx` — QR 분석 이벤트

**목적**: QR 진입 시 분석 이벤트를 자동 로깅하는 invisible 클라이언트 컴포넌트.

```typescript
"use client";

interface QrAnalyticsProps {
  spotId: string;
  qrId: string;
}
```

**동작**:
1. **마운트 시**: `logPageEnter(spotId, qrId)` 호출 (기존 함수 재활용)
2. **언마운트/이탈 시**: `beforeunload` 이벤트로 체류 시간 계산, `console.log`로 기록 (기존 레거시 패턴)
3. **렌더링**: `null` 반환 (invisible)

**기존 함수 재활용**:
- `logPageEnter(storeId, qrId)` — `POST /api/analytics/spotline-event` (line 709)
- storeId 파라미터에 spotId 전달 (향후 v2 마이그레이션 시 엔드포인트만 변경)

**주의**: fire-and-forget 패턴 유지. 분석 실패가 사용자 경험에 영향 없음.

---

### 2.4 `src/components/shared/AreaCta.tsx` — 지역 더 보기 CTA

**목적**: Spot 상세 페이지 하단에 "이 지역 더 보기" 링크 제공.

```typescript
import Link from "next/link";

interface AreaCtaProps {
  area: string;
  areaLabel?: string; // 표시용 이름 (예: "성수/건대")
}
```

**UI 스펙**:
- 기존 DiscoverPage의 "모든 Route 보기 →" 버튼과 동일한 스타일:
  - `block w-full rounded-xl border border-gray-200 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50`
- 텍스트: `"{areaLabel || area} 지역 더 보기 →"`
- 링크: `/feed?area=${area}`

**서버 컴포넌트로 작성** — Link만 사용, 인터랙션 없음.

---

### 2.5 `src/app/spot/[slug]/page.tsx` — QR 모드 지원

**현재 구조** (Server Component):
- `generateMetadata` → `fetchSpotDetail`
- `SpotPage` → `fetchSpotDetail` + `fetchSpotRoutes` + `fetchNearbySpots`
- 렌더링: `SpotHero` → `SpotCrewNote` → `SpotPlaceInfo` → `SpotImageGallery` → `SpotRoutes` → `SpotNearby` → `SpotBottomBar`

**변경 사항**:

1. **Props에 `searchParams` 추가**:
```typescript
interface SpotPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ qr?: string }>;
}
```

2. **QR 파라미터 추출**:
```typescript
const { qr: qrId } = await searchParams;
const isQrMode = !!qrId;
```

3. **조건부 컴포넌트 렌더링** (SpotHero 아래, SpotCrewNote 위):
```tsx
{isQrMode && (
  <>
    <QrBanner storeName={spot.title} />
    <QrAnalytics spotId={spot.id} qrId={qrId!} />
  </>
)}
```

4. **AreaCta 추가** (SpotNearby 아래, SpotBottomBar 위):
```tsx
{isQrMode && spot.area && (
  <AreaCta area={spot.area} />
)}
```

5. **임포트 추가**:
```typescript
import QrBanner from "@/components/qr/QrBanner";
import QrAnalytics from "@/components/qr/QrAnalytics";
import AreaCta from "@/components/shared/AreaCta";
```

**SSR 영향**: QrBanner, AreaCta는 서버 컴포넌트이므로 SSR 성능 영향 없음. QrAnalytics만 `"use client"`이지만 렌더링 없음(null).

---

### 2.6 `src/app/qr/[qrId]/page.tsx` — v2 기반 리다이렉트

**현재 구조**: `"use client"`, `useEffect`에서 `getStoreIdByQR` → `router.replace`.

**변경 사항**:

1. **`getStoreIdByQR` → `resolveQrToSpot` 교체**:
```typescript
import { resolveQrToSpot } from "@/lib/api";
```

2. **리다이렉트 로직 변경**:
```typescript
useEffect(() => {
  const handleQRScan = async () => {
    if (!qrId) return;

    // 데모 QR 코드 처리 (기존 유지)
    if (qrId === "demo_cafe_001") {
      router.replace(`/spotline/demo-store?qr=${qrId}`);
      return;
    }

    try {
      const result = await resolveQrToSpot(qrId);

      if (result) {
        if (result.source === "v2") {
          // v2 성공: 새 Spot 페이지로 이동
          router.replace(`/spot/${result.slug}?qr=${qrId}`);
        } else {
          // 레거시 fallback: storeId 기반으로 이동
          // v2 Spot이 없으므로 기존 SpotLine 페이지 사용
          router.replace(`/spotline/${result.spotId}?qr=${qrId}`);
        }
      } else {
        setError("등록되지 않은 QR 코드입니다");
      }
    } catch (err) {
      console.error("QR 코드 처리 실패:", err);
      setError(err instanceof Error ? err.message : "QR 코드를 처리할 수 없습니다");
    }
  };

  handleQRScan();
}, [qrId, router]);
```

**핵심**: v2에서 slug를 받으면 `/spot/[slug]`로, 레거시에서 storeId만 받으면 `/spotline/[storeId]`로 분기. 완전 실패 시 에러 표시.

---

### 2.7 `src/app/spotline/[qrId]/page.tsx` — 301 리다이렉트

**현재 구조**: `"use client"`, 238줄의 풀 레거시 SpotLine 페이지.

**변경 전략**: **서버 컴포넌트로 전환**, `redirect()` 사용.

```typescript
import { redirect } from "next/navigation";
import { resolveQrToSpot } from "@/lib/api";

interface SpotlinePageProps {
  params: Promise<{ qrId: string }>;
  searchParams: Promise<{ qr?: string }>;
}

export default async function SpotlinePage({ params, searchParams }: SpotlinePageProps) {
  const { qrId: storeId } = await params;
  const { qr: qrId } = await searchParams;

  // 데모 모드: 기존 페이지 유지
  if (storeId.startsWith("demo_") || storeId === "demo-store") {
    // 데모 페이지는 별도 /spotline/demo-store/ 라우트에서 처리
    // 여기 도달했으면 동적 데모 ID이므로 기존 로직 필요
    // → 데모 전용 컴포넌트 렌더링 (기존 코드 유지)
  }

  // v2 Spot 조회 시도
  const resolution = await resolveQrToSpot(storeId);

  if (resolution?.source === "v2") {
    redirect(`/spot/${resolution.slug}${qrId ? `?qr=${qrId}` : ""}`);
  }

  // v2에 없으면 기존 레거시 SpotLine 페이지 렌더링 (기존 코드 유지)
  // → 기존 클라이언트 컴포넌트를 별도 파일로 분리하여 import
}
```

**실제 구현 전략**:
- 데모 모드(`demo_` prefix 또는 `demo-store`)는 기존 로직 그대로 유지
- v2 해석 성공 시 `redirect()` (기본 307, 하지만 SEO 관점에서 `permanentRedirect()` 사용)
- v2 해석 실패 시 기존 레거시 SpotLine 렌더링 유지 (코드 삭제하지 않음)
- 기존 238줄 클라이언트 코드를 `SpotlineLegacyPage` 컴포넌트로 분리 → 조건부 렌더링

**파일 분리 계획**:
- `src/app/spotline/[qrId]/page.tsx` — 서버 컴포넌트 (리다이렉트 로직)
- `src/components/spotline/SpotlineLegacyPage.tsx` — 기존 클라이언트 코드 이동 (레거시 fallback용)

> **Note**: 기존 `src/components/spotline/*` 컴포넌트(SpotlineStoreInfo, NextSpotsList 등)는 유지. SpotlineLegacyPage가 이들을 사용.

---

## 3. Data Flow

### 3.1 QR → Spot 리다이렉트 (신규)

```
[QR 스캔]
  → /qr/[qrId] (Client Component)
  → resolveQrToSpot(qrId)
      ├─ v2 성공 → /spot/{slug}?qr={qrId}
      ├─ legacy 성공 → /spotline/{storeId}?qr={qrId}
      └─ 실패 → 에러 표시
```

### 3.2 Spot 페이지 QR 모드 (신규)

```
/spot/[slug]?qr={qrId} (Server Component)
  → fetchSpotDetail(slug)         [기존]
  → fetchSpotRoutes(spotId)       [기존]
  → fetchNearbySpots(lat, lng)    [기존]
  → 렌더링:
      SpotHero                    [기존]
      QrBanner                    [신규 — QR 모드에서만]
      QrAnalytics                 [신규 — QR 모드에서만, invisible]
      SpotCrewNote                [기존]
      SpotPlaceInfo               [기존]
      SpotImageGallery            [기존]
      SpotRoutes                  [기존]
      SpotNearby                  [기존]
      AreaCta                     [신규 — QR 모드에서만]
      SpotBottomBar               [기존]
```

### 3.3 SpotLine 레거시 리다이렉트

```
/spotline/[storeId] (Server Component)
  → demo 감지? → 기존 레거시 렌더링
  → resolveQrToSpot(storeId)
      ├─ v2 성공 → permanentRedirect(/spot/{slug})
      └─ 실패 → 기존 레거시 렌더링 (SpotlineLegacyPage)
```

---

## 4. Implementation Order

| Step | Files | Effort | Description |
|------|-------|--------|-------------|
| **1** | `src/lib/api.ts` | Small | `resolveQrToSpot()` 함수 추가 |
| **2** | `QrBanner.tsx`, `QrAnalytics.tsx`, `AreaCta.tsx` | Small | 신규 컴포넌트 3개 생성 |
| **3** | `src/app/spot/[slug]/page.tsx` | Small | QR 모드 — searchParams 추가, 조건부 렌더링 |
| **4** | `src/app/qr/[qrId]/page.tsx` | Small | v2 기반 리다이렉트 로직 변경 |
| **5** | `src/app/spotline/[qrId]/page.tsx` | Medium | 서버 컴포넌트 전환 + 레거시 fallback 분리 |

**의존성**: Step 1 → Step 2~5 (resolveQrToSpot이 기반)

---

## 5. Preserved (No Change)

| File | Reason |
|------|--------|
| `/spotline/demo-store/` | 데모 시스템 독립 유지 |
| `/api/demo/store/route.ts` | 데모 API 유지 |
| `src/components/spotline/*` | 레거시 fallback용 유지 |
| `src/store/useSpotlineStore.ts` | 데모 페이지에서 사용 가능 |

---

## 6. Risk & Mitigation

| Risk | Mitigation |
|------|-----------|
| v2 QR API 미존재 | `resolveQrToSpot`에서 레거시 fallback 내장. v2 API 없어도 동작 |
| QR 파트너 0개 | 실제 트래픽 없으므로 마이그레이션 리스크 최소. 데모로 검증 |
| SpotLine 기존 링크 깨짐 | `/spotline/*` 페이지 유지 + 리다이렉트로 대응 |
| SSR 성능 | QrBanner/AreaCta는 서버 컴포넌트, QrAnalytics는 null 렌더 |
