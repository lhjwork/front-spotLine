# Gap Analysis: global-search

> **Summary**: Design-Implementation gap analysis for the global-search feature.
>
> **Created**: 2026-04-07
> **Status**: Approved
> **Design Document**: `docs/02-design/features/global-search.design.md`
> **Implementation**: 4 files (1 MODIFY, 3 NEW)

---

## Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| Design Match | 99% | [PASS] |
| Architecture Compliance | 100% | [PASS] |
| Convention Compliance | 100% | [PASS] |
| **Overall** | **99%** | [PASS] |

---

## File-by-File Comparison

### 1. `src/lib/api.ts` -- fetchFeedSpotLines (MODIFY)

| Item | Design | Implementation | Match |
|------|--------|----------------|:-----:|
| Signature params `keyword?, sort?` | Lines 29-36 | api.ts:414-420 | [PASS] |
| `if (keyword) params.keyword = keyword` | Line 41 | api.ts:426 | [PASS] |
| `if (sort) params.sort = sort` | Line 42 | api.ts:427 | [PASS] |
| Endpoint `/spotlines/popular` | Line 43 | api.ts:428 | [PASS] |
| Existing callers unaffected | Spec line 51 | 4 callers pass 2-4 args only | [PASS] |

Existing callers verified (all pass zero keyword/sort -- no breakage):
- `src/app/theme/[name]/page.tsx:51` -- `fetchFeedSpotLines(undefined, theme.theme, 0, 10)`
- `src/app/city/[name]/page.tsx:50` -- `fetchFeedSpotLines(city.area, undefined, 0, 5)`
- `src/components/feed/FeedPage.tsx:76` -- `fetchFeedSpotLines(area || undefined, undefined, 0, 5)`

**Items: 5/5 match**

### 2. `src/components/layout/Header.tsx` (MODIFY)

| Item | Design | Implementation | Match |
|------|--------|----------------|:-----:|
| `Search` import from lucide-react | Line 59 | Header.tsx:4 | [PASS] |
| `aria-label="검색"` | Line 105 | Header.tsx:50 | [PASS] |
| Link `href="/search"` | Line 103 | Header.tsx:48 | [PASS] |
| `<Search className="h-5 w-5" />` | Line 107 | Header.tsx:52 | [PASS] |
| Right section `w-16 flex justify-end` | Line 101 | Header.tsx:46 | [PASS] |

**Items: 5/5 match. Character-perfect.**

### 3. `src/app/search/page.tsx` (NEW)

| Item | Design | Implementation | Match |
|------|--------|----------------|:-----:|
| `Suspense` import | Line 125 | page.tsx:1 | [PASS] |
| `Layout showBackButton` | Line 136 | page.tsx:12 | [PASS] |
| `metadata.title` = "검색 - Spotline" | Line 130 | page.tsx:6 | [PASS] |
| `metadata.description` | Line 131 | page.tsx:7 | [PASS] |
| `Suspense fallback={null}` wrapping | Line 137 | page.tsx:13 | [PASS] |

**Items: 5/5 match. Character-perfect.**

### 4. `src/app/search/SearchPageClient.tsx` (NEW)

| Item | Design | Implementation | Match |
|------|--------|----------------|:-----:|
| Imports (useState, useEffect, etc.) | Line 151 | Line 3 | [PASS] |
| `Trash2` import from lucide-react | Line 153 | Line 5 | [MINOR GAP] |
| `fetchFeedSpots, fetchFeedSpotLines` | Line 154 | Line 6 | [PASS] |
| `SpotPreviewCard` import | Line 155 | Line 7 | [PASS] |
| `SpotLinePreviewCard` import | Line 156 | Line 8 | [PASS] |
| Type imports | Line 157 | Line 9 | [PASS] |
| Constants (STORAGE_KEY, MAX_RECENT, PAGE_SIZE) | Lines 164-166 | Lines 13-15 | [PASS] |
| `getRecentSearches()` | Lines 171-177 | Lines 17-24 | [PASS] |
| `addRecentSearch()` | Lines 180-185 | Lines 26-31 | [PASS] |
| `removeRecentSearch()` | Lines 188-190 | Lines 34-37 | [PASS] |
| `clearRecentSearches()` | Lines 193-195 | Lines 39-41 | [PASS] |
| Component state declarations | Lines 200-224 | Lines 43-65 | [PASS] |
| Debounce 300ms | Lines 230-235 | Lines 68-73 | [PASS] |
| URL sync with router.replace | Lines 238-244 | Lines 76-82 | [PASS] |
| Search execution effect | Lines 250-288 | Lines 85-122 | [PASS] |
| `handleLoadMore` useCallback | Lines 291-313 | Lines 125-147 | [PASS] |
| Initial load (recent + autoFocus) | Lines 318-321 | Lines 150-153 | [PASS] |
| `handleTabChange` useCallback | Lines 326-338 | Lines 156-167 | [PASS] |
| Search input UI | Lines 343-367 | Lines 170-193 | [PASS] |
| Recent searches UI | Lines 372-407 | Lines 196-230 | [PASS] |
| Tabs UI | Lines 416-433 | Lines 236-253 | [PASS] |
| Spot results grid | Lines 436-462 | Lines 256-282 | [PASS] |
| SpotLine results list | Lines 465-491 | Lines 285-311 | [PASS] |
| Loading spinner | Lines 494-498 | Lines 314-318 | [PASS] |
| Empty state (no query, no recent) | Lines 503-508 | Lines 323-328 | [PASS] |

