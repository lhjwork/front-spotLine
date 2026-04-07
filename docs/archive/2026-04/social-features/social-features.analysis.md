# Social Features Gap Analysis Report

> **Feature**: social-features
> **Design Document**: `docs/02-design/features/social-features.design.md`
> **Plan Document**: `docs/01-plan/features/social-features.plan.md`
> **Implementation Path**: `src/components/`, `src/store/`, `src/lib/api.ts`
> **Analysis Date**: 2026-04-07 (v2 re-analysis)
> **Previous Analysis**: 2026-04-05 (v1, 96%)
> **Status**: Approved

---

## 1. Executive Summary

**Overall Match Rate: 96%** -- Design and implementation match well.

All 11 Plan FRs are implemented. All 11 Design implementation steps are completed. One partial gap remains: ProfileTabs "spotlines" tab uses simple div rendering instead of SpotLinePreviewCard (MySpotLine type differs from SpotLinePreview).

No regressions found since v1 analysis.

---

## 2. Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| Design Match | 95% | PASS |
| Architecture Compliance | 100% | PASS |
| Convention Compliance | 100% | PASS |
| **Overall** | **96%** | PASS |

---

## 3. FR-by-FR Comparison (Plan Document -- 11 FRs)

| FR | Requirement | Status | Evidence |
|----|-------------|:------:|----------|
| FR-01 | SpotPreviewCard Heart toggle | PASS | `SocialActionButtons` at `SpotPreviewCard.tsx:69-75` |
| FR-02 | SpotPreviewCard Bookmark toggle | PASS | Included in SocialActionButtons |
| FR-03 | SpotLinePreviewCard Heart toggle | PASS | `SocialActionButtons` at `SpotLinePreviewCard.tsx:61-67` |
| FR-04 | SpotLinePreviewCard Bookmark toggle | PASS | Included in SocialActionButtons |
| FR-05 | Feed "following" tab | PASS | `FeedPage.tsx:153-170` pill tab UI |
| FR-06 | Following feed data | PASS | Client-side via `fetchFollowing` as designed |
| FR-07 | SpotShareSheet | PASS | Kakao, link copy, native share all implemented |
| FR-08 | Profile "my-spots" tab | PASS | `ProfileTabs.tsx:144-154` with `fetchMySpots` |
| FR-09 | Profile "likes" tab | PASS | `ProfileTabs.tsx:93-103` with `fetchUserLikedSpots` |
| FR-10 | Profile "saves" tab | PASS | `ProfileTabs.tsx:105-115` with `fetchUserSavedSpotLines` |
| FR-11 | Login guard (LoginBottomSheet) | PASS | `SocialActionButtons.tsx:47-51`, `FollowingFeed.tsx:49-63` |

**FR Match Rate: 11/11 = 100%**

---

## 4. Design Checklist Verification (Section 8)

| # | Checklist Item | Status | Evidence |
|:-:|----------------|:------:|----------|
| 1 | useFeedStore: feedTab, setFeedTab | PASS | `useFeedStore.ts:15-16` state, `L69-76` action with reset |
| 2 | useSocialStore: batchInitSocialStatus | PASS | `useSocialStore.ts:39-41` type, `L135-151` implementation |
| 3 | SocialActionButtons: toggle, auth guard, stopPropagation | PASS | `SocialActionButtons.tsx:44-64` |
| 4 | SpotPreviewCard: SocialActionButtons, old Heart removed | PASS | No standalone Heart, `SocialActionButtons` at L69 |
| 5 | SpotLinePreviewCard: SocialActionButtons, old Heart removed | PASS | No standalone Heart, `SocialActionButtons` at L61 |
| 6 | SpotShareSheet: Kakao/link/native share | PASS | All 3 methods in `SpotShareSheet.tsx` |
| 7 | SpotBottomBar: SpotShareSheet connected | PASS | Import L10, state L27, render L143-147 |
| 8 | FollowingFeed: 3 states | PASS | Unauthenticated L38-63, 0 following L74-92, crew list L94-124 |
| 9 | FeedPage: feedTab UI + conditional FollowingFeed | PASS | Tab UI L153-170, conditional L172-173 |
| 10 | ProfileTabs: fetchMySpots, SpotLine tab SpotLinePreviewCard | PARTIAL | fetchMySpots works. SpotLine tab still uses simple div (L121-136) |
| 11 | api.ts: fetchMySpots function | PASS | `api.ts:968-981` |
| 12 | pnpm type-check | N/A | Runtime check required |
| 13 | pnpm lint 0 errors | N/A | Runtime check required |

**Checklist Match Rate: 10.5/11 verifiable = 95.5%**

---

## 5. Detailed Component Analysis

### 5.1 SocialActionButtons (NEW -- `src/components/shared/SocialActionButtons.tsx`)

| Spec | Implementation | Match |
|------|---------------|:-----:|
| Props: type, id, initialLikesCount, initialSavesCount, size | Exact match L10-16 | PASS |
| Heart active: fill-red-500 text-red-500 | L77,81 | PASS |
| Bookmark active: fill-amber-500 text-amber-500 | L90,95 | PASS |
| scale-110 animation | L76 active:scale-110 transition-transform | PASS |
| sm: h-3.5 w-3.5, text-xs / md: h-4 w-4, text-sm | L66-67 | PASS |
| stopPropagation + preventDefault | L45-46, L56-57 | PASS |
| Auth guard -> LoginBottomSheet | L47-51, L57-61 | PASS |
| aria-label | "좋아요" L79, "저장" L93 | PASS |
| Bookmark count hidden | No count rendered for bookmark | PASS |

