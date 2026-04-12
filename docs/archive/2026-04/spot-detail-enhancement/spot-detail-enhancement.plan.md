# Spot Detail Enhancement Planning Document

> **Summary**: Spot 상세 페이지에 영업시간 실시간 상태, 요일별 영업시간, 메뉴/가격, 편의시설, 지도 미리보기를 추가하여 사용자가 방문 전 충분한 정보를 얻을 수 있도록 개선
>
> **Project**: front-spotLine + springboot-spotLine-backend
> **Author**: AI Assistant
> **Date**: 2026-04-11
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | Spot 상세 페이지에 카카오 Place API의 풍부한 데이터(요일별 영업시간, 메뉴/가격, 편의시설 등)가 있지만 현재 단일 시간 문자열과 기본 정보만 표시. 사용자가 "지금 영업 중인지", "메뉴 가격은 얼마인지" 알려면 외부 앱으로 이동해야 함. |
| **Solution** | Backend에서 카카오 API 응답의 추가 필드(요일별 영업시간, 메뉴, 편의시설)를 파싱하여 PlaceInfo를 확장하고, Frontend에서 실시간 영업 상태 배지, 요일별 시간표, 메뉴 섹션, 카카오맵 미리보기를 추가. |
| **Function/UX Effect** | "영업 중 · 21:00에 마감" 실시간 상태로 방문 결정 즉시 가능. 메뉴/가격 확인으로 외부 앱 이동 없이 Spotline 앱 내에서 의사결정 완료. 지도 미리보기로 위치 파악 직관적. |
| **Core Value** | Spot 상세 페이지 체류시간 증가 + 외부 이탈률 감소 → Spotline이 "방문 전 원스톱 정보 허브"로 포지셔닝. SEO 구조화 데이터 강화로 검색 노출 개선. |

---

## 1. Overview

### 1.1 Purpose

Spot 상세 페이지를 "방문 전 필요한 모든 정보를 한눈에"라는 목표로 개선한다. 현재 카카오 Place API에서 가져오는 데이터의 약 30%만 활용 중이며, 나머지 70%(요일별 영업시간, 메뉴, 편의시설 등)를 파싱·표시하여 사용자 경험을 대폭 향상시킨다.

### 1.2 Background

**현재 상태 (PlaceInfo)**:
- phone, businessHours (단일 시간 문자열), rating, reviewCount, photos (5장), url
- businessHours가 "10:00~22:00" 같은 단순 문자열 — 요일별 차이, 실시간 상태 없음

**카카오 API 미활용 데이터** (`place.map.kakao.com/main/v/{placeId}`):
- `basicInfo.openHour.periodList[].timeList[]` — 요일별 영업시간 (timeName, dayOfWeek, timeSE)
- `basicInfo.openHour.offdayList[]` — 정기 휴무일
- `menuInfo.menuList[]` — 메뉴명 + 가격 + 이미지
- `basicInfo.facilityInfo` — 편의시설 (주차, 와이파이, 펫 등)
- `basicInfo.tags[]` — 카카오 태그

### 1.3 현재 문제점

1. **영업 상태 불명확**: "지금 영업 중?" 확인 불가 → 외부 앱 이동 필요
2. **메뉴 정보 부재**: 카페/레스토랑에서 메뉴·가격 확인 불가
3. **영업시간 단순화**: 월~일 동일 시간으로 표시, 실제로는 요일별 다름
4. **지도 부재**: 위치를 텍스트(주소)로만 표시, 시각적 위치 파악 어려움
5. **편의시설 미표시**: 주차, 와이파이 등 방문 결정에 중요한 정보 누락

---

## 2. Scope

### 2.1 In Scope

- [ ] **FR-01**: Backend — PlaceInfo 확장 (요일별 영업시간, 메뉴, 편의시설)
- [ ] **FR-02**: Frontend — 실시간 영업 상태 배지 ("영업 중", "영업 종료", "곧 마감")
- [ ] **FR-03**: Frontend — 요일별 영업시간 아코디언 (오늘 강조)
- [ ] **FR-04**: Frontend — 메뉴/가격 섹션 (접기/펼치기)
- [ ] **FR-05**: Frontend — 카카오맵 정적 미리보기 이미지
- [ ] **FR-06**: Frontend — 편의시설 아이콘 표시 (주차, 와이파이, 펫 등)
- [ ] **FR-07**: SEO — JSON-LD 구조화 데이터에 영업시간, 메뉴 추가

### 2.2 Out of Scope

