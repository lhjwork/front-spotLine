# Social Features Planning Document

> **Summary**: Feed/카드 레벨 소셜 액션 버튼, 팔로잉 피드 탭, Spot 공유 시트, 프로필 공개 SpotLine/Spot 목록 강화
>
> **Project**: Spotline (front-spotLine)
> **Version**: 0.1.0
> **Author**: Claude + hanjinlee
> **Date**: 2026-04-05
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 좋아요/저장 버튼이 상세 페이지(BottomBar)에만 있어 Feed 카드에서 빠른 인터랙션 불가. 팔로우한 유저의 콘텐츠를 모아볼 수 없고, Spot 단위 공유 기능이 없으며, 프로필 페이지의 콘텐츠 탭이 실질적 데이터를 보여주지 못한다 |
| **Solution** | Preview 카드에 좋아요/저장 인라인 버튼 추가, Feed에 "팔로잉" 탭 추가, Spot 공유 시트 구현, 프로필 탭에 실제 Spot/SpotLine 목록 연동 |
| **Function/UX Effect** | Feed에서 카드를 탭하지 않고도 좋아요/저장 가능, 팔로잉 피드로 관심 유저 콘텐츠 발견, Spot 단위 카카오/링크 공유, 프로필에서 유저 활동 전체 확인 |
| **Core Value** | 소셜 인터랙션 마찰 제거 → 참여율(좋아요/저장 전환율) 3~5배 증가 예상. 팔로잉 피드로 리텐션 루프 형성 |

---

## 1. Overview

### 1.1 Purpose

Phase 6 Social Features 중 **프론트엔드에서 누락된 소셜 인터랙션 UI**를 구현하여 사용자 참여도를 높이고 리텐션 루프를 완성한다.

### 1.2 Background

**이미 구현된 것 (Backend + Frontend):**
- Follow 시스템: follow/unfollow API + ProfileHeader 팔로우 버튼 + FollowListSheet
- Like/Save 시스템: toggle API + SpotBottomBar/SpotLineBottomBar 버튼 + 최적 업데이트 Zustand store
- Comment 시스템: CRUD API + CommentSection/CommentForm/CommentItem + 대댓글 1단계
- Profile 시스템: UserProfile API + ProfileHeader + ProfileTabs
- Share 시스템: ShareSheet (SpotLine 전용) + 카카오톡/링크복사/네이티브 공유
- Social Store: useSocialStore (like/save/follow 최적 업데이트)

**누락된 것 (이번 Feature 범위):**
- Feed 카드(SpotPreviewCard, SpotLinePreviewCard)에 **좋아요/저장 버튼 없음** — 상세 페이지 진입 필수
- **팔로잉 피드** 없음 — 팔로우한 유저의 콘텐츠를 모아볼 방법 없음
- **Spot 공유** 없음 — ShareSheet가 SpotLine 전용, Spot 상세에서 공유 불가
- 프로필 **탭 콘텐츠 부족** — "내 Spot", "좋아요한 Spot", "저장한 SpotLine" 목록이 빈약

### 1.3 Related Documents

- Plan: `docs/01-plan/features/experience-social-platform.plan.md`
- Archived: `docs/archive/2026-04/feed-hub-refinement/` (Feed 정렬/검색)
- Archived: `docs/archive/2026-04/user-spotline-experience/` (SpotLine 생성/공유)

---

## 2. Scope

### 2.1 In Scope

- [ ] SpotPreviewCard 인라인 좋아요 버튼 (Heart toggle)
- [ ] SpotPreviewCard 인라인 저장 버튼 (Bookmark toggle)
- [ ] SpotLinePreviewCard 인라인 좋아요 버튼 (Heart toggle)
- [ ] SpotLinePreviewCard 인라인 저장 버튼 (Bookmark toggle)
- [ ] Feed "팔로잉" 탭 추가 (ExploreNavBar 또는 FeedPage 내 탭)
- [ ] 팔로잉 피드 데이터 페칭 (팔로우한 유저의 Spot/SpotLine)
- [ ] Spot 공유 시트 (SpotShareSheet — 카카오톡/링크복사/네이티브)
- [ ] 프로필 "내 Spot" 탭 데이터 연동
- [ ] 프로필 "좋아요" 탭 데이터 연동
- [ ] 프로필 "저장" 탭 데이터 연동
- [ ] 로그인 필요 액션 시 LoginBottomSheet 연동

