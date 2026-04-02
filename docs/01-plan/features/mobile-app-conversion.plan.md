# mobile-app-conversion Plan

> **Summary**: 웹 플랫폼을 React Native(Expo) 모바일 앱으로 전환
>
> **Project**: Spotline
> **Date**: 2026-04-02
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 웹 전용 플랫폼으로 푸시 알림, 오프라인 접근, QR 카메라 네이티브 통합 불가. 앱스토어 노출 및 홈화면 설치 경험 부재 |
| **Solution** | React Native (Expo) 기반 크로스플랫폼 앱. 기존 Spring Boot API 100% 재사용, 웹 UI 패턴을 네이티브 컴포넌트로 변환 |
| **Function/UX Effect** | 네이티브 QR 스캔, 푸시 알림(새 Route/팔로우), 부드러운 네비게이션 전환, 오프라인 저장된 Spot/Route 접근 |
| **Core Value** | 사용자 리텐션 향상(푸시), 앱스토어 발견성, QR 스캔 원클릭 경험, 모바일 퍼스트 플랫폼 완성 |

---

## 1. Overview

### 1.1 Purpose

Phase 1~8이 완료된 웹 플랫폼(front-spotLine)을 모바일 앱으로 전환하여:
- QR 스캔 → 카메라 네이티브 통합 (웹 브라우저 의존 제거)
- 푸시 알림으로 사용자 재방문 유도
- 앱스토어(iOS/Android) 배포로 발견성 확보
- 오프라인 저장으로 이동 중 경험 코스 접근

### 1.2 Background

- 웹 플랫폼 Phase 1~8 완료, 모든 핵심 기능 구현됨
- Backend API (Spring Boot 3.5) 100% 준비 — Spot/Route CRUD, Feed, Social, QR, Partner
- 현재 웹은 모바일 퍼스트 반응형으로 설계되어 UI 패턴 재활용 가능
- CLAUDE.md에 Phase 9로 "App 전환" 명시

### 1.3 Related Documents

- `front-spotLine/docs/01-plan/features/experience-social-platform.plan.md` — 전체 Plan
- `docs/BUSINESS_PLAN.md` — 사업계획서
- `docs/API_DOCUMENTATION.md` — API 문서

---

## 2. Scope

### 2.1 In Scope

- [ ] Expo (React Native) 프로젝트 초기 설정 및 레포 생성
- [ ] 네비게이션 구조 (Tab + Stack Navigator)
- [ ] Spot 상세 화면 (웹 `/spot/[slug]` 변환)
- [ ] Route 상세 화면 (웹 `/route/[slug]` 변환)
- [ ] 피드/탐색 화면 (웹 `/feed`, `/city`, `/theme` 변환)
- [ ] QR 스캔 카메라 네이티브 통합
- [ ] 소셜 기능 (좋아요, 저장, 팔로우)
- [ ] 사용자 프로필 화면
- [ ] 푸시 알림 (Expo Notifications)
- [ ] 오프라인 저장 (AsyncStorage/SQLite)
- [ ] 딥링크 (웹 URL → 앱 화면)
- [ ] iOS/Android 앱스토어 배포

### 2.2 Out of Scope

