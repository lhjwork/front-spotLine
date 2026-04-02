# mobile-app-conversion Design Document

> **Summary**: Spotline 웹 플랫폼을 React Native (Expo) 크로스플랫폼 앱으로 전환
>
> **Project**: Spotline
> **Date**: 2026-04-02
> **Status**: Draft
> **Planning Doc**: [mobile-app-conversion.plan.md](../../01-plan/features/mobile-app-conversion.plan.md)

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 웹 전용 플랫폼으로 푸시 알림, 오프라인 접근, QR 카메라 네이티브 통합 불가 |
| **Solution** | Expo Router + NativeWind 기반 앱. 웹 API/타입/스토어 코드 최대 재사용 |
| **Function/UX Effect** | 네이티브 QR 스캔, 푸시 알림, 부드러운 네비게이션, 오프라인 Spot/Route |
| **Core Value** | 사용자 리텐션 향상, 앱스토어 발견성, QR 원클릭 경험 |

---

## 1. Overview

### 1.1 Design Goals

- 웹 코드 최대 재사용 (타입, API 레이어, Zustand 스토어, 유틸리티)
- Expo Router로 Next.js App Router와 유사한 파일 기반 라우팅
- NativeWind v4로 Tailwind CSS 클래스 재사용
- 네이티브 전용 기능 (카메라 QR, 푸시, 오프라인) 추가

### 1.2 Design Principles

