# User Spot Creation Planning Document

> **Summary**: 유저가 직접 Spot을 생성할 수 있는 UI 구현 — 백엔드 API 완성 상태, 프론트엔드 폼+페이지 신규 개발
>
> **Project**: front-spotLine
> **Author**: AI Assistant
> **Date**: 2026-04-13
> **Status**: Planning

---

## Executive Summary

| Perspective | Content |
|---|---|
| **Problem** | 현재 Spot 생성은 크루(admin)만 가능하여 UGC가 차단되고, Cold Start 콘텐츠 확보가 크루 인력에 종속됨 |
| **Solution** | 프론트엔드에 유저용 Spot 생성 페이지(`/create-spot`)와 폼 컴포넌트를 구현하여 일반 유저도 Spot을 등록할 수 있게 함 |
| **Function/UX Effect** | 유저가 방문한 장소를 직접 등록하고 사진/태그를 추가하여 자신만의 SpotLine 코스에 활용 가능 |
| **Core Value** | UGC 오픈으로 콘텐츠 양적 성장 가속화, 크루 의존도 탈피, 플랫폼 자생적 콘텐츠 순환 구조 확립 |

---

## 1. Overview

### 1.1 Purpose

일반 유저가 프론트엔드에서 직접 Spot(장소)을 생성할 수 있는 기능을 구현한다. 현재 Spot 생성은 admin-spotLine의 크루 큐레이션 도구에서만 가능하며, 프론트엔드에는 생성 UI가 없다.

### 1.2 Background

- 백엔드 `POST /api/v2/spots` 엔드포인트는 이미 완성 (creatorType="user" 지원)
- admin-spotLine에 SpotCuration 페이지 (Quick/Bulk/Manual 모드) 구현 완료
- 프론트엔드에는 SpotLine 생성(`/create-spotline`)만 존재, Spot 생성 없음
- SpotPhotoUpload 컴포넌트, getPresignedUrl 패턴은 이전 PDCA(user-spot-photo-upload)에서 구현 완료
- Cold Start 전략: 크루 큐레이션 200~300개 + UGC로 콘텐츠 볼륨 확보

### 1.3 Current State

| 항목 | 상태 |
|------|------|
| Backend API (POST /api/v2/spots) | ✅ 완성 |
| CreateSpotRequest DTO | ✅ 완성 (title, category, source, address, lat/lng, area 필수) |
| SpotService.create() | ✅ 완성 (slug 자동생성, media 처리 포함) |
| Frontend create-spot 페이지 | ❌ 없음 |
| Frontend createSpot() API 함수 | ❌ 없음 |
| SpotPhotoUpload 컴포넌트 | ✅ 재활용 가능 |
| AuthGuard 컴포넌트 | ✅ 재활용 가능 |

---

## 2. Scope

### 2.1 In Scope

- [x] `/create-spot` 페이지 생성 (AuthGuard 적용)
- [x] SpotCreateForm 컴포넌트 (유저용 간소화 폼)
- [x] 주소 검색 + 좌표 변환 (Daum Postcode API)
- [x] 카테고리 선택 UI
- [x] 사진 업로드 (SpotPhotoUpload 재활용)
- [x] 태그 입력 UI
- [x] api.ts에 createSpot() 함수 추가
- [x] types/index.ts에 CreateSpotRequest 타입 추가
- [x] FloatingCreateButton에 "Spot 등록" 옵션 추가
- [x] 생성 완료 후 `/spot/[slug]`로 리다이렉트

### 2.2 Out of Scope