### 5.2 FollowingFeed (NEW -- `src/components/feed/FollowingFeed.tsx`)

| Spec | Implementation | Match |
|------|---------------|:-----:|
| Unauthenticated: login prompt | "로그인하고 관심 크루의 콘텐츠를 모아보세요" L43-48 | PASS |
| 0 following: empty state with explore link | "아직 팔로우한 크루가 없어요" + "탐색하기" L76-91 | PASS |
| Crew list: avatar + nickname + stats | Avatar with fallback, nickname, followers/spotlines L98-119 | PASS |
| Loading spinner | L66-72 | PASS |
| fetchFollowing call | `fetchFollowing(user.id, 1, 50)` L26 | PASS |

### 5.3 SpotShareSheet (NEW -- `src/components/spot/SpotShareSheet.tsx`)

| Spec | Implementation | Match |
|------|---------------|:-----:|
| Props: isOpen, onClose, spot | Exact match L15-19 | PASS |
| shareUrl: spotline.kr/spot/{slug} | L58 | PASS |
| shareText: crewNote or description | L59 | PASS |
| Portal rendering | createPortal L87 | PASS |
| ESC key close | L42-54 | PASS |
| Drag handle | L96 | PASS |
| Link copy + Kakao + Native share | All 3 implemented | PASS |

### 5.4 Modified Components

| Component | Design Change | Implemented | Match |
|-----------|--------------|:-----------:|:-----:|
| SpotPreviewCard | SocialActionButtons integration | L69-75 | PASS |
| SpotLinePreviewCard | SocialActionButtons integration | L61-67 | PASS |
| FeedPage | feedTab + FollowingFeed conditional | L153-207 | PASS |
| SpotBottomBar | SpotShareSheet connection | L27,51-53,143-147 | PASS |
| ProfileTabs (my-spots) | fetchMySpots + SpotPreviewCard grid | L45-47,144-154 | PASS |
| ProfileTabs (spotlines) | SpotLinePreviewCard usage | Simple div at L121-136 | PARTIAL |
| useFeedStore | feedTab + setFeedTab | L15-16,69-76 | PASS |
| useSocialStore | batchInitSocialStatus | L135-151 | PASS |

---

## 6. Differences Found

### PARTIAL: ProfileTabs SpotLine Tab Rendering

| Aspect | Design | Implementation |
|--------|--------|----------------|
| Rendering | SpotLinePreviewCard | Simple div with title/area/status |
| Root cause | MySpotLine type has `status`, `spotsCount` fields that differ from SpotLinePreview type (which has `spotCount`, `totalDuration`, `theme`) |
| Impact | Low -- functional, shows relevant data. Status field (예정/완주/취소) is useful info not available in SpotLinePreviewCard |

### Minor: fetchFollowing Page Parameter

| Aspect | Design | Implementation |
|--------|--------|----------------|
| Page param | Implied 0-based | Passes `1` (may be 1-based backend convention) |
| Impact | None if backend is 1-based pagination |

### Added (Not in Design)

| Item | Location | Description |
|------|----------|-------------|
| Custom login messages | SocialActionButtons.tsx:48,59 | Different messages for like vs save |
| Loading spinner in FollowingFeed | FollowingFeed.tsx:66-72 | Design mentioned but not detailed |

---

## 7. Architecture & Convention Compliance

| Check | Status |
|-------|:------:|
| All social state via useSocialStore (not local) | PASS |
| API calls through `src/lib/api.ts` only | PASS |
| Zustand stores for state management | PASS |
| Auth guard pattern (LoginBottomSheet) consistent | PASS |
| stopPropagation in Link children | PASS |
| "use client" on interactive components | PASS |
| Import order: External -> @/ internal -> relative -> types | PASS |
| Components PascalCase, functions camelCase | PASS |
| Props interfaces: `[Name]Props` | PASS |
| UI text Korean, code English | PASS |
| cn() for conditional classes | PASS |

---

## 8. Recommended Actions

### Optional (Low Priority)

1. **ProfileTabs SpotLine tab**: Convert MySpotLine to SpotLinePreview and use SpotLinePreviewCard. However, the current simple div shows status info (예정/완주/취소) which SpotLinePreviewCard does not support. Consider either extending SpotLinePreviewCard or documenting the intentional difference.

### Runtime Verification

2. Run `pnpm type-check` and `pnpm lint` for checklist items 12-13.

---

## 9. Match Rate Calculation

| Category | Items | Matched | Rate |
|----------|:-----:|:-------:|:----:|
| Plan FRs | 11 | 11 | 100% |
| Design Checklist (verifiable) | 11 | 10.5 | 95.5% |
| **Overall (weighted)** | **22** | **21.5** | **96%** |

Match Rate >= 90% -- Design and implementation match well.

---

## Related Documents

- Plan: [social-features.plan.md](../01-plan/features/social-features.plan.md)
- Design: [social-features.design.md](../02-design/features/social-features.design.md)

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-04-05 | Initial analysis | Claude (gap-detector) |
| 2.0 | 2026-04-07 | Re-analysis with full component verification | Claude (gap-detector) |
