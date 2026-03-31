# Plan: QR System Integration — QR Discovery와 새 플랫폼 통합

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | QR Discovery 시스템(`/spotline/[qrId]`)이 레거시 backend(`/api/`)를 사용하며, Phase 3~4에서 구현한 Spot/Route 상세 페이지 및 Feed와 완전히 분리되어 있다. QR 스캔 후 사용자가 새 플랫폼의 풍부한 콘텐츠(crewNote, Route, 주변 Spot, Place API 정보)를 활용할 수 없다. NextSpot 추천이 새 창에서 또 다른 SpotLine 페이지를 여는 고립된 경험이다. |
| **Solution** | QR 스캔 → 새 Spot 상세 페이지(`/spot/[slug]`)로 리다이렉트하되, QR 전용 배너와 NextSpot 추천을 유지한다. v2 API 기반으로 전환하고, 레거시 SpotLine 페이지를 새 Spot 페이지로 마이그레이션한다. Feed/City/Theme 페이지로의 자연스러운 이탈 경로를 제공한다. |
| **Function UX Effect** | QR 스캔 사용자가 crewNote, Place API 정보(영업시간, 평점), 관련 Route, 주변 Spot을 모두 한 페이지에서 확인한다. NextSpot 클릭 시 같은 탭에서 새 Spot 페이지로 이동. "이 지역 더 보기" 링크로 Feed/City 페이지로 자연스럽게 확장. |
| **Core Value** | QR 파트너 매장 0개인 현 상태에서, QR Discovery의 미래 확장성을 보장하면서 기존 시스템의 분석 데이터를 유지한다. QR → Spot → Route → Feed 연결로 사용자 체류 시간과 페이지 뷰를 극대화한다. |

| Item | Detail |
|------|--------|
| Feature | QR System Integration (Phase 5) |
| Created | 2026-03-27 |
| Status | Planning |
| Level | Dynamic |
| Depends On | Phase 3 (Spot/Route SSR) — Archived 92%, Phase 4 (Feed) — Archived 95% |

---

## 1. Background & Context

### 1.1 현재 상태 (AS-IS)

**QR Discovery 시스템** (레거시):
- `/qr/[qrId]` → `getStoreIdByQR()` → `/spotline/[storeId]?qr=[qrId]` 리다이렉트
- `/spotline/[qrId]` — 레거시 `SpotlineStore` 타입, 이미지 카루셀, SpotLine Story, NextSpots
- API: 레거시 backend (`/api/stores/spotline/store/{id}`, `/api/recommendations/next-spots/{id}`)
- 분석: `logPageEnter`, `logSpotClick`, `logMapLinkClick`, `logStoryExpand` 등 9개 이벤트
- 데모 모드: `demo_` prefix 감지, `/api/demo/store` 로컬 API

**새 플랫폼** (Phase 3~4):
- `/spot/[slug]` — v2 API, SSR+ISR, crewNote, Place API 정보, 관련 Route, 주변 Spot
- `/route/[slug]` — v2 API, SSR+ISR, 타임라인
- `/feed` — CSR, 지역/카테고리 필터, 무한 스크롤
- `/city/[name]`, `/theme/[name]` — SSR+ISR, SEO 랜딩

**문제점**:
1. QR 스캔 사용자는 레거시 페이지에 갇혀 새 콘텐츠 접근 불가
2. NextSpot 클릭 → 새 창에서 또 다른 SpotLine 페이지 (고립된 루프)
3. 두 시스템 간 데이터 타입 불일치 (`SpotlineStore` vs `SpotDetailResponse`)
4. QR 분석 이벤트가 v2 API와 별도로 관리됨
5. QR 파트너 매장이 0개이므로, 현재 시스템은 데모만 동작

### 1.2 Backend API 현황

**레거시 API** (Express + MongoDB):
```
GET /api/qr/{qrId}/store              ← QR → storeId 매핑
GET /api/stores/spotline/store/{id}    ← 매장 상세
GET /api/recommendations/next-spots/{id} ← 추천 다음 장소
POST /api/analytics/spotline-event     ← 분석 이벤트
```

**v2 API** (Spring Boot + PostgreSQL):
```
GET /api/v2/spots/{slug}              ← Spot 상세 (Place API 병합)
GET /api/v2/spots/nearby?lat=&lng=     ← 주변 Spot
GET /api/v2/routes/by-spot/{spotId}    ← Spot 포함 Route
GET /api/v2/spots/discover             ← 위치 기반 발견
```

**전환 전략**: 프론트엔드에서 QR 진입 시 v2 API를 우선 시도하고, 실패 시 레거시 fallback. 점진적 마이그레이션.

---

## 2. Scope

### 2.1 In Scope