- Place API 연동 (네이버/카카오 Place 검색) — 크루 전용 기능으로 유지
- Bulk 등록 — admin 전용
- crewNote 필드 — 크루 전용 (유저는 description 사용)
- Spot 수정/삭제 UI — 별도 feature로 분리
- 지도에서 직접 핀 찍기 — 향후 개선

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-01 | 인증된 유저만 Spot 생성 가능 (AuthGuard) | Must | 🔲 |
| FR-02 | 장소명(title) 입력 — 필수, 최대 100자 | Must | 🔲 |
| FR-03 | 카테고리 선택 — 10개 SpotCategory 중 택1 | Must | 🔲 |
| FR-04 | 주소 검색 (Daum Postcode) → address, lat/lng, area, sido/sigungu/dong 자동 채움 | Must | 🔲 |
| FR-05 | 설명(description) 입력 — 선택, 최대 500자 | Should | 🔲 |
| FR-06 | 사진 업로드 — SpotPhotoUpload 컴포넌트, 최대 5장 | Should | 🔲 |
| FR-07 | 태그 입력 — 콤마 구분 또는 칩 UI, 최대 10개 | Should | 🔲 |
| FR-08 | 외부 링크 (블로그, 인스타, 웹사이트) — 선택 | Could | 🔲 |
| FR-09 | 생성 완료 시 `/spot/[slug]`로 리다이렉트 + 성공 토스트 | Must | 🔲 |
| FR-10 | FloatingCreateButton에 Spot/SpotLine 선택 옵션 추가 | Should | 🔲 |

### 3.2 Non-Functional Requirements

| Category | Criteria |
|---|---|
| 성능 | 폼 제출 후 3초 이내 응답 |
| 접근성 | 모바일 퍼스트 반응형 레이아웃 |
| 유효성 검사 | 클라이언트 사이드 + 서버 에러 핸들링 |
| UX | 로딩 상태, 에러 메시지 한국어 표시 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] `/create-spot` 페이지에서 Spot 생성 가능
- [x] 생성된 Spot이 `/spot/[slug]`에서 정상 표시
- [x] 사진 업로드 정상 동작
- [x] AuthGuard로 비인증 유저 차단
- [x] 모바일/데스크톱 반응형 동작

### 4.2 Quality Criteria

- [x] 기존 컴포넌트(SpotPhotoUpload, AuthGuard) 재활용
- [x] admin SpotFormPanel과 일관된 데이터 구조
- [x] cn() 유틸리티, Tailwind CSS 4 컨벤션 준수

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| 스팸 Spot 등록 | 높음 | 중간 | 인증 필수 + 향후 신고/모더레이션 기능 추가 |
| 부정확한 주소/좌표 | 중간 | 낮음 | Daum Postcode API로 정확한 geocoding 보장 |
| 대용량 이미지 업로드 실패 | 중간 | 낮음 | Presigned URL 패턴 검증 완료 (기존 구현) |

---

## 6. Implementation Items

| # | Item | Files | Description |
|---|---|---|---|
| 1 | CreateSpotRequest 타입 추가 | `src/types/index.ts` | 백엔드 DTO 매칭 타입 정의 |
| 2 | createSpot() API 함수 | `src/lib/api.ts` | POST /api/v2/spots 호출 함수 |
| 3 | SpotCreateForm 컴포넌트 | `src/components/spot/SpotCreateForm.tsx` (NEW) | 유저용 Spot 생성 폼 |
| 4 | AddressSearch 컴포넌트 | `src/components/spot/AddressSearch.tsx` (NEW) | Daum Postcode 통합 |
| 5 | CategorySelector 컴포넌트 | `src/components/spot/CategorySelector.tsx` (NEW) | 카테고리 선택 칩 UI |
| 6 | TagInput 컴포넌트 | `src/components/spot/TagInput.tsx` (NEW) | 태그 입력 칩 UI |
| 7 | /create-spot 페이지 | `src/app/create-spot/page.tsx` (NEW) | AuthGuard + SpotCreateForm |
| 8 | FloatingCreateButton 수정 | `src/components/common/FloatingCreateButton.tsx` (MODIFY) | Spot/SpotLine 선택 메뉴 |

---

## 7. Architecture Considerations

### 7.1 Project Level

- **Level**: Dynamic (BaaS 기반 풀스택)
- **Pattern**: 기존 create-spotline 페이지와 동일한 아키텍처

### 7.2 Key Decisions

| Decision | Choice | Reason |
|---|---|---|
| 주소 입력 방식 | Daum Postcode API | admin에서 검증된 방식, 정확한 geocoding |
| 폼 상태 관리 | React useState | 단순 폼이므로 별도 라이브러리 불필요 |
| 유효성 검사 | 클라이언트 사이드 | 서버 에러도 handleApiError로 처리 |
| source 값 | "USER" 고정 | 유저 생성 Spot은 항상 USER |
| Place API 연동 | 제외 | 크루 전용, 유저는 직접 정보 입력 |

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 0.1 | 2026-04-13 | Initial planning document |