### 2.2 Out of Scope

- 알림/Activity Feed — 별도 feature (backend Notification 엔티티 필요)
- 유저 검색/추천 — 별도 feature
- @멘션/해시태그 — 별도 feature
- DM/메시지 — Phase 6+
- Block/Mute — 별도 feature
- 카드 내 댓글 프리뷰 — 복잡도 높음, 별도 검토

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | SpotPreviewCard 좋아요 버튼: Heart 아이콘 토글, 로그인 필요, 최적 업데이트 | High | Pending |
| FR-02 | SpotPreviewCard 저장 버튼: Bookmark 아이콘 토글, 로그인 필요, 최적 업데이트 | High | Pending |
| FR-03 | SpotLinePreviewCard 좋아요 버튼: Heart 아이콘 토글, 로그인 필요 | High | Pending |
| FR-04 | SpotLinePreviewCard 저장 버튼: Bookmark 아이콘 토글, 로그인 필요 | High | Pending |
| FR-05 | Feed "팔로잉" 탭: 팔로우한 유저의 콘텐츠 피드, 빈 상태 안내 | High | Pending |
| FR-06 | 팔로잉 피드 API 연동: Backend 엔드포인트 확인 또는 클라이언트 조합 | High | Pending |
| FR-07 | SpotShareSheet: Spot 상세 페이지에서 카카오/링크/네이티브 공유 | Medium | Pending |
| FR-08 | 프로필 "내 Spot" 탭: fetchMySpots API 연동, SpotPreviewCard 그리드 | Medium | Pending |
| FR-09 | 프로필 "좋아요" 탭: fetchUserLikedSpots API 연동 | Medium | Pending |
| FR-10 | 프로필 "저장" 탭: fetchMySaves API 연동 (spot/spotline 분리) | Medium | Pending |
| FR-11 | 로그인 가드: 비로그인 유저가 좋아요/저장 시 LoginBottomSheet 표시 | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 좋아요/저장 버튼 응답 < 100ms (optimistic) | 체감 속도 |
| Performance | 카드 버튼 클릭 시 상위 Link 이벤트 전파 차단 | e.preventDefault + stopPropagation |
| UX | 좋아요/저장 상태가 상세 페이지와 카드 간 동기화 | useSocialStore 공유 |
| A11y | 버튼에 aria-label 제공 ("좋아요", "저장") | 수동 검증 |
| Auth | 비로그인 시 모든 소셜 액션에서 로그인 유도 | LoginBottomSheet |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 11개 FR 구현 완료
- [ ] `pnpm type-check` 통과
- [ ] `pnpm lint` 에러 0개
- [ ] 카드 버튼 클릭 시 Link 네비게이션 발생하지 않음
- [ ] 로그인/비로그인 상태 모두 정상 동작

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build succeeds (`pnpm build`)
- [ ] Gap Analysis Match Rate >= 90%

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 카드 내 버튼 클릭 시 Link 네비게이션 간섭 | High | High | e.preventDefault + e.stopPropagation, 버튼 영역 분리 |
| 팔로잉 피드 Backend 엔드포인트 미존재 | Medium | High | 클라이언트에서 following 목록 → 각 유저 콘텐츠 조합, 또는 Backend에 요청 |
| Social 상태 동기화 (카드↔상세 페이지) | Medium | Low | useSocialStore 단일 store로 해결 (이미 구현됨) |
| 대량 카드에서 Social status 초기화 성능 | Medium | Medium | Batch API 또는 카드 진입 시점에 lazy init |
| 비로그인 유저 UX 단절 | Low | Medium | LoginBottomSheet로 부드러운 유도 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Selected |
|-------|-----------------|:--------:|
| **Starter** | Simple structure | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | ☑ |
| **Enterprise** | Strict layer separation, microservices | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Selected | Rationale |
|----------|----------|-----------|
| Social state | useSocialStore (기존 Zustand) | 카드↔상세 동기화 |
| Auth guard | LoginBottomSheet (기존 컴포넌트) | 이미 구현됨 |
| Card buttons | SocialActionButtons 공유 컴포넌트 | 중복 방지 |
| Following feed | 클라이언트 조합 (fallback) | Backend 엔드포인트 확인 필요 |
| Share | ShareSheet 범용화 (Spot + SpotLine) | 기존 SpotLine용 확장 |