- **Code Reuse First**: 웹에서 검증된 코드를 그대로 가져오되, RN 호환 불가한 부분만 변환
- **Native Feel**: 웹뷰가 아닌 네이티브 컴포넌트로 플랫폼 규범 준수
- **Offline First**: 저장된 Spot/Route는 네트워크 없이 접근 가능
- **Progressive Enhancement**: 핵심 기능 먼저 → 푸시/오프라인은 후속 단계

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   app-spotLine                       │
│              (Expo / React Native)                   │
├─────────────────────────────────────────────────────┤
│  Expo Router (파일 기반 라우팅 + 딥링크)              │
│  NativeWind v4 (Tailwind CSS → Native StyleSheet)    │
│  Zustand (웹과 동일한 스토어)                         │
│  Axios + TanStack Query (API 캐싱/재시도)            │
├─────────────────────────────────────────────────────┤
│  expo-camera (QR 스캔)                               │
│  expo-notifications (푸시 알림)                      │
│  expo-sqlite (오프라인 저장)                         │
│  expo-image (이미지 캐싱)                            │
│  expo-location (위치 서비스)                         │
│  react-native-maps (지도)                            │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────────┐
│         springboot-spotLine-backend                  │
│      (Spring Boot 3.5 + PostgreSQL + Supabase)       │
│      기존 API 100% 재사용 — 변경 없음                 │
└─────────────────────────────────────────────────────┘
```

### 2.2 Web → App 코드 재사용 전략

| 계층 | 웹 (front-spotLine) | 앱 (app-spotLine) | 재사용 |
|------|--------------------|--------------------|--------|
| Types | `src/types/index.ts` | `types/index.ts` | 100% 복사 |
| API Client | `src/lib/api.ts` | `lib/api.ts` | 95% (환경변수만 변경) |
| Zustand Stores | `src/store/*.ts` | `store/*.ts` | 90% (localStorage → AsyncStorage) |
| Utilities | `src/lib/utils.ts` | `lib/utils.ts` | 80% (cn() → NativeWind cn) |
| Components | `src/components/**` | `components/**` | 0% (네이티브 컴포넌트로 재작성) |
| Pages/Routing | `src/app/**` | `app/**` | 0% (Expo Router로 재작성) |
| Styling | Tailwind CSS 4 | NativeWind v4 | 70% (클래스명 재사용, 일부 변환) |

### 2.3 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| expo | ~53 | 프레임워크 |
| expo-router | ~4 | 파일 기반 라우팅 |
| nativewind | ~4 | Tailwind CSS for RN |
| zustand | ~5 | 상태 관리 (웹과 동일) |
| axios | ~1 | HTTP 클라이언트 (웹과 동일) |
| @tanstack/react-query | ~5 | API 캐싱/재시도 |
| expo-camera | ~16 | QR 스캔 |
| expo-notifications | ~0.30 | 푸시 알림 |
| expo-sqlite | ~15 | 오프라인 저장 |
| expo-image | ~2 | 이미지 캐싱 |
| expo-location | ~18 | 위치 서비스 |
| react-native-maps | ~1.20 | 지도 표시 |
| expo-linking | ~7 | 딥링크 |
| expo-secure-store | ~14 | 인증 토큰 저장 |
| react-native-reanimated | ~3 | 애니메이션 |
| react-native-gesture-handler | ~2 | 제스처 (스와이프) |

---

## 3. Navigation Structure

### 3.1 Expo Router File Structure

```
app/
├── _layout.tsx                    # Root Layout (QueryClient, Auth Provider)
├── (tabs)/                        # Tab Navigator
│   ├── _layout.tsx                # Tab bar 설정
│   ├── index.tsx                  # Discover (홈)
│   ├── feed.tsx                   # 피드
│   ├── scan.tsx                   # QR 스캔 (카메라)
│   ├── saves.tsx                  # 저장 목록
│   └── profile.tsx                # 내 프로필
├── spot/
│   └── [slug].tsx                 # Spot 상세
├── route/
│   └── [slug].tsx                 # Route 상세
├── city/
│   └── [name].tsx                 # 도시별 탐색
├── theme/
│   └── [name].tsx                 # 테마별 탐색
├── profile/
│   └── [userId].tsx               # 다른 유저 프로필
├── my-routes.tsx                  # 내 Route 목록
├── auth/
│   └── callback.tsx               # OAuth 콜백
└── +not-found.tsx                 # 404
```

### 3.2 Tab Navigator 설정

```
┌────────────────────────────────────┐
│                                    │
│         Screen Content             │
│                                    │
├──────┬──────┬──────┬──────┬──────┤
│  홈  │ 피드 │ 스캔 │ 저장 │ 프로필│
│  🏠  │  📋  │  📷  │  ♡  │  👤  │
└──────┴──────┴──────┴──────┴──────┘
```

| Tab | Icon | Screen | 웹 대응 |
|-----|------|--------|---------|
| 홈 | Home | Discover | `/` |
| 피드 | List | Feed | `/feed` |
| 스캔 | Camera | QR Scanner | `/qr/[qrId]` |
| 저장 | Heart | Saves | `/saves` |
| 프로필 | User | Profile | `/profile/me` |

### 3.3 Stack Navigation (상세 화면)

```
Tab Screen
  └── Stack.Screen: spot/[slug]     (push)
  └── Stack.Screen: route/[slug]    (push)
  └── Stack.Screen: city/[name]     (push)
  └── Stack.Screen: theme/[name]    (push)
  └── Stack.Screen: profile/[userId] (push)
  └── Stack.Screen: my-routes       (push)
```

### 3.4 딥링크 설정

| Web URL | App Scheme | Screen |
|---------|------------|--------|
| `spotline.app/spot/{slug}` | `spotline://spot/{slug}` | Spot 상세 |
| `spotline.app/route/{slug}` | `spotline://route/{slug}` | Route 상세 |
| `spotline.app/feed` | `spotline://feed` | 피드 |
| `spotline.app/qr/{qrId}` | `spotline://scan?qr={qrId}` | QR → Spot 전환 |

---

## 4. Screen Specifications

### 4.1 Discover (홈) — `(tabs)/index.tsx`

**웹 대응**: `app/page.tsx` + `components/discover/*` (8 컴포넌트)

**네이티브 컴포넌트**:

| 컴포넌트 | 역할 | 웹 원본 |
|----------|------|---------|
| `DiscoverScreen` | 메인 화면 컨테이너 | `DiscoverPage` |
| `LocationHeader` | 현재 위치 표시 | `LocationHeader` |
| `LocationBanner` | 위치 권한 요청 배너 | `LocationPermissionBanner` |
| `NearbySpotScroll` | 주변 Spot 가로 스크롤 | `NearbySpotScroll` |
| `PopularRoutesList` | 인기 Route 리스트 | `PopularRoutesList` |

**데이터 흐름**:
```
useQuery('discover', () => fetchDiscover(lat, lng))
  → useDiscoverStore에 캐싱
  → 위치 변경 시 자동 refetch
```

**위치 권한**: `expo-location` → `requestForegroundPermissionsAsync()`

### 4.2 Feed — `(tabs)/feed.tsx`

**웹 대응**: `app/feed/page.tsx` + `components/feed/*` (10 컴포넌트)

**네이티브 컴포넌트**:

| 컴포넌트 | 역할 |
|----------|------|
| `FeedScreen` | 메인 컨테이너 |
| `FeedAreaTabs` | 지역 탭 (성수, 을지로, 연남...) |
| `FeedCategoryChips` | 카테고리 필터 칩 |
| `FeedSpotGrid` | Spot 카드 그리드 (2열) |
| `FeedRouteSection` | Route 가로 스크롤 섹션 |
| `SpotCard` | 개별 Spot 카드 |
| `RoutePreviewCard` | 개별 Route 카드 |

**무한 스크롤**: `FlatList` + `onEndReached` + `useInfiniteQuery`

**당겨서 새로고침**: `RefreshControl` 네이티브 컴포넌트

### 4.3 QR Scan — `(tabs)/scan.tsx`

**웹 대응**: `app/qr/[qrId]/page.tsx` (웹에서는 URL 직접 접근)

**네이티브 전용 구현**:

```
┌─────────────────────────────┐
│      카메라 뷰파인더         │
│                             │
│     ┌───────────────┐       │
│     │   QR 프레임    │       │
│     │   (가이드)     │       │
│     └───────────────┘       │
│                             │
│  "QR 코드를 프레임 안에      │
│   맞춰주세요"               │
│                             │
│  [수동 입력] [플래시 토글]   │
└─────────────────────────────┘
```

**스캔 플로우**:
```
expo-camera (barcode scan)
  → QR 데이터 파싱
  → resolveQrToSpot(qrId)
  → recordQrScan(qrId, sessionId)  // fire-and-forget
  → router.push(`/spot/${slug}?qr=${qrId}`)
```

**권한 처리**:
- 카메라 권한 거부 시 → 수동 QR 코드 입력 폴백
- `Camera.requestCameraPermissionsAsync()`

### 4.4 Spot Detail — `spot/[slug].tsx`

**웹 대응**: `app/spot/[slug]/page.tsx` + `components/spot/*` (9 컴포넌트)

**네이티브 컴포넌트**:

| 컴포넌트 | 역할 | 웹 원본 |
|----------|------|---------|
| `SpotDetailScreen` | ScrollView 컨테이너 | `page.tsx` |
| `SpotHero` | Hero 이미지 + info 카드 | `SpotHero` |
| `SpotImageGallery` | 이미지 갤러리 (스와이프) | `SpotImageGallery` |
| `SpotCrewNote` | 크루 추천 노트 | `SpotCrewNote` |
| `SpotPlaceInfo` | Place API 상세 정보 | `SpotPlaceInfo` |
| `SpotNearby` | 주변 Spot 가로 스크롤 | `SpotNearby` |
| `SpotRoutes` | 이 Spot 포함 Route | `SpotRoutes` |
| `PartnerBadge` | 파트너 배지 | `PartnerBadge` |
| `PartnerBenefit` | 파트너 혜택 | `PartnerBenefit` |
| `SpotBottomBar` | 하단 액션 바 | `SpotBottomBar` |

**데이터 페칭**:
```typescript
const { data: spot } = useQuery({
  queryKey: ['spot', slug],
  queryFn: () => fetchSpotDetail(slug),
});
```

**갤러리**: `react-native-gesture-handler` 스와이프 + `expo-image` 캐싱

**하단 바**: `position: absolute, bottom: 0` + SafeAreaView

### 4.5 Route Detail — `route/[slug].tsx`

**웹 대응**: `app/route/[slug]/page.tsx` + `components/route/*` (10 컴포넌트)

**네이티브 컴포넌트**:

| 컴포넌트 | 역할 |
|----------|------|
| `RouteDetailScreen` | ScrollView 컨테이너 |
| `RouteHeader` | 제목, 테마 배지, 크리에이터 |
| `RouteTimeline` | 세로 타임라인 (Spot 순서) |
| `RouteTimelineItem` | 개별 Spot 아이템 |
| `RouteMapPreview` | 지도에 Spot 마커 + 연결선 |
| `RouteVariations` | Route 변형 목록 |
| `RouteBottomBar` | 저장/좋아요/복제 버튼 |
| `ReplicateRouteSheet` | 복제 바텀시트 |

**지도**: `react-native-maps` MapView + Marker + Polyline

### 4.6 Saves — `(tabs)/saves.tsx`

**웹 대응**: `app/saves/page.tsx` + `components/social/SavesList`

**구조**:
- 세그먼트 탭: "Spots" | "Routes"
- `FlatList` + 무한 스크롤
- 인증 필요 → 미인증 시 로그인 시트

### 4.7 Profile — `(tabs)/profile.tsx` & `profile/[userId].tsx`

**웹 대응**: `app/profile/me/page.tsx`, `app/profile/[userId]/page.tsx`

**네이티브 컴포넌트**:

| 컴포넌트 | 역할 |
|----------|------|
| `ProfileHeader` | 아바타, 닉네임, 통계, 팔로우 버튼 |
| `ProfileTabs` | 저장/좋아요/Route 탭 |
| `FollowListSheet` | 팔로워/팔로잉 바텀시트 |

### 4.8 City/Theme — `city/[name].tsx`, `theme/[name].tsx`

**웹 대응**: `app/city/[name]/page.tsx`, `app/theme/[name]/page.tsx`

**구현**: Feed와 유사한 구조, 필터가 사전 적용된 상태

---

## 5. Shared Components

### 5.1 공통 UI 컴포넌트

| 컴포넌트 | 파일 | 역할 |
|----------|------|------|
| `Button` | `components/common/Button.tsx` | 범용 버튼 (variants: primary, secondary, ghost) |
| `Loading` | `components/common/Loading.tsx` | 스피너 + 스켈레톤 |
| `AppImage` | `components/common/AppImage.tsx` | expo-image 래퍼 (캐싱, 폴백) |
| `BottomSheet` | `components/common/BottomSheet.tsx` | 바텀시트 모달 |
| `EmptyState` | `components/common/EmptyState.tsx` | 빈 상태 UI |
| `ErrorView` | `components/common/ErrorView.tsx` | 에러 표시 + 재시도 |

### 5.2 소셜 컴포넌트

| 컴포넌트 | 파일 | 역할 |
|----------|------|------|
| `LikeButton` | `components/social/LikeButton.tsx` | 좋아요 토글 (애니메이션) |
| `SaveButton` | `components/social/SaveButton.tsx` | 저장 토글 |
| `FollowButton` | `components/social/FollowButton.tsx` | 팔로우/언팔로우 |
| `SocialBar` | `components/social/SocialBar.tsx` | 좋아요+저장 카운트 바 |

### 5.3 카드 컴포넌트

| 컴포넌트 | 파일 | 역할 |
|----------|------|------|
| `SpotCard` | `components/spot/SpotCard.tsx` | Spot 카드 (이미지, 제목, 카테고리) |
| `SpotMiniCard` | `components/spot/SpotMiniCard.tsx` | 컴팩트 Spot 카드 |
| `RouteCard` | `components/route/RouteCard.tsx` | Route 카드 (테마, Spot 수) |
| `MyRouteCard` | `components/route/MyRouteCard.tsx` | 내 Route 카드 (상태 표시) |

---

## 6. Data Layer

### 6.1 API Client (웹에서 재사용)

```typescript
// lib/api.ts — 웹 코드 기반, 최소 변경

// 변경점:
// 1. 환경변수: NEXT_PUBLIC_API_BASE_URL → EXPO_PUBLIC_API_BASE_URL
// 2. 타임아웃: 동일 유지
// 3. 에러 핸들링: 동일 유지

import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const apiV2 = axios.create({
  baseURL: `${API_BASE_URL}/api/v2`,
  headers: { "Content-Type": "application/json" },
});

// 모든 API 함수 웹에서 그대로 복사
// fetchSpotDetail, fetchRouteDetail, fetchFeedSpots,
// fetchDiscover, toggleLike, toggleSave, followUser, etc.
```

### 6.2 TanStack Query 설정

```typescript
// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5분
      gcTime: 30 * 60 * 1000,         // 30분
      retry: 2,
      refetchOnWindowFocus: false,     // 앱에서는 불필요
    },
  },
});
```

### 6.3 Zustand Store 변환

```typescript
// store/useAuthStore.ts — 변경점: localStorage → expo-secure-store

import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

// 웹: localStorage.setItem("spotline_auth", JSON.stringify(data))
// 앱: SecureStore.setItemAsync("spotline_auth", JSON.stringify(data))

// 나머지 5개 스토어 (Discover, Feed, Social, Spotline)는 변경 없이 재사용
```

### 6.4 오프라인 저장소

```typescript
// lib/storage.ts — expo-sqlite 기반

import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("spotline.db");

// 테이블
// saved_spots: id, slug, data(JSON), savedAt
// saved_routes: id, slug, data(JSON), savedAt

export async function saveSpotOffline(spot: SpotDetailResponse): Promise<void>;
export async function getOfflineSpot(slug: string): Promise<SpotDetailResponse | null>;
export async function saveRouteOffline(route: RouteDetailResponse): Promise<void>;
export async function getOfflineRoute(slug: string): Promise<RouteDetailResponse | null>;
export async function clearOfflineData(): Promise<void>;
```

---

## 7. Native Features

### 7.1 QR Scanner (expo-camera)

```typescript
// components/scan/QrScanner.tsx

import { CameraView, useCameraPermissions } from "expo-camera";

interface QrScannerProps {
  onScan: (qrId: string) => void;
}

// 스캔 후 자동 네비게이션:
// 1. QR 데이터에서 qrId 추출
// 2. resolveQrToSpot(qrId) → slug 획득
// 3. recordQrScan(qrId, sessionId) — fire-and-forget
// 4. router.push(`/spot/${slug}?qr=${qrId}`)
// 5. 진동 피드백 (Haptics.impactAsync)
```

### 7.2 Push Notifications (expo-notifications)

```typescript
// lib/notifications.ts

import * as Notifications from "expo-notifications";

// 1. 앱 시작 시 registerForPushNotificationsAsync()
// 2. Expo Push Token → 백엔드 등록 (새 API 필요)
// 3. 알림 종류:
//    - 팔로우한 크루의 새 Route
//    - 저장한 Spot 업데이트
//    - 내 Route 리마인더 (예약일 당일)
// 4. 알림 탭 → 딥링크로 해당 화면 이동
```

**백엔드 추가 API 필요**:
```
POST /api/v2/devices/register   { pushToken, platform }
DELETE /api/v2/devices/{token}
```

### 7.3 Location (expo-location)

```typescript
// hooks/useLocation.ts — 웹 useGeolocation 대체

import * as Location from "expo-location";

// 웹: navigator.geolocation.getCurrentPosition()
// 앱: Location.requestForegroundPermissionsAsync()
//     Location.getCurrentPositionAsync()

// 동일한 인터페이스 유지:
// { coordinates: {lat, lng}, status, error, requestLocation }
```

---

## 8. Styling Strategy (NativeWind)

### 8.1 웹 → 네이티브 클래스 매핑

| 웹 Tailwind | NativeWind 대응 | 비고 |
|-------------|----------------|------|
| `flex` | `flex` | 동일 |
| `grid grid-cols-2` | `flex flex-row flex-wrap` | Grid 미지원 → Flex로 변환 |
| `overflow-x-auto` | `<ScrollView horizontal>` | 컴포넌트 변환 필요 |
| `fixed bottom-0` | `absolute bottom-0` | position: fixed 미지원 |
| `animate-[fadeInUp]` | `Animated.View` | CSS 애니메이션 → Reanimated |
| `backdrop-blur-sm` | `BlurView` | expo-blur 필요 |
| `line-clamp-2` | `numberOfLines={2}` | Text prop |
| `hover:bg-gray-100` | `Pressable + onPressIn` | 터치 피드백으로 변환 |
| `pb-[env(safe-area)]` | `<SafeAreaView>` | expo-safe-area-context |

### 8.2 색상 체계 (웹과 동일)

```typescript
// tailwind.config.ts (NativeWind)
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",     // blue-600
        background: "#ffffff",
        foreground: "#171717",
      },
    },
  },
};
```

### 8.3 애니메이션 변환

| 웹 (CSS) | 앱 (Reanimated) |
|----------|----------------|
| `animate-[fadeInUp_0.4s]` | `FadeInUp.duration(400)` (entering) |
| `animate-[fadeIn_0.2s]` | `FadeIn.duration(200)` (entering) |
| `animate-slide-up` | `SlideInUp.duration(300)` (entering) |
| `transition-all duration-200` | `useAnimatedStyle` + `withTiming(200)` |
| `animate-pulse` | `useAnimatedStyle` + `withRepeat(withTiming)` |

---

## 9. Implementation Order

| Step | 파일/모듈 | 설명 | 의존성 |
|------|----------|------|--------|
| 1 | 프로젝트 초기 설정 | `npx create-expo-app`, NativeWind, Zustand, Axios | 없음 |
| 2 | `app/_layout.tsx` | Root Layout, QueryClient, Auth Provider | Step 1 |
| 3 | `types/index.ts` | 웹에서 타입 복사 | Step 1 |
| 4 | `lib/api.ts` | 웹에서 API 복사 + 환경변수 변경 | Step 3 |
| 5 | `store/*.ts` | Zustand 스토어 복사 + SecureStore 변환 | Step 3 |
| 6 | `components/common/*` | Button, Loading, AppImage, BottomSheet | Step 1 |
| 7 | `app/(tabs)/_layout.tsx` | Tab Navigator 설정 | Step 2 |
| 8 | `app/(tabs)/index.tsx` | Discover 화면 | Step 4, 6 |
| 9 | `app/(tabs)/feed.tsx` | Feed 화면 + 무한 스크롤 | Step 4, 6 |
| 10 | `app/spot/[slug].tsx` | Spot 상세 + 갤러리 | Step 4, 6 |
| 11 | `app/route/[slug].tsx` | Route 상세 + 타임라인 + 지도 | Step 4, 6 |
| 12 | `components/social/*` | 좋아요/저장/팔로우 컴포넌트 | Step 5 |
| 13 | `app/(tabs)/scan.tsx` | QR 스캔 카메라 | Step 4 |
| 14 | `app/(tabs)/saves.tsx` | 저장 목록 | Step 5, 12 |
| 15 | `app/(tabs)/profile.tsx` | 프로필 화면 | Step 5, 12 |
| 16 | `app/city/[name].tsx` | 도시별 탐색 | Step 9 |
| 17 | `app/theme/[name].tsx` | 테마별 탐색 | Step 9 |
| 18 | `lib/notifications.ts` | 푸시 알림 설정 | Step 2 |
| 19 | `lib/storage.ts` | 오프라인 저장 (SQLite) | Step 3 |
| 20 | 딥링크 + EAS Build | 앱 링크, 빌드 설정 | Step 1~19 |

---

## 10. Component Tree

```
app/_layout.tsx (QueryClientProvider, AuthProvider)
├── (tabs)/_layout.tsx (BottomTabNavigator)
│   ├── index.tsx (Discover)
│   │   ├── LocationHeader
│   │   ├── LocationBanner (조건부)
│   │   ├── NearbySpotScroll → SpotCard[]
│   │   └── PopularRoutesList → RouteCard[]
│   ├── feed.tsx (Feed)
│   │   ├── FeedAreaTabs
│   │   ├── FeedCategoryChips
│   │   ├── FeedRouteSection → RouteCard[]
│   │   └── FeedSpotGrid (FlatList) → SpotCard[]
│   ├── scan.tsx (QR Scanner)
│   │   └── QrScanner (CameraView)
│   ├── saves.tsx (Saves)
│   │   ├── SegmentTabs ("Spots" | "Routes")
│   │   └── FlatList → SpotCard[] | RouteCard[]
│   └── profile.tsx (My Profile)
│       ├── ProfileHeader
│       ├── ProfileTabs
│       └── FollowListSheet (BottomSheet)
├── spot/[slug].tsx (Spot Detail)
│   ├── SpotHero (expo-image + info card)
│   ├── PartnerBadge + PartnerBenefit (조건부)
│   ├── SpotCrewNote
│   ├── SpotPlaceInfo
│   ├── SpotImageGallery (스와이프)
│   ├── SpotRoutes → RouteCard[]
│   ├── SpotNearby → SpotMiniCard[]
│   └── SpotBottomBar (좋아요/저장/지도)
├── route/[slug].tsx (Route Detail)
│   ├── RouteHeader
│   ├── RouteTimeline → RouteTimelineItem[]
│   ├── RouteMapPreview (MapView)
│   ├── RouteVariations → RouteCard[]
│   ├── RouteBottomBar (좋아요/저장/복제)
│   └── ReplicateRouteSheet (BottomSheet)
├── city/[name].tsx
├── theme/[name].tsx
├── profile/[userId].tsx
└── my-routes.tsx → MyRouteCard[]
```

---

## 11. Verification Criteria

| # | 항목 | 기대 결과 |
|---|------|-----------|
| 1 | 프로젝트 빌드 | iOS/Android 시뮬레이터 실행 성공 |
| 2 | Tab 네비게이션 | 5개 탭 전환 정상 |
| 3 | Discover 화면 | 위치 권한 → 주변 Spot/Route 표시 |
| 4 | Feed 무한 스크롤 | 60fps, 당겨서 새로고침 |
| 5 | QR 스캔 | 카메라 → QR 인식 → Spot 상세 1초 내 전환 |
| 6 | Spot 상세 | Hero + Gallery 스와이프 + PlaceInfo + Nearby |
| 7 | Route 상세 | Timeline + MapView + 복제 기능 |
| 8 | 소셜 기능 | 좋아요/저장/팔로우 즉시 반영 (optimistic) |
| 9 | 프로필 | 내 프로필 + 다른 유저 프로필 |
| 10 | 저장 목록 | Spot/Route 탭 전환 + 무한 스크롤 |
| 11 | 딥링크 | 웹 URL → 앱 화면 전환 |
| 12 | 오프라인 | 비행기 모드에서 저장된 Spot 접근 |
| 13 | 푸시 알림 | 백그라운드 알림 수신 |
| 14 | TypeScript | `tsc --noEmit` 에러 0 |

---

## 12. Out of Scope

- 웹 플랫폼(front-spotLine) 변경
- Backend API 변경 (푸시 토큰 등록 API 1개만 추가)
- Admin 앱
- 실시간 채팅, AR/VR, 결제
- iPad/태블릿 최적화 (1차)
- 다크 모드 (1차)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-02 | Initial draft | Claude |
