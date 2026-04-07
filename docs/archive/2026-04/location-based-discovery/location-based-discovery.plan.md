# Location-Based Discovery Planning Document

> **Summary**: GPS 위치 기반으로 "지금 여기(Current Spot)" + "다음은 여기(Next Spot)" 2-블록 구조의 랜딩 페이지를 구현한다. Backend API, 타입, API 함수, 페이지 셸은 이미 완료. 9개 UI 컴포넌트 + 1 훅 + 1 스토어만 구현 필요.
>
> **Project**: Spotline (front-spotLine)
> **Version**: 3.0.0
> **Author**: Crew
> **Date**: 2026-04-07
> **Status**: In Progress (Frontend Only)

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 현재 랜딩 페이지는 정적 히어로+가이드 구성으로, 유저가 앱에 들어와도 즉시 행동할 수 있는 콘텐츠가 없다. QR 스캔 없이는 Spot을 발견할 방법이 없다. |
| **Solution** | 브라우저 Geolocation API로 유저 위치를 감지하고, 가장 가까운 Spot(Block 1)과 그 다음 이동하기 좋은 Spot(Block 2)을 자동 추천하는 2-블록 랜딩 페이지를 구축한다. |
| **Function/UX Effect** | 앱 진입 즉시 "지금 여기서 갈 수 있는 곳" + "거기서 다음에 갈 곳"을 한 화면에 보여주어, 탐색 비용 없이 바로 행동으로 이어진다. |
| **Core Value** | QR 없이도 위치만으로 Spot을 발견하는 진입점을 제공하여, Cold Start 시 콘텐츠 소비 전환율을 높이고 QR Discovery와 자연스럽게 연결한다. |

| Item | Detail |
|------|--------|
| Feature | Location-Based Discovery (2-Block Landing) |
| Created | 2026-03-15 |
| Updated | 2026-04-07 |
| Duration | 예상 3일 (Frontend Only) |
| Status | In Progress |
| Level | Dynamic |
| Target Repo | front-spotLine only (Backend API 완료) |

---

## 1. Overview

### 1.1 Purpose

Spotline 랜딩 페이지를 **위치 기반 Spot 발견 페이지**로 교체하여, 유저가 앱에 진입하는 즉시 근처 Spot을 발견하고 다음 행동으로 연결되게 한다.

### 1.2 Background

- 현재 랜딩(`/`)은 DiscoverPage 셸만 존재 (모든 하위 컴포넌트 미구현)
- QR 스캔이 유일한 Spot 발견 경로 → QR 파트너 매장 0개인 현재 상황에서 Dead End
- 크루 큐레이션으로 200~300 Spot을 사전 등록할 예정 → **위치 기반으로 이 콘텐츠를 노출할 진입점 필요**
- 기존 QR 플로우의 "현재 매장 → 다음 장소 추천" 패턴을 위치 기반으로 확장

### 1.3 Already Completed (as of 2026-04-07)

- **Backend Discover API**: `GET /api/v2/spots/discover?lat=&lng=&radius=&excludeSpotId=` — `SpotController.java`
- **Backend DTO**: `DiscoverResponse.java` (currentSpot, nextSpot, nearbySpots, popularSpotLines, area, locationGranted)
- **Frontend Types**: `DiscoverResponse`, `DiscoverCurrentSpot`, `DiscoverNextSpot`, `DiscoverSpot`, `GeolocationState` in `src/types/index.ts`
- **Frontend API**: `fetchDiscover()` in `src/lib/api.ts`
- **Page Shell**: `src/app/page.tsx` imports DiscoverPage, `src/components/discover/DiscoverPage.tsx` structure exists

### 1.3 Related Documents

- 전체 Plan: `front-spotLine/docs/01-plan/features/experience-social-platform.plan.md`
- Front Design: `front-spotLine/docs/02-design/features/experience-social-platform.design.md` (5.5~5.6절)
- Backend Design: `springboot-spotLine-backend/docs/02-design/features/phase1-data-model-place-api.design.md`
- Backend Plan: `springboot-spotLine-backend/docs/01-plan/features/phase1-data-model-place-api.plan.md` (FR-14)