### 6.3 수정/추가 파일 계획

**신규 생성 (3개)**:
1. `src/components/shared/SocialActionButtons.tsx` — 인라인 좋아요/저장 버튼 (카드용)
2. `src/components/feed/FollowingFeed.tsx` — 팔로잉 피드 탭 콘텐츠
3. `src/components/spot/SpotShareSheet.tsx` — Spot 공유 시트 (ShareSheet 참고)

**수정 대상 (7개+)**:
1. `src/components/shared/SpotPreviewCard.tsx` — SocialActionButtons 추가
2. `src/components/shared/SpotLinePreviewCard.tsx` — SocialActionButtons 추가
3. `src/components/feed/FeedPage.tsx` — 팔로잉 탭 추가
4. `src/components/spot/SpotBottomBar.tsx` — 공유 버튼 + SpotShareSheet 연결
5. `src/components/profile/ProfileTabs.tsx` — 탭 데이터 연동 강화
6. `src/lib/api.ts` — 팔로잉 피드 API 함수 (필요시)
7. `src/store/useSocialStore.ts` — batch init 함수 추가

---

## 7. Implementation Details

### 7.1 SocialActionButtons 컴포넌트

```typescript
interface SocialActionButtonsProps {
  type: "spot" | "spotline";
  id: string;
  likesCount: number;
  savesCount: number;
  size?: "sm" | "md";  // sm=카드용, md=상세용
}
```

- useSocialStore에서 상태 읽기/토글
- 비로그인 시 LoginBottomSheet 표시
- `e.stopPropagation()` + `e.preventDefault()` 로 Link 이벤트 차단
- Heart: 활성 시 `fill-red-500 text-red-500`, 비활성 시 `text-gray-400`
- Bookmark: 활성 시 `fill-blue-500 text-blue-500`, 비활성 시 `text-gray-400`

### 7.2 카드 내 Social Status 초기화 전략

카드에 SocialActionButtons를 넣으려면 각 카드의 social status(isLiked, isSaved)를 알아야 함.

**옵션 A**: Backend fetchFeedSpots 응답에 isLiked/isSaved 포함 (best, Backend 수정 필요)
**옵션 B**: 카드 마운트 시 fetchSocialStatus 개별 호출 (N+1 문제)
**옵션 C**: 비로그인 시 상태 없이 렌더링, 클릭 시 로그인 유도 → 로그인 후 상태 초기화

**선택**: 옵션 C 우선 (Backend 변경 없이). 로그인 유저는 Feed 로드 시 visible 카드의 social status를 batch로 조회.

### 7.3 팔로잉 피드

Backend에 `GET /api/v2/feed/following` 엔드포인트가 있는지 확인 필요.

**없는 경우 Fallback**:
1. `GET /api/v2/users/me/following` → 팔로잉 유저 목록
2. 각 유저의 최근 콘텐츠 → 시간순 정렬 → 표시
3. 성능 이슈 시 "팔로잉 피드 준비 중" 안내 + Backend 요청

### 7.4 SpotShareSheet

기존 ShareSheet(SpotLine 전용)을 참고하여 Spot 버전 생성:
- 카카오톡 공유 (title, crewNote, imageUrl)
- 링크 복사 (spotline.kr/spot/{slug})
- 네이티브 공유 (Web Share API)

---

## 8. Convention Prerequisites

### 8.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] ESLint configuration
- [x] TypeScript strict mode
- [x] Tailwind CSS 4 + cn() utility

### 8.2 Conventions to Follow

| Category | Rule |
|----------|------|
| Event handling | `e.stopPropagation()` for nested clickable areas |
| Auth guard | Check `useAuth()` → if null, show LoginBottomSheet |
| Social state | Always use useSocialStore (never local state for like/save) |
| Optimistic UI | Toggle immediately, sync on API response |
| Language | UI: Korean, Code: English |

### 8.3 Environment Variables Needed

없음 — 기존 환경 변수만 사용.

---

## 9. Next Steps

1. [ ] Backend 팔로잉 피드 엔드포인트 존재 여부 확인 (Swagger)
2. [ ] Design document 작성 (`/pdca design social-features`)
3. [ ] 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-05 | Initial draft | Claude + hanjinlee |