- 웹 플랫폼 변경 (front-spotLine 유지)
- Backend API 수정 (기존 API 그대로 사용)
- Admin 앱 (admin-spotLine은 웹 유지)
- 실시간 채팅/메시징
- AR/VR 경험 기능
- 결제 시스템

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | QR 코드 카메라 스캔 → Spot 상세 화면 네이티브 전환 | High | Pending |
| FR-02 | 피드 화면: 무한 스크롤, 필터(도시/테마), 당겨서 새로고침 | High | Pending |
| FR-03 | Spot 상세: Hero 이미지, 갤러리, CrewNote, PlaceInfo, Nearby | High | Pending |
| FR-04 | Route 상세: Spot 리스트, 지도 오버뷰, 복제 기능 | High | Pending |
| FR-05 | 소셜: 좋아요, 저장, 팔로우/언팔로우, 내 저장 목록 | High | Pending |
| FR-06 | 푸시 알림: 새 Route 발행, 팔로우한 크루 업데이트 | Medium | Pending |
| FR-07 | 오프라인: 저장한 Spot/Route 오프라인 접근 | Medium | Pending |
| FR-08 | 딥링크: `spotline.app/spot/slug` → 앱 내 화면 | Medium | Pending |
| FR-09 | 사용자 프로필: 내 활동, 저장 목록, 팔로잉 | Medium | Pending |
| FR-10 | 지도 연동: 카카오/구글/네이버 지도 앱 연결 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 앱 시작 ~2초, 화면 전환 ~300ms | Expo Performance Monitor |
| Size | APK < 30MB, IPA < 50MB | 빌드 결과 확인 |
| Offline | 저장된 콘텐츠 네트워크 없이 접근 가능 | 비행기 모드 테스트 |
| Compatibility | iOS 15+, Android 10+ | 디바이스 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] iOS/Android 시뮬레이터에서 전체 플로우 동작
- [ ] QR 스캔 → Spot 상세 전환 성공
- [ ] 피드 무한 스크롤 정상 작동
- [ ] 푸시 알림 수신 확인
- [ ] TestFlight/내부 테스트 배포 완료
- [ ] 앱스토어 심사 제출 준비

### 4.2 Quality Criteria

- [ ] TypeScript strict 모드
- [ ] 빌드 에러 0
- [ ] 주요 화면 로딩 < 2초

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 앱스토어 심사 거절 | High | Medium | Apple 가이드라인 사전 검토, 테스트 계정 준비 |
| 네이티브 모듈 호환성 | Medium | Medium | Expo SDK 기반으로 관리형 워크플로우 우선 |
| 이미지 성능 (갤러리) | Medium | Low | expo-image (SWR 캐싱) 사용, 썸네일 최적화 |
| QR 스캔 권한 거부 | Low | Medium | 권한 요청 UX 설계, 수동 입력 폴백 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend | ☑ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | React Native / Flutter / Expo | **Expo (React Native)** | 웹 코드(React) 재활용 극대화, Expo Router로 파일 기반 라우팅 |
| Navigation | React Navigation / Expo Router | **Expo Router** | Next.js App Router와 유사한 파일 기반 라우팅, 딥링크 자동 지원 |
| State Management | Zustand / Redux / Jotai | **Zustand** | 웹과 동일한 상태 관리 라이브러리 재사용 |
| API Client | fetch / axios / react-query | **Axios + TanStack Query** | 웹 API 레이어 재사용, 캐싱/재시도 자동화 |
| Styling | NativeWind / StyleSheet / Tamagui | **NativeWind v4** | Tailwind CSS 문법 재사용, 웹 스타일 코드 최대 활용 |
| Image | expo-image / FastImage | **expo-image** | SWR 캐싱, 블러 해시, 자동 리사이징 |
| QR Scanner | expo-camera / expo-barcode-scanner | **expo-camera** | Camera + QR 통합, Expo SDK 관리형 |
| Push | expo-notifications / FCM+APNs | **expo-notifications** | Expo 관리형, FCM+APNs 자동 설정 |
| Storage | AsyncStorage / expo-sqlite | **expo-sqlite** | 오프라인 Spot/Route 구조적 저장 |
| Maps | react-native-maps | **react-native-maps** | 카카오/구글 지도 지원 |

### 6.3 Folder Structure

