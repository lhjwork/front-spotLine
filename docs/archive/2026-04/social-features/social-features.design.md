# Social Features Design Document

> **Feature**: social-features
> **Plan**: `docs/01-plan/features/social-features.plan.md`
> **Date**: 2026-04-05
> **Status**: Verified (2026-04-07 — all 11 steps implemented)

---

## 1. Architecture Overview

### 1.1 Scope

Feed/카드 레벨 소셜 인라인 액션, 팔로잉 피드 탭, Spot 공유 시트, 프로필 탭 데이터 연동.

- **수정 파일**: 6개
- **신규 파일**: 3개
- **백엔드 변경**: 0 (기존 API 활용)
- **신규 의존성**: 0

### 1.2 Backend API 확인 결과

| Feature | Endpoint | Status |
|---------|----------|--------|
| Social toggle | `POST /api/v2/spots/{id}/like`, `/save`, SpotLines 동일 | ✅ 존재 |
| Social status | `GET /api/v2/spots/{id}/social` (개별) | ✅ 존재 |
| Following list | `GET /api/v2/users/{userId}/following` (paginated) | ✅ 존재 |
| User liked spots | `GET /api/v2/users/{userId}/likes/spots` (paginated) | ✅ 존재 |
| User saved spotlines | `GET /api/v2/users/{userId}/saves/spotlines` (paginated) | ✅ 존재 |
| My SpotLines | `GET /api/v2/users/me/spotlines-created` | ✅ 존재 |
| Following feed | `GET /api/v2/feed/following` | ❌ 미존재 |
| Batch social status | 여러 item 한번에 조회 | ❌ 미존재 |

> **결정**: 팔로잉 피드는 Backend 엔드포인트가 없으므로 **클라이언트에서 following 목록 → 각 유저 프로필의 public SpotLine 조합** 방식으로 구현. 성능 이슈가 생기면 "팔로잉 피드 준비중" 안내로 fallback.
>
> **Batch social status**: 카드에서 social status를 개별 호출하면 N+1 문제 발생. **비로그인은 상태 없이 렌더링, 로그인 유저는 카드 visible 시 lazy init** 방식으로 해결.

---

## 2. Data Design

### 2.1 타입 변경

```typescript
// src/types/index.ts — 변경 없음
// FeedSort, SocialStatus, SocialToggleResponse 등 이미 정의됨
```

### 2.2 useSocialStore 확장

```typescript
// src/store/useSocialStore.ts — batch init 함수 추가

// 새로운 함수
batchInitSocialStatus: (
  items: Array<{ type: "spot" | "spotline"; id: string; likesCount: number; savesCount: number }>
) => void;
// → 로그인 유저가 Feed 로드 시 visible 카드들의 기본 count를 초기화
// → isLiked/isSaved는 false로 기본 설정 (개별 조회 없이)
// → 클릭 시 toggle API가 서버 상태를 반환하므로 정합성 유지
```

### 2.3 useFeedStore 확장

```typescript
// src/store/useFeedStore.ts — feedTab 추가

feedTab: "all" | "following";  // NEW: "all" 기본값
setFeedTab: (tab: "all" | "following") => void;  // NEW
```

**setFeedTab 로직**: tab 변�� 시 `spots: [], spotsPage: 0, hasMoreSpots: true` 리셋 (기존 setArea 패턴)

---

## 3. Component Design

### 3.1 신규 컴포넌트 (3개)

#### SocialActionButtons

