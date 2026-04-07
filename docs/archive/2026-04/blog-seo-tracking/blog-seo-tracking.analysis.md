# Blog SEO & View Tracking -- Gap Analysis Report

> **Feature**: blog-seo-tracking
> **Design Document**: `front-spotLine/docs/02-design/features/blog-seo-tracking.design.md`
> **Analysis Date**: 2026-04-07
> **Version**: 0.1

---

## Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| Design Match | 100% | Pass |
| Architecture Compliance | 100% | Pass |
| Convention Compliance | 100% | Pass |
| **Overall** | **100%** | Pass |

---

## FR Checklist (6/6 Implemented)

| FR | Description | File(s) | Status | Notes |
|----|-------------|---------|:------:|-------|
| FR-01 | POST /blogs/{id}/view endpoint | AnalyticsController.java, AnalyticsService.java, SecurityConfig.java | Done | Endpoint, service method, and permitAll rule all present |
| FR-02 | Duplicate prevention (5min) | -- | N/A | Design marked as "optional/enhancement"; not implemented, not required |
| FR-03 | incrementBlogView() API function | api.ts | Done | Verbatim match: fire-and-forget, 3s timeout |
| FR-04 | ViewTracker "blog" type | ViewTracker.tsx | Done | Verbatim match: type union, else branch |
| FR-05 | blog/[slug] ViewTracker rendering | blog/[slug]/page.tsx | Done | TODO replaced with `<ViewTracker type="blog" id={blog.id} />` |
| FR-06 | sitemap blog URLs | sitemap.ts | Done | fetchBlogSlugs() in Promise.all, priority 0.6, weekly |

---

## Deviations (Minor, 2 items -- both beneficial)

### 1. Service location: BlogService vs AnalyticsService

| Aspect | Design | Implementation |
|--------|--------|----------------|
| Service class | `BlogService.incrementViewCount(blogId)` | `AnalyticsService.incrementBlogView(blogId)` |
| Repository | `BlogRepository.incrementViewCount()` (custom @Query) | `blogRepository.findById()` + entity setter + `save()` |

**Impact**: Low. The implementation follows the existing pattern used by `incrementSpotView` and `incrementSpotLineView`, which are both in AnalyticsService. Placing blog view counting alongside spot/spotline view counting in AnalyticsService is more consistent with the codebase. The design proposed a new method in BlogService and a custom `@Modifying @Query` in BlogRepository; the implementation instead uses the find-mutate-save pattern already established in AnalyticsService. Both achieve the same result (views_count + 1). The implementation pattern is arguably better because it validates blog existence and throws `ResourceNotFoundException` on missing ID.

**Verdict**: Beneficial deviation -- better consistency with existing codebase patterns.

### 2. BlogRepository -- no custom @Query added

| Aspect | Design | Implementation |
|--------|--------|----------------|
| BlogRepository change | `@Modifying @Query("UPDATE Blog b SET b.viewsCount = b.viewsCount + 1 WHERE b.id = :id")` | No change needed -- AnalyticsService uses `findById` + setter |

**Impact**: None. The custom query is unnecessary because the implementation uses the standard JPA find-mutate-save flow. No BlogRepository modification was required.

**Verdict**: Acceptable -- fewer code changes, same outcome.

---

## File Inventory (7 design files, 5 actually changed)

| Design File | Repo | Design Change | Actual Change | Match |
|-------------|------|--------------|---------------|:-----:|
| AnalyticsController.java | backend | Add endpoint | Added lines 64-69 | Yes |
| BlogService.java | backend | Add method | Not modified (in AnalyticsService instead) | Deviation |
| BlogRepository.java | backend | Add @Query | Not modified (not needed) | Deviation |
| AnalyticsService.java | backend | Not in design | Added incrementBlogView() lines 106-112 | Extra |
| SecurityConfig.java | backend | Add permitAll | `/api/v2/blogs/*/view` in permitAll line 43 | Yes |
| src/lib/api.ts | front | Add function | Lines 1217-1222 | Yes |
| src/components/common/ViewTracker.tsx | front | Extend type | Verbatim match | Yes |
| src/app/blog/[slug]/page.tsx | front | Replace TODO | Line 59: `<ViewTracker type="blog" id={blog.id} />` | Yes |
| src/app/sitemap.ts | front | Add blog URLs | Lines 2, 31-34, 51-56, 58 | Yes |

---

## Beneficial Extras (1 item)

| Item | Location | Description |
|------|----------|-------------|
| Blog existence validation | AnalyticsService.java:108-109 | `findById` + `orElseThrow(ResourceNotFoundException)` -- design's `@Query` approach would silently succeed on nonexistent IDs |

---

## Missing Features (0 items)

None. All required FRs are implemented.

---

## Recommended Actions

### Documentation Update
1. Update design document Section 2.2/2.3 to reflect that the implementation uses `AnalyticsService` (not `BlogService`) and the find-mutate-save pattern (not a custom `@Query`), matching the existing spot/spotline view counting pattern.

### No Code Changes Needed
All functional requirements are met. The two deviations are beneficial and align with existing codebase conventions.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-07 | Initial analysis -- 100% match rate, 2 minor beneficial deviations | Claude Code |