| # | Item | Description |
|---|------|-------------|
| 1 | **QR → Spot 리다이렉트** | `/qr/[qrId]` → v2 API로 slug 조회 → `/spot/[slug]?qr=[qrId]` 리다이렉트 |
| 2 | **QR 배너 컴포넌트** | Spot 상세 페이지 상단에 QR 스캔 진입 배너 표시 (qr 쿼리파라미터 감지) |
| 3 | **QR 분석 통합** | Spot 상세 페이지에서 QR 진입 시 기존 분석 이벤트 유지 (page_enter, spot_click 등) |
| 4 | **SpotLine 페이지 리다이렉트** | `/spotline/[qrId]` → `/spot/[slug]` 영구 리다이렉트 (301) |
| 5 | **Spot 상세에 "다음 장소" 섹션 강화** | QR 진입 시 NextSpots → v2 NearbySpots + Route Spots 결합 |
| 6 | **Feed 연결 CTA** | Spot 상세 하단에 "이 지역 더 보기" → `/feed?area={area}` 링크 |
| 7 | **데모 모드 유지** | `demo_` prefix 처리 → 기존 데모 페이지 유지 또는 새 데모 Spot으로 전환 |

### 2.2 Out of Scope

| Item | Reason |
|------|--------|
| QR 코드 생성/관리 UI | admin-spotLine 범위 (Phase 8) |
| QR 파트너 매장 온보딩 | 사업 영업 단계, 개발 범위 아님 |
| 레거시 backend 제거 | 점진적 마이그레이션, 이 Phase에서 완전 제거하지 않음 |
| NFC 지원 | 별도 feature |
| 분석 대시보드 | admin-spotLine 범위 |

---

## 3. Core Changes

### 3.1 QR 리다이렉트 플로우 변경

**현재 (AS-IS)**:
```
QR 스캔 → /qr/[qrId]
  → getStoreIdByQR(qrId) → storeId
  → redirect → /spotline/{storeId}?qr={qrId}
  → 레거시 SpotLine 페이지
```

**변경 (TO-BE)**:
```
QR 스캔 → /qr/[qrId]
  → resolveQrToSpot(qrId) → { slug, spotId } (v2 API 우선, 레거시 fallback)
  → redirect → /spot/{slug}?qr={qrId}
  → 새 Spot 상세 페이지 (QR 배너 + 분석 활성화)
```

**Fallback 전략**:
1. v2 API에 QR → Spot slug 매핑 엔드포인트 필요 (Backend에 요청 or 프론트에서 조합)
2. v2에 없으면 레거시 API로 storeId 조회 → storeId로 v2 Spot 검색
3. 완전 실패 시 기존 `/spotline/[storeId]` 페이지로 fallback

### 3.2 Spot 상세 페이지 QR 모드

`/spot/[slug]?qr=[qrId]` 접근 시:
- **QR 배너**: "QR 코드로 방문하셨습니다" 배너 상단 표시
- **분석 활성화**: `logPageEnter(spotId, qrId)` 호출
- **NextSpots 강화**: 주변 Spot + 같은 Route의 다음 Spot 결합 표시
- **지도 버튼 강조**: "이 매장까지 길찾기" 버튼

### 3.3 SpotLine 페이지 마이그레이션

| URL | Action |
|-----|--------|
| `/spotline/[storeId]` | 301 리다이렉트 → `/spot/[slug]` (매핑 테이블 or API) |
| `/spotline/demo-store` | 유지 (데모 시스템 독립 운영) |
| `/qr/[qrId]` | v2 기반으로 리다이렉트 로직 변경 |

---

## 4. Data Flow

### 4.1 QR 진입 플로우

```
/qr/[qrId]
  ↓
resolveQrToSpot(qrId):
  1. GET /api/v2/qr/{qrId}/spot → { slug, spotId } (신규 API 필요)
  2. fallback: GET /api/qr/{qrId}/store → storeId → lookup slug
  3. fallback: redirect to /spotline/{storeId} (레거시)
  ↓
redirect → /spot/{slug}?qr={qrId}&ref=qr
```

### 4.2 Spot 페이지 QR 모드

```
/spot/[slug]?qr={qrId}
  ↓
Server Component: fetchSpotDetail(slug)  ← 기존 SSR
  ↓
Client Component: QrBanner (qr param 감지)
  → logPageEnter(spotId, qrId)   ← 분석 이벤트
  → show QR banner
  → show enhanced NextSpots section
  → show "이 지역 더 보기" CTA
```

---

## 5. New/Modified Components

### 5.1 New Components

| Component | File | Description |
|-----------|------|-------------|
| QrBanner | `src/components/qr/QrBanner.tsx` | QR 진입 배너 ("QR 코드로 방문하셨습니다") |
| QrAnalytics | `src/components/qr/QrAnalytics.tsx` | QR 분석 이벤트 트리거 (client, invisible) |
| AreaCta | `src/components/shared/AreaCta.tsx` | "이 지역 더 보기" CTA → /feed?area= |

### 5.2 Modified Components/Pages

| File | Change |
|------|--------|
| `/qr/[qrId]/page.tsx` | v2 기반 리다이렉트 로직으로 변경 |
| `/spotline/[qrId]/page.tsx` | 301 리다이렉트 to /spot/[slug] |
| `/spot/[slug]/page.tsx` | QR 쿼리파라미터 감지 → QrBanner + QrAnalytics 렌더링 |
| `src/lib/api.ts` | `resolveQrToSpot()` 함수 추가 |