---

## 2. Scope

### 2.1 In Scope (Frontend Only — Backend Complete)

- [x] ~~**Discover API**: `GET /api/v2/spots/discover`~~ ✅ Backend 완료
- [x] ~~**Next Spot 추천 로직**~~ ✅ Backend 완료
- [x] ~~**Frontend Types & API Function**~~ ✅ 완료
- [x] ~~**Page Shell (DiscoverPage.tsx)**~~ ✅ 구조 존재
- [ ] **Geolocation 훅**: `useGeolocation()` 커스텀 훅 (권한 요청, 좌표 획득, 에러 처리)
- [ ] **Discover 상태 관리**: `useDiscoverStore` (Zustand)
- [ ] **9개 UI 컴포넌트**: LocationHeader, LocationPermissionBanner, SpotBlock (Current+Next 공용), TransitionInfo, NearbySpotScroll, PopularSpotLinesList, DiscoverSkeleton + DiscoverPage 내부 조립
- [ ] **폴백 처리**: 위치 거부 시 인기 Spot 기반 폴백 + 위치 허용 유도 배너
- [ ] **"다른 추천 보기"**: excludeSpotId로 새로운 Spot 쌍 요청

### 2.2 Out of Scope

- GPS 자동 추적 (실시간 위치 업데이트) — 향후
- "SpotLine으로 시작하기" 기능 (SpotLine 생성 UI는 별도 Phase)
- 소셜 기능 (좋아요, 저장) — ✅ Phase 6 완료
- Spot 상세 페이지 구현 — ✅ Phase 3 완료
- 피드 페이지 — ✅ Phase 4 완료
- 위치 기반 푸시 알림 — 앱 전환 후

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 브라우저 Geolocation API로 유저 좌표(lat, lng) 획득 — `useGeolocation()` 훅 | High | Pending |
| FR-02 | `GET /api/v2/spots/discover?lat=&lng=` API | High | ✅ Done (Backend) |
| FR-03 | Discover API: nextSpot 추천 로직 | High | ✅ Done (Backend) |
| FR-04 | PlaceInfo 병합 응답 | High | ✅ Done (Backend) |
| FR-05 | currentSpot ↔ nextSpot 간 도보 시간/거리 표시 (`TransitionInfo` 컴포넌트) | High | Pending |
| FR-06 | Block 1(현재 Spot): 이미지, 카테고리, 제목, crewNote, 평점, 거리, 영업 정보 (`SpotBlock` 컴포넌트) | High | Pending |
| FR-07 | Block 2(다음 Spot): 이미지, 카테고리, 제목, crewNote, 도보 시간 (`SpotBlock` 컴포넌트) | High | Pending |
| FR-08 | [자세히 보기] → `/spot/{slug}` 상세 페이지 이동 | High | Pending |
| FR-09 | [길찾기] → 외부 지도 앱 연동 (카카오맵/네이버지도/구글맵) | High | Pending |
| FR-10 | 위치 거부 시 서울 전체 인기 Spot 기반 폴백 + `LocationPermissionBanner` | Medium | Pending |
| FR-11 | [다른 추천 보기] → excludeSpotId로 새 Spot 쌍 요청 | Medium | Pending |
| FR-12 | 근처 다른 Spot 가로 스크롤 섹션 — `NearbySpotScroll` (최대 6개) | Medium | Pending |
| FR-13 | 같은 area의 인기 SpotLine 프리뷰 — `PopularSpotLinesList` (최대 3개) | Low | Pending |
| FR-14 | 로딩 스켈레톤 — `DiscoverSkeleton` (위치 획득 + API 호출 동안) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | Geolocation 허용 후 첫 렌더링까지 < 2초 (캐시 히트 시) | API 응답시간 로깅 |
| Performance | Discover API 응답 < 500ms (DB 조회 + PlaceInfo 캐시 히트) | Backend 로깅 |
| UX | 위치 권한 요청은 1회만, 거부 시 재요청 없이 폴백 즉시 표시 | 수동 검증 |
| Responsive | 375px~428px (모바일) 최적화, 768px+(태블릿/데스크탑) 대응 | DevTools |
| Accessibility | 위치 비허용 사용자도 동일 수준의 콘텐츠 접근 가능 | 수동 검증 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 위치 허용 시 현재 위치 기준 가장 가까운 Spot이 Block 1에 표시
- [ ] Block 1의 Spot과 다른 카테고리의 근처 Spot이 Block 2에 표시
- [ ] 두 블록 사이 도보 시간/거리 정보 표시
- [ ] [자세히 보기] 클릭 시 `/spot/{slug}` 이동 (페이지 존재하지 않아도 라우팅 동작)
- [ ] [길찾기] 클릭 시 외부 지도 앱 열림
- [ ] 위치 거부 시 인기 Spot 폴백 + 유도 배너 표시
- [ ] [다른 추천 보기] 클릭 시 새로운 Spot 쌍으로 교체
- [ ] 모바일(375px) 반응형 레이아웃 정상 동작

