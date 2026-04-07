# Following Feed Content Planning Document

> **Summary**: 팔로잉 피드에 실제 콘텐츠(SpotLine + Blog) 표시. 현재 팔로잉 유저 목록만 보이는 "팔로잉" 탭을 콘텐츠 피드로 전환. Backend에 팔로잉 피드 API 추가, Frontend FollowingFeed 리팩토링.
>
> **Project**: Spotline (front-spotLine + springboot-spotLine-backend)
> **Version**: 1.0.0
> **Date**: 2026-04-07
> **Status**: Planning

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 팔로잉 탭이 유저 카드 목록만 표시하고 콘텐츠를 전혀 보여주지 않음. 팔로우해도 콘텐츠를 볼 방법이 없어 팔로우 동기가 0. |
| **Solution** | Backend에 `GET /api/v2/feed/following` API 추가 (팔로잉 유저들의 SpotLine + Blog 시간순 병합). Frontend FollowingFeed를 콘텐츠 피드로 전환. |
| **Function/UX Effect** | 팔로잉 탭에서 팔로잉 유저들의 최신 SpotLine 카드 + Blog 카드가 시간순으로 표시. 무한 스크롤. |
| **Core Value** | 팔로우→콘텐츠 소비 루프 완성. Social Sharing (Pillar 3)의 핵심 동기부여 — 팔로우하면 피드에 콘텐츠가 나타남. |

| Item | Detail |
|------|--------|
| Feature | Following Feed Content |
| Created | 2026-04-07 |
| Duration | 예상 1일 (Backend + Frontend) |
| Status | Planning |
| Level | Dynamic |
| Target Repo | springboot-spotLine-backend + front-spotLine |

---

## 1. Overview

### 1.1 Purpose

팔로잉 피드에 실제 콘텐츠를 표시하여, 팔로우 행위가 콘텐츠 소비로 연결되는 루프를 완성한다.

### 1.2 Background

- 팔로우 시스템 완성: follow/unfollow, 팔로워 수, 프로필에서 팔로우 버튼
- 그러나 팔로잉 탭(FeedPage "팔로잉")은 팔로잉 유저의 아바타+이름 목록만 표시
- 콘텐츠(SpotLine, Blog)를 피드에서 볼 수 없음
- 사용자가 팔로우한 크루의 새 SpotLine/Blog를 발견할 경로 없음

### 1.3 Current State

**이미 존재하는 것:**
- Backend: UserFollow 엔티티 + FollowService + FollowController
- Backend: SpotLineRepository.findByCreatorIdAndIsActiveTrueOrderByCreatedAtDesc
- Backend: BlogRepository.findByUserIdAndIsActiveTrueOrderByUpdatedAtDesc
- Frontend: FollowingFeed.tsx — 팔로잉 유저 목록 표시 (콘텐츠 없음)
- Frontend: SpotLinePreviewCard, BlogCard — 재사용 가능한 카드 컴포넌트
- Frontend: fetchFollowing(userId, page, size) — 팔로잉 유저 목록 API

**누락된 것:**
- Backend: 팔로잉 유저들의 콘텐츠를 병합하여 시간순으로 반환하는 피드 API
- Frontend: 콘텐츠 기반 팔로잉 피드 UI

---

## 2. Scope

### 2.1 In Scope

- [ ] **FR-01**: Backend — `GET /api/v2/feed/following` API (인증 필요)
- [ ] **FR-02**: Backend — 팔로잉 유저 ID 목록 조회 → SpotLine + Blog 병합 쿼리
- [ ] **FR-03**: Frontend — FollowingFeed.tsx 리팩토링 (유저 목록 → 콘텐츠 피드)
- [ ] **FR-04**: Frontend — 팔로잉 피드용 API 함수 (fetchFollowingFeed)
- [ ] **FR-05**: Frontend — 무한 스크롤 (IntersectionObserver)
- [ ] **FR-06**: Frontend — 빈 상태 UI (팔로잉 0명 / 콘텐츠 0개)

### 2.2 Out of Scope

