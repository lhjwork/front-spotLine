# Gap Analysis: admin-blog-management

> **Summary**: Design-implementation gap analysis for blog management feature in admin-spotLine
>
> **Author**: Claude (gap-detector)
> **Created**: 2026-04-07
> **Status**: Approved

---

## Analysis Overview

- **Analysis Target**: admin-blog-management
- **Design Document**: `front-spotLine/docs/02-design/features/admin-blog-management.design.md`
- **Implementation Path**: `admin-spotLine/src/` (6 files)
- **Analysis Date**: 2026-04-07

## Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| Design Match | 100% | OK |
| Architecture Compliance | 100% | OK |
| Convention Compliance | 100% | OK |
| **Overall** | **100%** | OK |

---

## Detailed Comparison

### 1. Types (`src/types/v2.ts`)

| Spec Item | Design | Implementation | Match |
|-----------|--------|----------------|:-----:|
| BlogStatus type | `"DRAFT" \| "PUBLISHED"` | `"DRAFT" \| "PUBLISHED"` (line 275) | OK |
| BlogListItem interface | 14 fields specified | All 14 fields present (lines 277-293) | OK |
| BlogDetailResponse interface | extends BlogListItem + 5 fields | Exact match (lines 295-302) | OK |
| Field types (nullable) | `string \| null` for summary, coverImageUrl, etc. | Matches exactly | OK |

### 2. API Service (`src/services/v2/blogAPI.ts`)

| Spec Item | Design | Implementation | Match |
|-----------|--------|----------------|:-----:|
| Import path | `../base/apiClient` | `../base/apiClient` (line 1) | OK |
| BlogListParams interface | 5 params (page, size, status, area, keyword) | Exact match (lines 4-10) | OK |
| getList method | 1-indexed to 0-indexed conversion, `/api/v2/blogs` | Exact match (lines 13-18) | OK |
| getBySlug method | `GET /api/v2/blogs/${slug}` | Exact match (lines 20-21) | OK |
| unpublish method | `PATCH /api/v2/blogs/${slug}/unpublish` | Exact match (lines 23-24) | OK |
| delete method | `DELETE /api/v2/blogs/${slug}` | Exact match (lines 26-27) | OK |

### 3. Blog List Page (`src/pages/BlogManagement.tsx`)

| Spec Item | Design | Implementation | Match |
|-----------|--------|----------------|:-----:|
| Imports | react, react-query, react-router, DataTable, blogAPI, lucide | All present (lines 1-9) | OK |
| State variables | page, statusFilter, areaFilter, searchInput, keyword | Exact match (lines 12-16) | OK |
| Query key | `["blogs", page, statusFilter, areaFilter, keyword]` | Exact match (line 30) | OK |
| placeholderData | keepPreviousData | Exact match (line 38) | OK |
| unpublishMutation | invalidates `["blogs"]` | Exact match (lines 45-48) | OK |
| deleteMutation | invalidates `["blogs"]` | Exact match (lines 50-53) | OK |
| Columns (7) | title, userName, spotLineArea, status, viewsCount, likesCount, publishedAt | All 7 present (lines 55-85) | OK |
| Status badge render | PUBLISHED=green, DRAFT=gray | Exact match (lines 62-68) | OK |
| Status tabs | 3 tabs (all, PUBLISHED, DRAFT) | Exact match (lines 96-112) | OK |
| Search input | debounced keyword search | Implemented with 300ms debounce (lines 20-27) | OK |
| Area filter | AREAS constant, select dropdown | Exact match (lines 124-131) | OK |
| Total count display | `pagination.count` | Exact match (lines 132-134) | OK |
| Actions: view detail | navigate to `/blogs/${row.slug}` | Exact match (line 146) | OK |
| Actions: unpublish | confirm dialog, PUBLISHED only | Exact match (lines 151-161) | OK |
| Actions: delete | confirm dialog | Exact match (lines 162-172) | OK |

### 4. Blog Detail Page (`src/pages/BlogDetail.tsx`)