### 4.2 Quality Criteria

- [ ] Zero lint errors (`pnpm lint`)
- [ ] TypeScript 타입 체크 통과 (`pnpm type-check`)
- [ ] Build succeeds (`pnpm build`)
- [ ] 기존 QR Discovery (`/spotline/[qrId]`) 정상 동작 유지

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Geolocation API 미지원 (HTTP 환경) | High | Medium | HTTPS 배포 전제, 개발 시 localhost 예외 활용 |
| 유저 위치 근처 Spot 0개 | High | High (초기) | 반경 자동 확대 (1km→3km→5km), 최종 폴백으로 인기 Spot |
| Next Spot 추천 Spot 1개뿐 | Medium | Medium (초기) | Block 2 숨김 처리, "곧 더 많은 Spot이 추가됩니다" 메시지 |
| Geolocation 정확도 낮음 (Wi-Fi 환경) | Low | Medium | 거리 표시에 "약 ~m" 사용, 정확도 낮을 시 area 단위로 폴백 |
| Place API 실패로 placeInfo 없음 | Medium | Low | DB 데이터(crewNote, 제목)만으로도 Block 렌더링 가능 (graceful) |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend | **V** |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems | |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| 렌더링 방식 | SSR / CSR | CSR | Geolocation은 브라우저 API → 서버에서 실행 불가, Client Component 필수 |
| 상태 관리 | Zustand / Context / useState | Zustand (`useDiscoverStore`) | 기존 패턴(useSpotlineStore) 유지, persist 가능 |
| Geolocation 접근 | 직접 호출 / 커스텀 훅 | `useGeolocation()` 훅 | 권한 상태, 에러, 재시도 로직 캡슐화 |
| 지도 연동 | 임베드 / 외부 링크 | 외부 링크 (ExternalMapButtons 재사용) | 지도 SDK 로드 불필요, 기존 컴포넌트 재사용 |
| API 구조 | 기존 nearby + 별도 호출 / 통합 Discover | 통합 `GET /discover` | 1회 호출로 currentSpot+nextSpot+nearby+routes 전부 반환 → 네트워크 최소화 |

### 6.3 기존 시스템과의 관계

