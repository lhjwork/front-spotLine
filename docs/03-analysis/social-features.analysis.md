# Social Features Analysis Report

> **Analysis Type**: Gap Analysis (Design vs Implementation)
>
> **Project**: front-spotLine
> **Analyst**: Claude (gap-detector)
> **Date**: 2026-04-05
> **Design Doc**: [social-features.design.md](../02-design/features/social-features.design.md)

---

## 1. Analysis Overview

### 1.1 Analysis Purpose

Design document Section 8 Checklist (13 items) 대비 실제 구현 코드의 일치도를 검증한다.

### 1.2 Analysis Scope

- **Design Document**: `docs/02-design/features/social-features.design.md`
- **Implementation Path**: `src/store/`, `src/components/shared/`, `src/components/feed/`, `src/components/spot/`, `src/components/profile/`, `src/lib/api.ts`
- **Analysis Date**: 2026-04-05

---

## 2. Gap Analysis (Design vs Implementation)

### 2.1 Checklist Item-by-Item Verification

| # | Checklist Item | Status | Evidence |
|:-:|----------------|:------:|----------|
| 1 | useFeedStore: feedTab, setFeedTab | ✅ Match | `useFeedStore.ts:15-16` feedTab state + `L69-76` setFeedTab with reset logic |
| 2 | useSocialStore: batchInitSocialStatus | ✅ Match | `useSocialStore.ts:39-41` interface + `L135-151` implementation, skips existing keys |
| 3 | SocialActionButtons: Heart/Bookmark toggle, auth guard, stopPropagation | ✅ Match | `SocialActionButtons.tsx:44-63` stopPropagation+preventDefault, auth check, LoginBottomSheet |
| 4 | SpotPreviewCard: SocialActionButtons integration, existing Heart removed | ✅ Match | `SpotPreviewCard.tsx:69-75` SocialActionButtons rendered, no standalone Heart icon |
| 5 | SpotLinePreviewCard: SocialActionButtons integration, existing Heart removed | ✅ Match | `SpotLinePreviewCard.tsx:61-67` SocialActionButtons rendered, no standalone Heart icon |
| 6 | SpotShareSheet: kakao/link/native share | ✅ Match | `SpotShareSheet.tsx` portal + ESC key + drag handle + 3 share methods (copy/kakao/native) |
| 7 | SpotBottomBar: SpotShareSheet connection | ✅ Match | `SpotBottomBar.tsx:27` showShareSheet state + `L51-53` handleShare + `L143-147` SpotShareSheet render |
| 8 | FollowingFeed: 3 states (unauthenticated, 0 following, crew list) | ✅ Match | `FollowingFeed.tsx:38-63` unauthenticated + `L74-91` 0 following + `L94-123` crew list |
| 9 | FeedPage: feedTab UI + FollowingFeed conditional rendering | ✅ Match | `FeedPage.tsx:154-170` pill tab UI + `L172-173` conditional FollowingFeed |
| 10 | ProfileTabs: fetchMySpots integration, SpotLine tab improvement | ⚠️ Partial | fetchMySpots + "my-spots" tab: ✅. SpotLine tab still uses simple div (L121-136), NOT SpotLinePreviewCard |
| 11 | api.ts: fetchMySpots function added | ✅ Match | `api.ts:959-972` fetchMySpots with auth header, paginated response |
| 12 | pnpm type-check passes | -- | Not verified (runtime check required) |
| 13 | pnpm lint error 0 | -- | Not verified (runtime check required) |

### 2.2 Detailed Findings

#### Item 10: ProfileTabs SpotLine Tab -- Partial Match

**Design spec** (Section 3.2, ProfileTabs.tsx modification):
> SpotLine tab 개선: 현재 단순 div로 렌더링 -> SpotLinePreviewCard 사용

**Actual implementation** (`ProfileTabs.tsx:117-141`):
```tsx
// Still uses simple div rendering for "spotlines" tab
<div key={spotLine.id} className="rounded-xl border border-gray-200 p-4">
  <h3 className="font-medium">{spotLine.title}</h3>
  <p className="mt-1 text-sm text-gray-500">
    {spotLine.area} · {spotLine.spotsCount}개 Spot
  </p>
  <span ...>{status label}</span>
</div>
```

The `SpotLinePreviewCard` is imported (`ProfileTabs.tsx:8`) but only used for the "saves" tab (L108-109), not for the "spotlines" tab. This is because `MySpotLine` type differs from `SpotLinePreview` type -- a conversion would be needed.

---

## 3. Component Design Comparison

### 3.1 SocialActionButtons

| Design Spec | Implementation | Status |
|------------|----------------|:------:|
| Props: type, id, initialLikesCount, initialSavesCount, size | Exact match (`SocialActionButtons.tsx:10-16`) | ✅ |
| sm: h-3.5 w-3.5 icons, text-xs | `L66-67` iconSize/textSize computed correctly | ✅ |
| Heart active: fill-red-500 text-red-500 | `L77,81` | ✅ |
| Bookmark active: fill-amber-500 text-amber-500 | `L90,95` | ✅ |
| scale-110 animation | `L76` active:scale-110 transition-transform | ✅ |
| Bookmark count hidden | `L86-96` no count displayed for bookmark | ✅ |

### 3.2 SpotShareSheet

| Design Spec | Implementation | Status |
|------------|----------------|:------:|
| shareUrl: spotline.kr/spot/{slug} | `L58` exact match | ✅ |
| shareText: crewNote or description | `L59` matches | ✅ |
| Portal rendering | `L87` createPortal to document.body | ✅ |
| ESC key close | `L42-53` keydown listener | ✅ |
| Drag handle | `L96` rounded bar element | ✅ |
| kakao button label "장소 보기" | Not explicitly set (uses shareToKakao utility) | ⚠️ Minor |