- 네이버 Place 상세 데이터 (공식 API 없음, URL만 제공)
- 실시간 리뷰 표시 (저작권 이슈)
- 예약/주문 기능
- 사용자 리뷰 작성

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Backend PlaceInfo에 dailyHours[], menuItems[], facilities[] 필드 추가 | High | Pending |
| FR-02 | 실시간 영업 상태 배지 (영업 중/종료/곧 마감) — SpotHero에 표시 | High | Pending |
| FR-03 | 요일별 영업시간 펼치기/접기 — SpotPlaceInfo 개선 | High | Pending |
| FR-04 | 메뉴/가격 목록 섹션 (최대 10개, "더보기"로 카카오맵 이동) | Medium | Pending |
| FR-05 | 카카오맵 Static Map 이미지 (마커 포함, 클릭 시 카카오맵 열기) | Medium | Pending |
| FR-06 | 편의시설 아이콘 배지 (주차/와이파이/펫/배달/포장 등) | Low | Pending |
| FR-07 | JSON-LD에 openingHoursSpecification, hasMenu 추가 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement |
|----------|----------|-------------|
| Performance | PlaceInfo 확장 후 API 응답시간 증가 < 50ms | 캐시 히트 시 기존과 동일 |
| Compatibility | placeInfo null일 때 graceful degradation 유지 | 빌드 + 렌더링 에러 0 |
| SEO | Lighthouse SEO 점수 유지 (90+) | Lighthouse 측정 |
| Mobile | 모바일 퍼스트 — 메뉴/시간표 터치 친화적 | 348px 이상 정상 표시 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] Backend PlaceInfo 확장 (3개 신규 필드) + 기존 API 하위 호환
- [ ] 영업 상태 배지 정상 표시 (한국 시간 기준)
- [ ] 요일별 영업시간 아코디언 동작
- [ ] 메뉴 섹션 렌더링 (데이터 없으면 미표시)
- [ ] 카카오맵 미리보기 이미지 로드
- [ ] `pnpm build` 성공 (front-spotLine + springboot-spotLine-backend)
- [ ] Gap Analysis 90% 이상

### 4.2 Quality Criteria

- [ ] PlaceInfo 데이터 없는 Spot에서 에러 없이 기존 UI 유지
- [ ] 영업 상태 계산이 Asia/Seoul 시간대 기준 정확
- [ ] 메뉴 가격 포맷 (1000원 단위 콤마)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 카카오 API 응답 구조 변경 | High | Low | 파싱 실패 시 null 반환, graceful degradation |
| 일부 매장에 메뉴 데이터 없음 | Medium | High | 데이터 없으면 섹션 숨김, "카카오맵에서 확인" 링크 제공 |
| 영업시간 파싱 복잡도 (휴무일, 브레이크타임) | Medium | Medium | 기본 케이스(요일별 시간) 먼저 구현, 예외는 raw 텍스트 표시 |
| Static Map API 호출 비용 | Low | Low | 이미지 캐싱 (24h), 스크롤 시 lazy load |
| 영업 상태 시간대 오류 | Medium | Low | 서버에서 KST 기준 계산, 프론트는 표시만 |

---

## 6. Implementation Items

| # | Item | Repo | Files | Description |
|:-:|------|------|-------|-------------|
| 1 | PlaceInfo DTO 확장 | backend | PlaceInfo.java, PlaceApiService.java | dailyHours, menuItems, facilities 필드 추가 + 카카오 API 파싱 확장 |
| 2 | SpotDetailResponse 호환 | backend | SpotDetailResponse.java | 신규 필드 포함하여 응답 (null safe) |
| 3 | Frontend 타입 확장 | front | types/index.ts | DiscoverPlaceInfo에 dailyHours, menuItems, facilities 타입 추가 |
| 4 | 영업 상태 배지 | front | components/spot/SpotBusinessStatus.tsx (NEW) | 현재 시간 vs dailyHours 비교, 상태 배지 표시 |
| 5 | 요일별 영업시간 UI | front | components/spot/SpotPlaceInfo.tsx (MODIFY) | 아코디언 UI, 오늘 강조 |
| 6 | 메뉴 섹션 | front | components/spot/SpotMenu.tsx (NEW) | 메뉴명 + 가격 목록, 접기/펼치기 |
| 7 | 카카오맵 미리보기 | front | components/spot/SpotMapPreview.tsx (NEW) | Static Map 이미지 + 클릭 시 카카오맵 열기 |
| 8 | 편의시설 배지 | front | components/spot/SpotFacilities.tsx (NEW) | 아이콘 + 텍스트 배지 (주차, 와이파이 등) |
| 9 | SEO 구조화 데이터 | front | lib/seo/spot.ts (MODIFY) | JSON-LD openingHoursSpecification, hasMenu |
| 10 | Spot 상세 페이지 통합 | front | app/spot/[slug]/page.tsx (MODIFY) | 신규 컴포넌트 배치 |

---

## 7. Architecture Considerations

### 7.1 Project Level

Dynamic — Backend API 확장 + Frontend 컴포넌트 추가

### 7.2 Key Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| 영업 상태 계산 위치 | Frontend (클라이언트) | 사용자의 현재 시간 기준 실시간 갱신, 서버 캐시(24h)와 독립적 |
| 지도 미리보기 방식 | 카카오맵 Static API 이미지 | iframe보다 가볍고 SSR 호환, 클릭 시 카카오맵 앱/웹 열기 |
| 메뉴 데이터 저장 | 캐시만 (DB 저장 안 함) | CLAUDE.md 전략: "매장 상세 정보는 DB에 저장 안 함, API 실시간 조회 + 24h 캐싱" |
| 편의시설 아이콘 | Lucide React 기존 아이콘 활용 | 추가 아이콘 라이브러리 불필요 |

---

## 8. Next Steps

1. [ ] Design 문서 작성 (`/pdca design spot-detail-enhancement`)
2. [ ] 구현 (`/pdca do spot-detail-enhancement`)
3. [ ] Gap Analysis (`/pdca analyze spot-detail-enhancement`)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-11 | Initial draft | AI Assistant |