```
파일: src/components/shared/SocialActionButtons.tsx
Props: {
  type: "spot" | "spotline";
  id: string;
  initialLikesCount: number;
  initialSavesCount: number;
  size?: "sm" | "md";  // sm=카드, md=상세
}

UI:
  - Heart 버튼 + count (toggle)
  - Bookmark 버튼 (toggle, count 미표시)
  - sm: h-3.5 w-3.5 아이콘, text-xs
  - md: h-4 w-4 아이콘, text-sm

동작:
  1. useSocialStore.getItem(type, id) 로 현재 상태 확��
  2. 상태 없으면 batchInitSocialStatus로 초기화 (liked=false, saved=false)
  3. 클릭 시:
     a. useAuthStore.isAuthenticated 확인
     b. 미인증 → LoginBottomSheet 표시
     c. 인증 → useSocialStore.toggleLike/toggleSave 호출
  4. e.stopPropagation() + e.preventDefault() (Link 이벤트 차단)

스타일:
  - Heart 활성: fill-red-500 text-red-500
  - Heart 비활성: text-gray-400 hover:text-red-400
  - Bookmark 활성: fill-amber-500 text-amber-500
  - Bookmark 비활성: text-gray-400 hover:text-amber-400
  - 클릭 시 scale-110 → scale-100 애니메이션 (transition)

배치: SpotPreviewCard, SpotLinePreviewCard 하단 meta 영역
```

#### FollowingFeed

```
파일: src/components/feed/FollowingFeed.tsx
Props: 없음 (useAuthStore, useFeedStore에서 상태 읽기)

UI:
  - 로그인 상태: 팔로잉 유저의 SpotLine 목록 (시간순)
  - 비로그인 상태: "로그인하고 관심 크루의 콘텐츠를 모아보세요" + 로그인 버튼
  - 팔로잉 0명: "아직 팔로우한 크루가 없어요" + 탐색 페이지 링크
  - 로딩: 스피너

데이터 플로우:
  1. useAuthStore에서 user.id 획득
  2. fetchFollowing(userId, 0, 50) → 팔로잉 유저 목록
  3. 각 유저의 SpotLine → fetchFeedSpotLines로 area 없이 전체 조회 (최신순)
  4. 결과 병합 + createdAt 정렬

대안 (간소화):
  - Backend에 following feed 없으므로, 최초 버전은 "팔로잉 중인 크루" 프로필 카드 목록으로 시작
  - 각 크루 카드 클릭 → 프로필 페이지로 이동
  - 추후 Backend에서 dedicated endpoint 추가 시 실제 피드로 전환

배치: FeedPage에서 feedTab="following" 일 때 렌더링
```

#### SpotShareSheet

```
파일: src/components/spot/SpotShareSheet.tsx
Props: {
  isOpen: boolean;
  onClose: () => void;
  spot: SpotDetailResponse;
}

UI: 기존 ShareSheet(SpotLine용)과 동일 패턴
  - 링크 복사 (spotline.kr/spot/{slug})
  - 카카오톡 공유 (title, crewNote, placeInfo.photos[0])
  - 네이티브 공유 (Web Share API)
  - 포털 렌더링 (createPortal)
  - ESC 키 닫기
  - 드래그 핸들

차��점:
  - shareUrl: `https://spotline.kr/spot/${spot.slug}`
  - shareText: spot.crewNote || spot.description
  - imageUrl: spot.mediaItems?.[0]?.url || spot.placeInfo?.photos?.[0]
  - 카카오 버튼 라벨: "장소 보기" (vs "코스 보기")

배치: SpotBottomBar에서 공유 버튼 클릭 시 표시
```

### 3.2 수정 컴포넌트 (6개)

#### SpotPreviewCard.tsx 수정

```
변경 사항:
1. SocialActionButtons import + 렌더링
2. 기존 Heart+likesCount 표시 제거 → SocialActionButtons로 대체
3. Card 하단 meta 영역에 배치 (rating, viewsCount 옆)

레이아웃 변경:
  <div className="mt-1.5 flex items-center justify-between">
    <div className="flex items-center gap-2 text-xs text-gray-400">
      {rating} {viewsCount}
    </div>
    <SocialActionButtons
      type="spot"
      id={spot.id}
      initialLikesCount={spot.likesCount}
      initialSavesCount={spot.savesCount}
      size="sm"
    />
  </div>