| Spec Item | Design | Implementation | Match |
|-----------|--------|----------------|:-----:|
| Imports | react-router, react-query, blogAPI, lucide icons | All present (lines 1-4) | OK |
| SITE_URL constant | Used for external link | `"https://spotline.kr"` (line 6) | OK |
| StatCard component | inline, label+value props | Exact match (lines 8-15) | OK |
| Query: blog detail | key=`["blog", slug]`, enabled=`!!slug` | Exact match (lines 22-26) | OK |
| unpublishMutation | invalidates both `["blog", slug]` and `["blogs"]` | Exact match (lines 30-36) | OK |
| deleteMutation | navigates to `/blogs` on success | Exact match (lines 38-41) | OK |
| Header: back button | ArrowLeft icon, navigate to `/blogs` | Exact match (lines 74-79) | OK |
| Header: title + subtitle | `blog.title`, `userName + spotLineArea` | Exact match (lines 80-83) | OK |
| Unpublish button | PUBLISHED only, orange styling, EyeOff icon | Exact match (lines 86-93) | OK |
| Delete button | red styling, Trash2 icon | Exact match (lines 95-100) | OK |
| External link | `${SITE_URL}/blog/${slug}`, target=_blank | Exact match (lines 102-109) | OK |
| Metadata grid | 4 StatCards (status, views, likes, comments) | Exact match (lines 114-119) | OK |
| Cover image | conditional render, max-h-64, object-cover | Exact match (lines 122-128) | OK |
| Summary section | conditional render, bg-gray-50 | Exact match (lines 131-136) | OK |
| SpotLine info | spotLineTitle + spotLineArea + spotCount | Exact match (lines 139-144) | OK |
| Loading state | spinner component | Present (lines 55-61) | OK |
| Not found state | error message | Present (lines 63-67) | OK |
| Button disabled during mutation | `disabled={isPending}` | Present (lines 89, 97) | OK |

### 5. Layout Navigation (`src/components/Layout.tsx`)

| Spec Item | Design | Implementation | Match |
|-----------|--------|----------------|:-----:|
| FileText import | from lucide-react | Present (line 5) | OK |
| Navigation entry | name="blog management", href="/blogs", icon=FileText, section="content", minRole="admin" | Exact match (line 31) | OK |
| NavSection: "content" | `<NavSection title="content" section="content" />` above partner section | Exact match (line 113), positioned between curation and partner | OK |

### 6. Routes (`src/App.tsx`)

| Spec Item | Design | Implementation | Match |
|-----------|--------|----------------|:-----:|
| BlogManagement import | from `./pages/BlogManagement` | Exact match (line 16) | OK |
| BlogDetail import | from `./pages/BlogDetail` | Exact match (line 17) | OK |
| Route: /blogs | ProtectedRoute requiredRole="admin" | Exact match (lines 67-69) | OK |
| Route: /blogs/:slug | ProtectedRoute requiredRole="admin" | Exact match (lines 70-72) | OK |
| Route position | before partners block | Correct: lines 67-72 before partners at line 73 | OK |

---

## Verification Checklist (from Design Section 4)

- [x] types/v2.ts: BlogListItem, BlogDetailResponse, BlogStatus types exist
- [x] blogAPI.ts: getList, getBySlug, unpublish, delete methods exist
- [x] BlogManagement.tsx: DataTable + status tabs + area filter + search + pagination
- [x] BlogManagement.tsx: unpublish/delete action buttons
- [x] BlogDetail.tsx: metadata + stats + cover image + summary + SpotLine info
- [x] BlogDetail.tsx: unpublish/delete/view-on-front buttons
- [x] Layout.tsx: "content" section + "blog management" menu
- [x] App.tsx: /blogs, /blogs/:slug routes
- [x] admin role check (ProtectedRoute + minRole)

---

## Differences Found

### Missing Features (Design O, Implementation X)

None.

### Added Features (Design X, Implementation O)

| Item | Implementation Location | Description | Impact |
|------|------------------------|-------------|--------|
| Button disabled state | BlogDetail.tsx:89,97 | `disabled={isPending}` on mutation buttons | Low (positive UX improvement) |
| Loading spinner | BlogDetail.tsx:55-61 | Explicit loading state with spinner | Low (positive UX improvement) |
| Not found state | BlogDetail.tsx:63-67 | Explicit not-found message | Low (positive UX improvement) |

These additions are all positive UX improvements that go beyond the design spec. No action needed.

### Changed Features (Design != Implementation)

None.

---

## Recommended Actions

No action required. Implementation matches design at 100%. The three minor additions (disabled state, loading spinner, not-found state) are standard UX patterns that improve the implementation beyond the minimum spec.

---

## Related Documents

- Design: [admin-blog-management.design.md](../02-design/features/admin-blog-management.design.md)