### 3.3 FeedPage Tab Style

| Design Spec | Implementation | Status |
|------------|----------------|:------:|
| Container: flex gap-2 px-4 py-2 border-b border-gray-100 | `L154` exact match | ✅ |
| Button: rounded-full px-4 py-1.5 text-sm font-medium | `L161` exact match | ✅ |
| Active: bg-gray-900 text-white | `L163` exact match | ✅ |
| Inactive: text-gray-500 hover:bg-gray-100 | `L164` exact match | ✅ |

---

## 4. Store Design Comparison

### 4.1 useFeedStore

| Design Spec | Implementation | Status |
|------------|----------------|:------:|
| feedTab: "all" \| "following", default "all" | `L15,41` exact match | ✅ |
| setFeedTab resets spots/spotsPage/hasMore/spotLines/error | `L69-76` resets all specified fields | ✅ |

### 4.2 useSocialStore

| Design Spec | Implementation | Status |
|------------|----------------|:------:|
| batchInitSocialStatus signature | `L39-41` exact match | ✅ |
| liked=false, saved=false defaults | `L141-142` | ✅ |
| Skip if already initialized | `L140` `if (!newItems[key])` guard | ✅ |

---

## 5. API Integration

| Design Function | Implementation | Status |
|----------------|----------------|:------:|
| fetchMySpots(page, size) | `api.ts:959-972` with auth, paginated | ✅ |
| fetchFollowing (already exists) | `api.ts:1056-1066` confirmed present | ✅ |
| toggleLike/toggleSave (no change) | `api.ts:881-906` confirmed | ✅ |
| fetchSocialStatus (no change) | `api.ts:909-923` confirmed | ✅ |

---

## 6. Convention Compliance

### 6.1 Naming

| Category | Files Checked | Compliance | Notes |
|----------|:------------:|:----------:|-------|
| Components (PascalCase) | 8 | 100% | SocialActionButtons, SpotShareSheet, etc. |
| Functions (camelCase) | 12 | 100% | handleLike, batchInitSocialStatus, etc. |
| Files (component PascalCase) | 8 | 100% | All .tsx files PascalCase |
| Props interface naming | 5 | 100% | SocialActionButtonsProps, SpotShareSheetProps, etc. |

### 6.2 Import Order

All files follow: External libs -> Internal absolute (`@/`) -> Relative -> Types.
No violations found.

### 6.3 Code Patterns

| Pattern | Compliance | Notes |
|---------|:----------:|-------|
| "use client" directive | ✅ | Present on all interactive components |
| cn() utility usage | ✅ | Used consistently for conditional classes |
| Korean UI text / English code | ✅ | All user-facing strings in Korean |
| stopPropagation in Link children | ✅ | SocialActionButtons handles this |

---

## 7. Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| Design Match | 95% | ✅ |
| Architecture Compliance | 100% | ✅ |
| Convention Compliance | 100% | ✅ |
| **Overall** | **96%** | ✅ |

### Match Rate Calculation

- Checklist items verifiable by code: 11 / 13 (items 12-13 require runtime)
- Fully matching: 10 / 11
- Partially matching: 1 / 11 (ProfileTabs SpotLine tab)
- Missing: 0 / 11
- **Match Rate: 10.5 / 11 = 95.5% -> 96% (rounded)**

---

## 8. Differences Found

### 8.1 Changed Features (Design != Implementation)

| Item | Design | Implementation | Impact |
|------|--------|----------------|:------:|
| ProfileTabs "spotlines" tab | SpotLinePreviewCard 사용 | Simple div rendering (MySpotLine type mismatch) | Low |
| SpotShareSheet kakao label | "장소 보기" 명시 | shareToKakao 유틸에 위임 (label 미확인) | Low |

### 8.2 Missing Features (Design O, Implementation X)

None.

### 8.3 Added Features (Design X, Implementation O)

| Item | Implementation Location | Description |
|------|------------------------|-------------|
| LoginBottomSheet custom message | SocialActionButtons.tsx:48,59 | 좋아요/저장 각각 다른 메시지 표시 |
| FollowingFeed loading spinner | FollowingFeed.tsx:66-72 | 로딩 중 스피너 표시 (design에 언급은 있으나 상세 미기재) |

---

## 9. Recommended Actions

### 9.1 Short-term (Optional Improvement)

| Priority | Item | File | Description |
|----------|------|------|-------------|
| Low | ProfileTabs SpotLine tab 개선 | `ProfileTabs.tsx:117-141` | MySpotLine -> SpotLinePreview 변환 후 SpotLinePreviewCard 사용. 현재 기능상 문제 없음 |

### 9.2 Runtime Verification Required

| Item | Command | Purpose |
|------|---------|---------|
| Type check | `pnpm type-check` | Checklist item 12 |
| Lint | `pnpm lint` | Checklist item 13 |

---

## 10. Design Document Updates Needed

- [ ] ProfileTabs "spotlines" tab: MySpotLine 타입 특성상 SpotLinePreviewCard 직접 사용이 어려운 점 문서에 반영 (status 필드 등 추가 정보 표시 필요)

---

## 11. Next Steps

- [x] Gap analysis complete (96% match rate)
- [ ] Run `pnpm type-check` and `pnpm lint` for items 12-13
- [ ] Optional: ProfileTabs SpotLine tab 개선
- [ ] Generate completion report: `/pdca report social-features`

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-04-05 | Initial analysis | Claude (gap-detector) |
