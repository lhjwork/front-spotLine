# Design: blog-sort-filter

## 1. Overview

블로그 피드(`/blogs`)와 내 블로그(`/my-blogs`)에 정렬 드롭다운을 추가한다.
기존 FeedSortDropdown 컴포넌트를 직접 재활용하고, FeedFilterReset은 blog 전용으로 간소화한 인라인 버튼으로 구현한다.

---

## 2. Implementation Order

| # | File | Change | LOC |
|---|------|--------|-----|
| 1 | `src/lib/api.ts` | fetchBlogs, fetchMyBlogs에 sort 파라미터 추가 | ~6 |
| 2 | `src/app/blogs/BlogsPageClient.tsx` | sort 상태, FeedSortDropdown, URL 동기화, 필터 초기화 | ~40 |
| 3 | `src/components/blog/MyBlogsList.tsx` | sort 상태, FeedSortDropdown 추가 | ~25 |

---

## 3. Detailed Changes

### 3.1 `src/lib/api.ts` — API 함수 시그니처 확장

#### fetchBlogs
```typescript
// BEFORE
export async function fetchBlogs(
  page = 0, size = 20, area?: string
)

// AFTER
export async function fetchBlogs(
  page = 0, size = 20, area?: string, sort?: string
)
// params에 sort 추가: { page, size, area: area || undefined, sort: sort || undefined }
```

#### fetchMyBlogs
```typescript
// BEFORE
export async function fetchMyBlogs(
  status?: string, page = 0, size = 20
)

// AFTER
export async function fetchMyBlogs(
  status?: string, page = 0, size = 20, sort?: string
)
// params에 sort 추가: { status: status || undefined, page, size, sort: sort || undefined }
```

### 3.2 `src/app/blogs/BlogsPageClient.tsx` — 정렬 + URL 동기화

#### 3.2.1 Import 추가
```typescript
import { useRouter, useSearchParams } from "next/navigation";
import FeedSortDropdown from "@/components/feed/FeedSortDropdown";
import { RotateCcw } from "lucide-react";
import type { FeedSort } from "@/types";
```

#### 3.2.2 State 추가
```typescript
const router = useRouter();
const searchParams = useSearchParams();

// URL에서 초기값 복원
const [sort, setSort] = useState<FeedSort>(
  (searchParams.get("sort") as FeedSort) || "popular"
);
const [area, setArea] = useState<string | null>(searchParams.get("area"));
```

#### 3.2.3 URL 동기화 effect
```typescript
useEffect(() => {
  const params = new URLSearchParams();
  if (area) params.set("area", area);
  if (sort !== "popular") params.set("sort", sort);
  const query = params.toString();
  router.replace(`/blogs${query ? `?${query}` : ""}`, { scroll: false });
}, [area, sort, router]);
```

#### 3.2.4 Sort 변경 핸들러
```typescript
const handleSortChange = useCallback((newSort: FeedSort) => {
  setSort(newSort);
  setPage(0);
  setBlogs([]);
  setHasMore(true);
}, []);
```

#### 3.2.5 fetchBlogs 호출에 sort 전달
```typescript
// useEffect 내부 load 함수에서:
const result = await fetchBlogs(page, 20, area || undefined, sort);
```
- useEffect dependency에 `sort` 추가

#### 3.2.6 UI 렌더링 변경

헤더 영역(h1 아래, FeedAreaTabs 위)에 정렬 드롭다운과 필터 초기화 추가:

```tsx
{/* Header + Sort */}
<div className="px-4 pt-6 pb-2">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-xl font-bold text-gray-900">블로그</h1>
      <p className="mt-1 text-sm text-gray-500">경험이 담긴 이야기를 만나보세요</p>
    </div>
    <FeedSortDropdown selected={sort} onSelect={handleSortChange} />
  </div>
</div>

<FeedAreaTabs selected={area} onSelect={handleAreaChange} />

{/* Filter Reset — area 또는 sort가 기본값이 아닌 경우만 표시 */}
{(area || sort !== "popular") && (
  <div className="px-4 py-1">
    <button
      type="button"
      onClick={() => { handleAreaChange(null); handleSortChange("popular"); }}
      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
    >
      <RotateCcw className="h-3 w-3" />
      필터 초기화
    </button>
  </div>
)}
```