### 5.3 Preserved (No Change)

| File | Reason |
|------|--------|
| `/spotline/demo-store/page.tsx` | 데모 시스템 독립 유지 |
| `/api/demo/store/route.ts` | 데모 API 유지 |
| `src/components/spotline/*` | 데모용으로 유지, 향후 제거 |

---

## 6. New API Functions

```typescript
// QR → Spot slug 조회 (v2 우선, 레거시 fallback)
resolveQrToSpot(qrId: string): Promise<{ slug: string; spotId: string } | null>

// QR 분석 이벤트 로깅 (기존 함수 재활용)
// logPageEnter, logSpotClick 등 — 기존 유지
```

**Backend 요구사항**:
- `GET /api/v2/qr/{qrId}/spot` — QR ID → Spot slug 매핑 (신규 API)
- 또는: QR 매핑 테이블이 v2 DB에 마이그레이션되어야 함
- **현재 QR 파트너 0개**이므로, 이 API는 즉시 필요하지 않음 — 프론트엔드 구조만 준비

---

## 7. File Structure

```
src/
├── app/
│   ├── qr/[qrId]/
│   │   └── page.tsx              ← 수정: v2 기반 리다이렉트
│   ├── spotline/
│   │   ├── [qrId]/
│   │   │   └── page.tsx          ← 수정: 301 리다이렉트 to /spot/[slug]
│   │   └── demo-store/
│   │       └── page.tsx          ← 유지
│   └── spot/[slug]/
│       └── page.tsx              ← 수정: QR 모드 지원
│
├── components/
│   ├── qr/
│   │   ├── QrBanner.tsx          ← 신규: QR 진입 배너
│   │   └── QrAnalytics.tsx       ← 신규: QR 분석 이벤트
│   └── shared/
│       └── AreaCta.tsx           ← 신규: 지역 더 보기 CTA
│
└── lib/
    └── api.ts                    ← 수정: resolveQrToSpot 추가
```

**총 예상 파일**: 7개 (신규 3 + 수정 4)

---

## 8. Implementation Order

| Step | Files | Description |
|------|-------|-------------|
| **Step 1** | api.ts | `resolveQrToSpot()` 함수 추가 (v2 우선 + 레거시 fallback) |
| **Step 2** | QrBanner, QrAnalytics, AreaCta | 새 컴포넌트 3개 생성 |
| **Step 3** | /spot/[slug]/page.tsx | QR 쿼리파라미터 감지 → QR 모드 렌더링 |
| **Step 4** | /qr/[qrId]/page.tsx | v2 기반 리다이렉트 로직 변경 |
| **Step 5** | /spotline/[qrId]/page.tsx | 301 리다이렉트 설정 |

---

## 9. QR Analytics Events (유지)

| Event | Trigger | Data |
|-------|---------|------|
| `page_enter` | QR 경유 Spot 페이지 진입 | spotId, qrId, sessionId |
| `spot_click` | 주변 Spot 카드 클릭 | spotId, targetSpotId, position |
| `map_link_click` | 지도 버튼 클릭 | spotId, targetSpotId |
| `external_link_click` | 외부 링크 클릭 | spotId, linkType |
| `page_exit` | 페이지 이탈 | stayDuration |

분석 이벤트는 기존 `POST /api/analytics/spotline-event` 엔드포인트 유지.
향후 v2 backend로 마이그레이션 시 엔드포인트만 변경.

---

## 10. Migration Strategy

### Phase 5a (이번 구현): 프론트엔드 구조 준비
- QR → Spot 리다이렉트 로직 구현 (fallback 포함)
- Spot 상세 페이지 QR 모드 지원
- SpotLine 페이지 리다이렉트
- 데모 시스템 유지

### Phase 5b (향후): Backend 마이그레이션
- QR 매핑 테이블을 v2 DB로 이관
- `GET /api/v2/qr/{qrId}/spot` API 구현
- 레거시 분석 API → v2로 통합
- SpotLine 컴포넌트 제거

### 리스크 관리
- **QR 파트너 0개**: 실제 QR 스캔 트래픽 없으므로 마이그레이션 리스크 최소
- **데모 모드**: 독립 유지하여 시연 능력 보존
- **Fallback**: v2 실패 시 레거시로 자동 fallback

---

## 11. Discussion Points

### 11.1 Backend API 의존성
- `GET /api/v2/qr/{qrId}/spot` API가 아직 없음
- **결정**: 프론트엔드에서 레거시 API를 우선 사용하되, v2 API가 생기면 자동 전환되는 구조로 구현
- `resolveQrToSpot()`에서 try/catch로 v2 → 레거시 순서 시도

### 11.2 URL 변경 영향
- `/spotline/*` → `/spot/*` 변경 시 기존 공유 링크 깨짐
- **결정**: 301 리다이렉트로 처리 (SEO 및 기존 링크 유지)

### 11.3 데모 시스템
- 데모 Spot이 v2 DB에 없을 수 있음
- **결정**: 데모 모드는 기존 `/spotline/demo-store` 유지, v2 통합하지 않음
