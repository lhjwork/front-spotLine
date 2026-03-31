# Gap Analysis: QR System Integration

| Item | Detail |
|------|--------|
| Feature | QR System Integration (Phase 5) |
| Analyzed | 2026-03-27 |
| Design Doc | `docs/02-design/features/qr-system-integration.design.md` |
| Match Rate | **96%** |

---

## 1. Design vs Implementation Comparison

| # | Design Item | File | Status | Notes |
|---|------------|------|--------|-------|
| 1 | `resolveQrToSpot()` — v2 우선, 레거시 fallback | `src/lib/api.ts:478` | ✅ Match | QrSpotResolution 인터페이스, v2→legacy→null 로직, 3초 타임아웃 |
| 2 | `QrBanner.tsx` — QR 진입 배너 | `src/components/qr/QrBanner.tsx` | ✅ Match | 서버 컴포넌트, bg-green-50, 📍 아이콘, font-semibold |
| 3 | `QrAnalytics.tsx` — QR 분석 이벤트 | `src/components/qr/QrAnalytics.tsx` | ✅ Match | "use client", logPageEnter 호출, beforeunload 체류 시간, return null |
| 4 | `AreaCta.tsx` — 지역 더 보기 CTA | `src/components/shared/AreaCta.tsx` | ✅ Match | 서버 컴포넌트, Link, rounded-xl 스타일, areaLabel 옵션 |
| 5 | Spot 페이지 searchParams 추가 | `src/app/spot/[slug]/page.tsx:17` | ✅ Match | `Promise<{ qr?: string }>` |
| 6 | Spot 페이지 QR 파라미터 추출 | `src/app/spot/[slug]/page.tsx:51-52` | ✅ Match | `const { qr: qrId }`, `isQrMode` |
| 7 | QrBanner + QrAnalytics 조건부 렌더링 위치 | `src/app/spot/[slug]/page.tsx:74-79` | ✅ Match | SpotHero 아래, SpotCrewNote 위 |
| 8 | AreaCta 조건부 렌더링 위치 | `src/app/spot/[slug]/page.tsx:101-103` | ✅ Match | SpotNearby 아래, SpotBottomBar 위 |
| 9 | QR 페이지 `resolveQrToSpot` 사용 | `src/app/qr/[qrId]/page.tsx:5,26` | ✅ Match | getStoreIdByQR → resolveQrToSpot 교체 |
| 10 | QR 페이지 v2/legacy 분기 리다이렉트 | `src/app/qr/[qrId]/page.tsx:28-37` | ✅ Match | v2→/spot/, legacy→/spotline/ |
| 11 | QR 페이지 데모 모드 유지 | `src/app/qr/[qrId]/page.tsx:19-22` | ✅ Match | demo_cafe_001 체크 유지 |
| 12 | SpotLine 페이지 서버 컴포넌트 전환 | `src/app/spotline/[qrId]/page.tsx` | ✅ Match | async function, no "use client" |
| 13 | SpotLine permanentRedirect 사용 | `src/app/spotline/[qrId]/page.tsx:23` | ✅ Match | `permanentRedirect()` (Design 명세 일치) |
| 14 | SpotLine 데모 모드 레거시 렌더링 | `src/app/spotline/[qrId]/page.tsx:15-16` | ✅ Match | demo_ prefix → SpotlineLegacyPage |
| 15 | SpotLine 레거시 fallback | `src/app/spotline/[qrId]/page.tsx:27` | ✅ Match | v2 실패 시 SpotlineLegacyPage |
| 16 | SpotlineLegacyPage 분리 | `src/components/spotline/SpotlineLegacyPage.tsx` | ✅ Match | 기존 코드 분리, "use client" |
| 17 | Preserved: /spotline/demo-store/ | `src/app/spotline/demo-store/page.tsx` | ✅ Preserved | 변경 없음 |
| 18 | Preserved: /api/demo/store | `src/app/api/demo/store/route.ts` | ✅ Preserved | 변경 없음 |
| 19 | Preserved: spotline components | `src/components/spotline/*` | ✅ Preserved | SpotlineLegacyPage가 사용 |
| 20 | Type check pass | `pnpm type-check` | ✅ Pass | 0 errors |
| 21 | Build pass | `pnpm build` | ✅ Pass | 38 pages |

---

## 2. Deviations

| # | Item | Design | Implementation | Severity | Justification |
|---|------|--------|---------------|----------|---------------|
| D1 | 파일 수 | 7 (3 new + 4 mod) | 8 (4 new + 4 mod) | Minor/Intentional | SpotlineLegacyPage.tsx 추가 — Design 2.7에서 명시된 "파일 분리 계획"의 실현. 실제 구현 시 레거시 코드를 별도 파일로 분리해야 서버/클라이언트 경계가 깔끔 |

---

## 3. Summary

- **Total Design Items**: 21
- **Matched**: 21 (100%)
- **Deviations**: 1 (minor, intentional)
- **Match Rate**: **96%** (파일 수 편차 감안)
- **Build**: Pass (38 pages)
- **Type Check**: Pass (0 errors)
- **Iterations Needed**: 0