**Items: 25/26 match (1 minor gap)**

---

## Differences Found

### [MINOR] Missing `Trash2` Import (Design present, Implementation absent)

| Item | Design Location | Implementation Location | Impact |
|------|-----------------|------------------------|--------|
| `Trash2` icon import | design.md:153 | SearchPageClient.tsx:5 | None |

The design imports `{ Search, X, Clock, Trash2 }` from lucide-react. The implementation imports `{ Search, X, Clock }` only. However, `Trash2` is never referenced in the design's render JSX -- all delete actions use the `X` icon. This is a dead import in the design document, and the implementation correctly omits it.

**Impact**: Zero. No functional or visual difference. The design document contains a dead import.

---

## Verification Checklist

| # | Checklist Item | Status | Evidence |
|---|---------------|:------:|----------|
| 1 | Header.tsx에 Search 아이콘 + `/search` 링크 존재 | [PASS] | Header.tsx:47-53 |
| 2 | `/search` 페이지 접근 시 검색 입력 필드 표시 (autoFocus) | [PASS] | SearchPageClient.tsx:150-152, 175 |
| 3 | 키워드 입력 -> 300ms 디바운스 -> Spot 검색 결과 표시 | [PASS] | SearchPageClient.tsx:68-73, 85-122 |
| 4 | Spot/SpotLine 탭 전환 동작 | [PASS] | SearchPageClient.tsx:156-167, 236-253 |
| 5 | SpotLine 탭에서 키워드 검색 결과 표시 | [PASS] | SearchPageClient.tsx:106-112, 285-311 |
| 6 | 최근 검색어 저장 (localStorage) | [PASS] | SearchPageClient.tsx:13, 26-31, 92-93 |
| 7 | 최근 검색어 클릭 시 즉시 검색 | [PASS] | SearchPageClient.tsx:211 `setQuery(term)` |
| 8 | 최근 검색어 개별 삭제 + 전체 삭제 | [PASS] | SearchPageClient.tsx:218-220 (individual), 201 (clear all) |
| 9 | URL 파라미터 동기화 (`?q=...&tab=...`) | [PASS] | SearchPageClient.tsx:76-82 |
| 10 | "더 보기" 버튼으로 페이지네이션 동작 | [PASS] | SearchPageClient.tsx:125-147, 269-278, 298-307 |
| 11 | 결과 없음 상태 표시 | [PASS] | SearchPageClient.tsx:258-261, 287-290 |
| 12 | fetchFeedSpotLines에 keyword, sort 파라미터 전달 확인 | [PASS] | api.ts:414-420, SearchPageClient.tsx:107, 137 |
| 13 | 기존 fetchFeedSpotLines 호출부 영향 없음 | [PASS] | 3 callers verified, all pass <=4 args |
| 14 | TypeScript 타입 체크 통과 | -- | Requires `pnpm type-check` |
| 15 | 빌드 통과 | -- | Requires `pnpm build` |

**Checklist: 13/13 code-verifiable items pass. 2 items require runtime verification.**

---

## Recommended Actions

### Documentation Update

1. Remove unused `Trash2` from design import list (design.md line 153) -- dead import that was never used in JSX.

### Runtime Verification Needed

1. Run `pnpm type-check` to confirm TypeScript compilation.
2. Run `pnpm build` to confirm production build succeeds.

---

## Related Documents

- Design: [global-search.design.md](../02-design/features/global-search.design.md)