#### 3.2.7 initialBlogs 분기 조건 수정

SSR 초기 데이터는 area=null, sort=popular일 때만 사용:
```typescript
// useEffect에서:
if (area === null && sort === "popular" && page === 0 && initialBlogs.length > 0) {
  setBlogs(initialBlogs);
  setHasMore(initialHasMore);
  return;
}
```

### 3.3 `src/components/blog/MyBlogsList.tsx` — 정렬 드롭다운

#### 3.3.1 Import 추가
```typescript
import FeedSortDropdown from "@/components/feed/FeedSortDropdown";
import type { FeedSort } from "@/types";
```

#### 3.3.2 State 추가
```typescript
const [sort, setSort] = useState<FeedSort>("newest");
```

#### 3.3.3 loadBlogs에 sort 전달
```typescript
const loadBlogs = useCallback(async (pageNum: number, status?: string, sortBy?: string) => {
  setIsLoading(true);
  try {
    const result = await fetchMyBlogs(
      status === "all" ? undefined : status,
      pageNum,
      20,
      sortBy
    );
    // ... 기존 로직
  }
}, []);
```

#### 3.3.4 sort 변경 시 리로드
```typescript
useEffect(() => {
  setPage(0);
  loadBlogs(0, activeTab, sort);
}, [activeTab, sort, loadBlogs]);

const handleSortChange = useCallback((newSort: FeedSort) => {
  setSort(newSort);
}, []);
```

#### 3.3.5 UI — 탭 행에 드롭다운 추가
```tsx
{/* Tabs + Sort */}
<div className="flex items-center justify-between border-b px-4 py-2">
  <div className="flex gap-2">
    {tabs.map((tab) => (
      <button key={tab.key} ... >
        {tab.label}
      </button>
    ))}
  </div>
  <FeedSortDropdown selected={sort} onSelect={handleSortChange} />
</div>
```

#### 3.3.6 더 보기 버튼에 sort 전달
```typescript
onClick={() => {
  const next = page + 1;
  setPage(next);
  loadBlogs(next, activeTab, sort);
}}
```

---

## 4. Component Reuse

| Component | Reuse | Notes |
|-----------|-------|-------|
| FeedSortDropdown | 그대로 import | FeedSort 타입 호환, 옵션 ["인기순", "최신순"] |
| FeedAreaTabs | 이미 사용 중 | 변경 없음 |
| FeedFilterReset | **사용 안 함** | props 구조(category, keyword 필수)가 blog에 맞지 않아 인라인 버튼으로 대체 |

---

## 5. Type Changes

**변경 없음** — 기존 `FeedSort = "popular" | "newest"` 타입을 그대로 재활용.

`/my-blogs`에서 "newest"가 기본값이므로 "popular"과 "newest" 양쪽 모두 사용.
Backend에서 sort 파라미터 미인식 시 기본 정렬(createdAt DESC)이 적용되므로 안전.

---

## 6. Backend Compatibility

- `sort` 파라미터를 쿼리에 포함하되, Backend가 무시하더라도 에러 발생 안 함 (Spring Boot는 미인식 파라미터 무시)
- Backend가 sort를 지원하면 정렬 동작, 미지원이면 기본 정렬 유지
- 향후 Backend에서 `sort=popular` (viewsCount+likesCount 기반) 정렬 지원 시 자동 동작

---

## 7. Verification Checklist

- [ ] `/blogs`에서 FeedSortDropdown 렌더링
- [ ] 인기순/최신순 전환 시 목록 재요청
- [ ] area + sort 조합 동작
- [ ] URL에 sort/area 파라미터 반영
- [ ] URL 직접 접근 시 필터 복원
- [ ] 필터 초기화 버튼 동작
- [ ] `/my-blogs`에서 FeedSortDropdown 렌더링
- [ ] 탭 + sort 조합 동작
- [ ] 더 보기 버튼에 sort 반영
- [ ] SSR 초기 데이터 정상 (area=null, sort=popular일 때)
- [ ] `pnpm type-check` 통과
- [ ] `pnpm build` 통과