```
기존 랜딩 (/) ──교체──→ 위치 기반 발견 페이지
  │
  ├── 기존 QR 플로우 (/spotline/[qrId]) → 영향 없음 (독립)
  │
  ├── 기존 API 레이어 (src/lib/api.ts) → fetchDiscover() 추가
  │
  ├── 기존 컴포넌트 재사용:
  │   ├── OptimizedImage (이미지 렌더링)
  │   ├── ExternalMapButtons (길찾기)
  │   ├── Loading/Skeleton (로딩 상태)
  │   └── cn() 유틸리티
  │
  └── Backend 기존 nearby API 확장:
      └── GET /api/v2/spots/nearby → GET /api/v2/spots/discover 신규
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] ESLint configuration
- [x] TypeScript configuration (`tsconfig.json` strict)
- [x] Code flow: Client Component → API fetch → Zustand store
- [x] 경로 별칭: `@/*` → `./src/*`

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Discover 컴포넌트 구조** | `DiscoverPage.tsx` 셸 존재 | 하위 컴포넌트 9개 생성 | High |
| **Geolocation 에러 코드** | `GeolocationState` 타입 정의됨 | `useGeolocation()` 훅 구현 | High |
| **Discover API 타입** | ✅ 완료 | `DiscoverResponse` 등 `types/index.ts`에 정의됨 | Done |
| **Discover Store** | 없음 | `useDiscoverStore` Zustand 스토어 | High |
| **위치 캐싱** | 없음 | sessionStorage에 마지막 위치 저장 여부 | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | Client + Server | 기존 |
| `NEXT_PUBLIC_KAKAO_MAP_API_KEY` | 길찾기 지도 링크 | Client | 기존 |

---

## 8. Core Type Definitions (✅ Already in `src/types/index.ts`)

```typescript
// DiscoverResponse, DiscoverCurrentSpot, DiscoverNextSpot, DiscoverSpot, GeolocationState
// 모두 src/types/index.ts에 정의 완료. 추가 타입 정의 불필요.
```

---

## 9. Implementation Order (Frontend Only)

> Steps 1~4 (Backend API, Types, API Function) 모두 완료. Step 5부터 시작.

| Step | Task | File | Dependencies | Status |
|------|------|------|-------------|--------|
| ~~1~~ | ~~Backend DiscoverResponse DTO~~ | ~~backend~~ | | ✅ Done |
| ~~2~~ | ~~SpotService.discover() 로직~~ | ~~backend~~ | | ✅ Done |
| ~~3~~ | ~~SpotController.discover() 엔드포인트~~ | ~~backend~~ | | ✅ Done |
| ~~4~~ | ~~Frontend Types + fetchDiscover()~~ | ~~types/index.ts, api.ts~~ | | ✅ Done |
| 5 | `useGeolocation()` 커스텀 훅 | `src/hooks/useGeolocation.ts` | 없음 | Pending |
| 6 | `useDiscoverStore` Zustand 스토어 | `src/store/useDiscoverStore.ts` | Step 5 | Pending |
| 7 | `DiscoverSkeleton` 로딩 컴포넌트 | `src/components/discover/DiscoverSkeleton.tsx` | 없음 | Pending |
| 8 | `LocationHeader` 현재 위치/지역 표시 | `src/components/discover/LocationHeader.tsx` | Step 5 | Pending |
| 9 | `LocationPermissionBanner` 위치 허용 유도 | `src/components/discover/LocationPermissionBanner.tsx` | Step 5 | Pending |
| 10 | `SpotBlock` 현재/다음 Spot 카드 | `src/components/discover/SpotBlock.tsx` | 없음 | Pending |
| 11 | `TransitionInfo` 블록 간 이동 정보 | `src/components/discover/TransitionInfo.tsx` | 없음 | Pending |
| 12 | `NearbySpotScroll` 가로 스크롤 | `src/components/discover/NearbySpotScroll.tsx` | 없음 | Pending |
| 13 | `PopularSpotLinesList` 인기 코스 | `src/components/discover/PopularSpotLinesList.tsx` | 없음 | Pending |
| 14 | `DiscoverPage` 조립 + 폴백 처리 | `src/components/discover/DiscoverPage.tsx` (수정) | Steps 5~13 | Pending |

---

## 10. Next Steps

1. [ ] `/pdca design location-based-discovery` — Design 문서 작성
2. [ ] Step 5~6: useGeolocation + useDiscoverStore 구현
3. [ ] Step 7~13: 9개 UI 컴포넌트 구현
4. [ ] Step 14: DiscoverPage 조립 + 폴백 처리
5. [ ] 크루 큐레이션 Spot 등록 후 실제 위치 기반 테스트

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-15 | Initial draft — 위치 기반 2-블록 발견 Plan | Claude Code |
| 3.0 | 2026-04-07 | Backend/Types/API 완료 반영, Frontend Only로 범위 축소, 14 Steps → 10 Pending Steps | Claude Code |