주의: e.stopPropagation() 필수 (Link 내부의 버튼)
```

#### SpotLinePreviewCard.tsx 수정

```
변경 사항:
1. SocialActionButtons import + 렌더링
2. 기존 Heart+likesCount 표시 제거 → SocialActionButtons로 대체

레이아웃 변경:
  <div className="mt-1 flex items-center justify-between">
    <div className="flex items-center gap-3 text-xs text-gray-500">
      {spotCount} {duration}
    </div>
    <SocialActionButtons
      type="spotline"
      id={spotLine.id}
      initialLikesCount={spotLine.likesCount}
      initialSavesCount={0}
      size="sm"
    />
  </div>
```

#### FeedPage.tsx 수정

```
변경 사항:
1. feedTab 상태 추가 (useFeedStore에서)
2. 탭 전환 UI 추가 (AreaTabs 위에 "전체" / "팔로잉" 탭)
3. feedTab === "following" 일 때 FollowingFeed 렌더링
4. feedTab === "all" 일 때 기존 피드 렌더링

레이아웃:
  ExploreNavBar
  [전체 | 팔��잉] 탭       ← NEW (FeedAreaTabs 위, ExploreNavBar 아래)
  {feedTab === "all" ? (
    FeedAreaTabs + FeedCategoryChips + SearchBar + ... 기존 피드
  ) : (
    FollowingFeed
  )}

탭 스타일:
  - 기존 ExploreNavBar의 "발견/피드" 패턴과 유사
  - 둥근 pill 버튼, 활성: bg-gray-900 text-white
  - px-4 py-2에 flex gap-2 배치
```

#### SpotBottomBar.tsx 수정

```
변경 사항:
1. SpotShareSheet import + state 추가
2. 기존 handleShare (직접 navigator.share/clipboard) → SpotShareSheet로 교체
3. showShareSheet state + SpotShareSheet 렌더링

변경 코드:
  const [showShareSheet, setShowShareSheet] = useState(false);

  // handleShare 교체
  const handleShare = () => setShowShareSheet(true);

  // 렌더링 추가
  <SpotShareSheet
    isOpen={showShareSheet}
    onClose={() => setShowShareSheet(false)}
    spot={spot}
  />
```

#### ProfileTabs.tsx 수정

```
변경 사항:
1. "내 Spot" 탭 추가 (isMe일 때): fetchMySpots API 연동
2. 기존 탭 데이터 연동은 이미 작동 (fetchUserLikedSpots, fetchUserSavedSpotLines)
3. SpotLine 탭에서 MySpotLine을 SpotLinePreviewCard로 렌더링 개선

새��운 탭 구성:
  - isMe: ["likes", "saves", "spotlines", "my-spots"]
  - !isMe: ["likes", "saves"]

"my-spots" 탭:
  - GET /api/v2/users/me/spots → fetchMySpots (새 API 함수)
  - SpotPreviewCard 그리드 렌더링

SpotLine 탭 개��:
  - 현재: 단순 div로 렌더링
  - 개선: SpotLinePreviewCard 사용 (title, area, spotCount, duration, likesCount)
  - MySpotLine → SpotLinePreview 변환 필요
```

#### useFeedStore.ts 수정

```
변경 사항:
1. feedTab state 추가 ("all" | "following")
2. setFeedTab action 추가

추가 코드:
  feedTab: "all" as "all" | "following",
  setFeedTab: (tab) => set({
    feedTab: tab,
    spots: [],
    spotsPage: 0,
    hasMoreSpots: true,
    spotLines: [],
    error: null,
  }),
```

---

## 4. API Integration

### 4.1 신규 API 함수

```typescript
// src/lib/api.ts — 추가

/** 내 Spot 목록 조회 */
export const fetchMySpots = async (
  page = 0,
  size = 20
): Promise<PaginatedResponse<SpotDetailResponse>> => {
  const { data } = await apiV2.get("/users/me/spots", { params: { page, size } });
  return data;
};