- 팔로잉 피드에 Spot 표시 (SpotLine + Blog만, 별도 feature)
- 피드 알고리즘/추천 (단순 시간순, 별도 feature)
- 실시간 업데이트/WebSocket (pull 방식, 별도 feature)
- 알림 시스템 (notification-system 별도 feature)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `GET /api/v2/feed/following` — 인증 필요, 페이지네이션 | High | Pending |
| FR-02 | 팔로잉 유저 ID → SpotLine(PUBLISHED) + Blog(PUBLISHED) 시간순 병합 | High | Pending |
| FR-03 | FollowingFeed.tsx에서 콘텐츠 카드(SpotLinePreviewCard + BlogCard) 렌더링 | High | Pending |
| FR-04 | fetchFollowingFeed(page, size) API 함수 | High | Pending |
| FR-05 | 무한 스크롤 (IntersectionObserver 패턴) | High | Pending |
| FR-06 | 빈 상태: 미인증 → 로그인 유도, 팔로잉 0명 → 탐색 유도, 콘텐츠 0개 → 안내 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria |
|----------|----------|
| Performance | 피드 API 응답 < 500ms (팔로잉 최대 100명 기준) |
| Consistency | FeedSpotGrid와 동일한 무한스크롤 패턴 |
| UX | SpotLinePreviewCard, BlogCard 기존 디자인 재사용 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 팔로잉 탭에서 팔로잉 유저의 SpotLine/Blog 카드가 시간순 표시
- [ ] 무한 스크롤 동작
- [ ] 미인증 시 로그인 유도 UI
- [ ] 팔로잉 0명 시 탐색 유도 UI
- [ ] Backend `./gradlew build` 성공
- [ ] Frontend `pnpm type-check` + `pnpm build` 통과

---

## 5. Implementation Order

| Step | Task | Repo | Files |
|------|------|------|-------|
| 1 | FeedController + FeedService 생성 | backend | controller/FeedController.java (NEW), service/FeedService.java (NEW) |
| 2 | FollowingFeedItem DTO 생성 | backend | dto/response/FollowingFeedItemResponse.java (NEW) |
| 3 | Repository 쿼리 추가 (SpotLine/Blog에 creatorId IN 조건) | backend | repository/ (MODIFY) |
| 4 | Frontend API 함수 추가 | frontend | lib/api.ts (MODIFY) |
| 5 | Frontend 타입 추가 | frontend | types/index.ts (MODIFY) |
| 6 | FollowingFeed.tsx 리팩토링 | frontend | components/feed/FollowingFeed.tsx (MODIFY) |

---

## 6. API Design (Preliminary)

### `GET /api/v2/feed/following`

**Auth**: Required (JWT)

**Query Params**:
- `page` (default: 0)
- `size` (default: 20)

**Response** (Page):
```json
{
  "content": [
    {
      "type": "SPOTLINE",
      "id": "uuid",
      "title": "성수 카페투어",
      "slug": "seongsu-cafe-tour",
      "area": "성수",
      "coverImageUrl": "...",
      "likesCount": 12,
      "viewsCount": 45,
      "spotsCount": 5,
      "userName": "크루닉네임",
      "userAvatar": "...",
      "createdAt": "2026-04-07T10:00:00Z"
    },
    {
      "type": "BLOG",
      "id": "uuid",
      "title": "연남 맛집 탐방기",
      "slug": "yeonnam-food-tour",
      "area": "연남",
      "coverImageUrl": "...",
      "likesCount": 8,
      "viewsCount": 30,
      "spotsCount": 3,
      "summary": "연남동의 숨겨진 맛집을 소개합니다",
      "userName": "크루닉네임",
      "userAvatar": "...",
      "createdAt": "2026-04-06T15:00:00Z"
    }
  ],
  "last": false,
  "totalElements": 42
}
```

**구현 전략**: UNION ALL 쿼리 또는 2개 쿼리 병합 후 시간순 정렬.

---

## 7. Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| 팔로잉 많을 때 성능 | Medium | creatorId IN 쿼리 + 인덱스, 최대 100명 제한 |
| SpotLine/Blog 필드 불일치 | Low | 통합 DTO에서 nullable 필드로 처리 |
| 0건 콘텐츠 | Low | 빈 상태 UI + 탐색 유도 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-04-07 | Initial plan — Following Feed Content | Claude Code |