```
app-spotLine/
├── app/                          # Expo Router (파일 기반 라우팅)
│   ├── (tabs)/                   # Tab Navigator
│   │   ├── feed.tsx              # 피드/탐색
│   │   ├── scan.tsx              # QR 스캔
│   │   ├── saves.tsx             # 저장 목록
│   │   └── profile.tsx           # 프로필
│   ├── spot/[slug].tsx           # Spot 상세
│   ├── route/[slug].tsx          # Route 상세
│   ├── city/[name].tsx           # 도시별
│   ├── theme/[name].tsx          # 테마별
│   └── _layout.tsx               # Root Layout
├── components/                   # UI 컴포넌트
│   ├── common/                   # Button, Loading, Image
│   ├── spot/                     # SpotHero, SpotCard, SpotNearby
│   ├── route/                    # RouteCard, RouteTimeline
│   ├── feed/                     # FeedCard, FeedFilter
│   └── social/                   # LikeButton, FollowButton
├── lib/                          # 유틸리티
│   ├── api.ts                    # API 클라이언트 (웹에서 재사용)
│   ├── storage.ts                # 오프라인 저장 헬퍼
│   └── notifications.ts         # 푸시 알림 헬퍼
├── store/                        # Zustand 스토어 (웹에서 재사용)
├── types/                        # TypeScript 타입 (웹에서 재사용)
├── constants/                    # 상수, 테마
└── assets/                       # 이미지, 폰트
```

---

## 7. Implementation Steps

| Step | 작업 | 설명 |
|------|------|------|
| 1 | 프로젝트 초기 설정 | Expo 프로젝트 생성, NativeWind, Zustand, Axios 설정 |
| 2 | 네비게이션 구조 | Tab Navigator + Stack 라우팅, 딥링크 설정 |
| 3 | API 레이어 | 웹 api.ts 변환, TanStack Query 연동 |
| 4 | 공통 컴포넌트 | Button, Loading, OptimizedImage → expo-image 변환 |
| 5 | 피드 화면 | FeedCard, 무한 스크롤, 필터, 당겨서 새로고침 |
| 6 | Spot 상세 화면 | Hero, Gallery, CrewNote, PlaceInfo, Nearby 변환 |
| 7 | Route 상세 화면 | Timeline, Map Overview, 복제 기능 |
| 8 | QR 스캔 | expo-camera 통합, QR → Spot 상세 전환 |
| 9 | 소셜 기능 | 좋아요, 저장, 팔로우 |
| 10 | 프로필/저장 | 사용자 프로필, 내 저장 목록, 내 Route |
| 11 | 푸시 알림 | expo-notifications 설정, 서버 토큰 등록 |
| 12 | 오프라인 저장 | expo-sqlite로 Spot/Route 캐싱 |
| 13 | 앱스토어 배포 | EAS Build, TestFlight, Play Console 설정 |

---

## 8. Verification

| # | 항목 | 기대 결과 |
|---|------|-----------|
| 1 | 앱 시작 | 스플래시 → 피드 화면 2초 이내 |
| 2 | QR 스캔 | 카메라 → QR 인식 → Spot 상세 1초 이내 전환 |
| 3 | 피드 스크롤 | 60fps 무한 스크롤, 이미지 지연 로딩 |
| 4 | Spot 상세 | Hero + Gallery + Info 정상 표시 |
| 5 | Route 상세 | Timeline + Map + 복제 정상 작동 |
| 6 | 소셜 | 좋아요/저장/팔로우 즉시 반영 |
| 7 | 푸시 | 백그라운드 알림 수신 확인 |
| 8 | 오프라인 | 비행기 모드에서 저장 콘텐츠 접근 |
| 9 | 딥링크 | 웹 URL 클릭 → 앱 내 화면 전환 |
| 10 | 빌드 | iOS/Android 빌드 에러 없음 |

---

## 9. Dependencies

- Expo SDK 53+
- NativeWind v4
- Zustand 5 (웹과 동일)
- Axios (웹과 동일)
- TanStack Query v5
- expo-camera, expo-notifications, expo-sqlite, expo-image
- react-native-maps

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-02 | Initial draft | Claude |