/** 팔로잉 유저 목록 (이미 존재하는지 확인) */
// fetchFollowing는 이미 존재 — line 확인 필요
```

### 4.2 기존 API 함수 (수정 없음)

```typescript
// 이미 존재하는 함수들:
toggleLike(type, id)           // POST /api/v2/{spots|spotlines}/{id}/like
toggleSave(type, id)           // POST /api/v2/{spots|spotlines}/{id}/save
fetchSocialStatus(type, id)    // GET /api/v2/{spots|spotlines}/{id}/social
fetchFollowing(userId, page, size)    // GET /api/v2/users/{userId}/following
fetchUserLikedSpots(userId, page, size)    // GET
fetchUserSavedSpotLines(userId, page, size) // GET
fetchMySpotLines()             // GET /api/v2/users/me/spotlines-created
```

---

## 5. State Flow

### 5.1 카드 소셜 액션 플로우

```
사용자 액션                     Store 변경                     API 호출
────────────────────────────────────────────────────────────────────────
카드 렌더링 (비로그인)    → 아무것도 안 함                  → 없음
                            likesCount만 표시

카드 렌더링 (로그인)      → batchInitSocialStatus          → 없음
                            (liked=false, saved=false,
                             counts from props)

Heart 클릭 (비로그인)     → LoginBottomSheet 표시           → 없음

Heart 클릭 (로그인)       → toggleLike (optimistic)         → POST /spots/{id}/like
                            liked=true, likesCount+1          → response로 count 동기화

Bookmark 클릭 (로그인)    → toggleSave (optimistic)         → POST /spots/{id}/save
                            saved=true                        → response로 동기화
```

### 5.2 팔로잉 피드 플로우

```
사용자 액션                     동작
─────────────────────────────────────────────────
"팔로잉" 탭 클릭         → setFeedTab("following")
                          → FollowingFeed 마운트
                          → useAuthStore 확인

비로그인                  → 로그인 유도 UI 표시

로그인 (following 0명)    → "아직 팔로우한 크루가 없어요" 안내

로그인 (following 있음)   → fetchFollowing(userId)
                          → 각 유저 프로필 카드 표시
                          → 클릭 시 /profile/{userId} 이동
```

---

## 6. UI Specifications

### 6.1 SocialActionButtons (sm, 카드용)

```
┌──────────────────────────────────┐
│  ★4.5  👁 1.2k     ♡ 12  🔖    │  ← meta 행
└──────────────────────────────────┘

Heart: 비활성 text-gray-400, 활성 fill-red-500 text-red-500
Bookmark: 비활성 text-gray-400, 활성 fill-amber-500 text-amber-500
클릭 영역: p-1 (터치 타겟 확보)
클릭 애니메이션: active:scale-110 transition-transform
```

### 6.2 FeedPage 탭 (전체/팔로잉)

```
┌─────────────────────────────────────────────┐
│  Discover │ Feed (active)                    │ ← ExploreNavBar
├─────────────────────────────────────────────┤
│  [전체] [팔로잉]                              │ ← NEW 피드 탭
├─────────────────────────────────────────────┤
│  전체 │ 성수 │ 을지로 │ ...                   │ ← FeedAreaTabs (전체 탭일 때만)
│  ...기존 피드...                              │
└─────────────────────────────────────────────┘
```

탭 스타일:
```
컨테이너: flex gap-2 px-4 py-2 border-b border-gray-100
버튼: rounded-full px-4 py-1.5 text-sm font-medium
활성: bg-gray-900 text-white
비활성: text-gray-500 hover:bg-gray-100
```

### 6.3 FollowingFeed (팔로잉 탭 콘텐츠)

```
┌─────────────────────────────────────────────┐
│  팔로잉 중인 크루                              │
│                                              │
│  ┌────────────────────────────────────┐      │
│  │  [avatar] @nickname               │      │
│  │  팔로워 12명 · SpotLine 3개       │      │
│  └────────────────────────────────────┘      │
│  ┌────────────────────────────────────┐      │
│  │  [avatar] @nickname2              │      │
│  │  팔로워 8명 · SpotLine 5개        │      │
│  └────────────────────────────────────┘      │
└─────────────────────────────────────────────┘

비로그인:
┌─────────────────────────────────────────────┐
│       👤                                     │
│  로그인하고 관심 크루의                        │
│  콘텐츠를 모아보세요                          │
│  [��그인]                                    │
└─────────────────────────────────────────────┘

팔로잉 0명:
┌─────────────────────────────────────────────┐
│       🔍                                     │
│  아직 팔로우한 크루가 없어요                    │
│  다양한 크루를 탐색해보세요                     │
│  [탐색하기]                                   │
└─────────────────────────────────────────────┘
```

### 6.4 SpotShareSheet

```
기존 ShareSheet와 동일한 bottom sheet 패턴:
┌─────────────────────────────────────────────┐
│  ─── (drag handle)                           │
│  공유                                    [X] │
│                                              │
│  [📋] 링크 복사                               │
│        spotline.kr/spot/cafe-name            │
│                                              │
│  [💬] 카카오톡 공유                            │
│                                              │
│  [🔗] 공유하기 (네이티브, 지원 시)             │
└─────────────────────────────────────────────┘
```

---

## 7. Implementation Order

| Step | Task | Files | 의존성 |
|:----:|------|-------|--------|
| 1 | useFeedStore feedTab 확장 | useFeedStore.ts | 없음 |
| 2 | useSocialStore batchInit 추가 | useSocialStore.ts | 없음 |
| 3 | SocialActionButtons 컴포넌트 | SocialActionButtons.tsx | Step 2 |
| 4 | SpotPreviewCard 수정 (SocialActionButtons 통합) | SpotPreviewCard.tsx | Step 3 |
| 5 | SpotLinePreviewCard 수정 (SocialActionButtons 통합) | SpotLinePreviewCard.tsx | Step 3 |
| 6 | SpotShareSheet 컴포넌트 | SpotShareSheet.tsx | 없음 |
| 7 | SpotBottomBar 수정 (SpotShareSheet 연결) | SpotBottomBar.tsx | Step 6 |
| 8 | FollowingFeed 컴포넌트 | FollowingFeed.tsx | Step 1 |
| 9 | FeedPage 수정 (feedTab + FollowingFeed 통합) | FeedPage.tsx | Step 1, 8 |
| 10 | ProfileTabs 수정 (데이터 연동 강화) | ProfileTabs.tsx, api.ts | 없음 |
| 11 | 타입 체크 + 최종 검증 | — | Step 1-10 |

---

## 8. Checklist

- [ ] useFeedStore: feedTab, setFeedTab
- [ ] useSocialStore: batchInitSocialStatus
- [ ] SocialActionButtons: Heart/Bookmark toggle, auth guard, stopPropagation
- [ ] SpotPreviewCard: SocialActionButtons 통합, 기존 Heart 제거
- [ ] SpotLinePreviewCard: SocialActionButtons 통합, 기존 Heart 제거
- [ ] SpotShareSheet: 카카오/링크/네이티브 공유
- [ ] SpotBottomBar: SpotShareSheet 연결
- [ ] FollowingFeed: 비로그인/0명/크루 목록 3가지 상태
- [ ] FeedPage: feedTab 탭 UI + FollowingFeed 조건부 렌더링
- [ ] ProfileTabs: fetchMySpots 연동, SpotLine 탭 SpotLinePreviewCard 사용
- [ ] api.ts: fetchMySpots 함수 추가
- [ ] pnpm type-check 통과
- [ ] pnpm lint 에러 0
