# Design: admin-blog-management

## 1. Overview

admin-spotLine 레포에 블로그 관리 기능을 추가한다. 기존 SpotManagement 패턴(DataTable + 필터 + useQuery/useMutation)을 그대로 따른다.

**Target Repo**: `/Users/hanjinlee/Desktop/projects/qrAd/admin-spotLine/`

---

## 2. Implementation Order

| # | File | Change | LOC |
|---|------|--------|-----|
| 1 | `src/types/v2.ts` | BlogListItem, BlogDetailResponse 타입 추가 | ~35 |
| 2 | `src/services/v2/blogAPI.ts` | 블로그 API 서비스 (새 파일) | ~40 |
| 3 | `src/pages/BlogManagement.tsx` | 블로그 목록 페이지 (새 파일) | ~140 |
| 4 | `src/pages/BlogDetail.tsx` | 블로그 상세 페이지 (새 파일) | ~120 |
| 5 | `src/components/Layout.tsx` | 네비게이션에 "콘텐츠" 섹션 추가 | ~5 |
| 6 | `src/App.tsx` | 라우트 추가 | ~8 |

---

## 3. Detailed Changes

### 3.1 `src/types/v2.ts` — 타입 추가

기존 파일 하단에 추가:

```typescript
// Blog types
export type BlogStatus = "DRAFT" | "PUBLISHED";

export interface BlogListItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  status: BlogStatus;
  userName: string;
  userAvatarUrl: string | null;
  spotLineTitle: string;
  spotLineArea: string;
  spotCount: number;
  viewsCount: number;
  likesCount: number;
  publishedAt: string | null;
  createdAt: string;
}

export interface BlogDetailResponse extends BlogListItem {
  spotLineId: string;
  spotLineSlug: string;
  userId: string;
  savesCount: number;
  commentsCount: number;
  updatedAt: string;
}
```

### 3.2 `src/services/v2/blogAPI.ts` — API 서비스 (새 파일)

spotAPI.ts 패턴을 따름:

```typescript
import { apiClient } from "../base/apiClient";
import type { BlogListItem, BlogDetailResponse, SpringPage } from "../../types/v2";

export interface BlogListParams {
  page?: number; // 1-indexed (UI 기준)
  size?: number;
  status?: string;
  area?: string;
  keyword?: string;
}

export const blogAPI = {
  getList: (params: BlogListParams = {}) => {
    const { page = 1, size = 20, ...rest } = params;
    return apiClient.get<SpringPage<BlogListItem>>("/api/v2/blogs", {
      params: { page: page - 1, size, ...rest }, // 1-indexed → 0-indexed
    });
  },

  getBySlug: (slug: string) =>
    apiClient.get<BlogDetailResponse>(`/api/v2/blogs/${slug}`),

  unpublish: (slug: string) =>
    apiClient.patch(`/api/v2/blogs/${slug}/unpublish`),

  delete: (slug: string) =>
    apiClient.delete(`/api/v2/blogs/${slug}`),
};
```

### 3.3 `src/pages/BlogManagement.tsx` — 목록 페이지 (새 파일)

SpotManagement.tsx 패턴을 따름:

```typescript
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import { blogAPI } from "../services/v2/blogAPI";
import type { BlogListItem } from "../types/v2";
import { toDataTablePagination } from "../types/v2";
import { AREAS } from "../constants";
import { Eye, EyeOff, Trash2 } from "lucide-react";
```

#### State
```typescript
const [page, setPage] = useState(1);
const [statusFilter, setStatusFilter] = useState("");
const [areaFilter, setAreaFilter] = useState("");
const [searchInput, setSearchInput] = useState("");
const [keyword, setKeyword] = useState("");
const navigate = useNavigate();
const queryClient = useQueryClient();
```

#### Query
```typescript
const { data, isLoading } = useQuery({
  queryKey: ["blogs", page, statusFilter, areaFilter, keyword],
  queryFn: () => blogAPI.getList({
    page,
    size: 20,
    status: statusFilter || undefined,
    area: areaFilter || undefined,
    keyword: keyword || undefined,
  }),
  placeholderData: keepPreviousData,
});

const springPage = data?.data;
const blogs = springPage?.content ?? [];
const pagination = springPage ? toDataTablePagination(springPage) : null;
```

#### Mutations
```typescript
const unpublishMutation = useMutation({
  mutationFn: (slug: string) => blogAPI.unpublish(slug),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blogs"] }),
});

const deleteMutation = useMutation({
  mutationFn: (slug: string) => blogAPI.delete(slug),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blogs"] }),
});
```

#### Columns
```typescript
const columns = [
  { key: "title", label: "제목" },
  { key: "userName", label: "작성자" },
  { key: "spotLineArea", label: "지역" },
  {
    key: "status",
    label: "상태",
    render: (val: string) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        val === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
      }`}>
        {val === "PUBLISHED" ? "발행됨" : "초안"}
      </span>
    ),
  },
  {
    key: "viewsCount",
    label: "조회",
    render: (val: number) => val.toLocaleString(),
  },
  {
    key: "likesCount",
    label: "좋아요",
    render: (val: number) => val.toLocaleString(),
  },
  {
    key: "publishedAt",
    label: "발행일",
    render: (val: string | null) => val ? new Date(val).toLocaleDateString("ko-KR") : "-",
  },
];
```

#### Filters UI
```tsx
{/* 상태 탭 */}
<div className="flex gap-2 mb-4">
  {[
    { key: "", label: "전체" },
    { key: "PUBLISHED", label: "발행됨" },
    { key: "DRAFT", label: "초안" },
  ].map((tab) => (
    <button
      key={tab.key}
      onClick={() => { setStatusFilter(tab.key); setPage(1); }}
      className={`px-3 py-1.5 text-sm rounded-md ${
        statusFilter === tab.key
          ? "bg-primary-600 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>

{/* 검색 + 지역 필터 */}
<div className="flex flex-wrap gap-3 mb-4">
  <input type="text" value={searchInput} onChange={...} placeholder="제목 또는 작성자 검색..." className="..." />
  <select value={areaFilter} onChange={...} className="...">
    <option value="">전체 지역</option>
    {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
  </select>
  {pagination && <span className="text-sm text-gray-500 self-center">총 {pagination.count}개</span>}
</div>
```

#### Actions
```typescript
actions={(row: BlogListItem) => (
  <div className="py-1">
    <button
      onClick={() => navigate(`/blogs/${row.slug}`)}
      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      <Eye className="h-4 w-4 mr-2" /> 상세보기
    </button>
    {row.status === "PUBLISHED" && (
      <button
        onClick={() => {
          if (window.confirm(`"${row.title}" 블로그를 비공개 처리하시겠습니까?`)) {
            unpublishMutation.mutate(row.slug);
          }
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
      >
        <EyeOff className="h-4 w-4 mr-2" /> 비공개
      </button>
    )}
    <button
      onClick={() => {
        if (window.confirm(`"${row.title}" 블로그를 삭제하시겠습니까?`)) {
          deleteMutation.mutate(row.slug);
        }
      }}
      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4 mr-2" /> 삭제
    </button>
  </div>
)}
```

### 3.4 `src/pages/BlogDetail.tsx` — 상세 페이지 (새 파일)

```typescript
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogAPI } from "../services/v2/blogAPI";
import { ArrowLeft, EyeOff, Trash2, ExternalLink } from "lucide-react";
```

#### Content
- 상단: 뒤로가기 버튼 + 제목 + 액션 버튼들 (비공개, 삭제)
- 메타데이터 카드: 작성자, 상태, 지역, SpotLine 정보, 통계 (조회/좋아요/저장/댓글)
- 블로그 요약 (summary) 표시
- 커버 이미지 표시 (있는 경우)
- "프론트에서 보기" 외부 링크 버튼 → `${SITE_URL}/blog/${slug}`

```tsx
export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => blogAPI.getBySlug(slug!),
    enabled: !!slug,
  });

  const blog = data?.data;

  const unpublishMutation = useMutation({
    mutationFn: () => blogAPI.unpublish(slug!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog", slug] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => blogAPI.delete(slug!),
    onSuccess: () => navigate("/blogs"),
  });

  // ... render
}
```

#### Layout
```tsx
<div>
  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <button onClick={() => navigate("/blogs")} className="...">
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{blog.title}</h1>
        <p className="text-sm text-gray-500">{blog.userName} · {blog.spotLineArea}</p>
      </div>
    </div>
    <div className="flex gap-2">
      {blog.status === "PUBLISHED" && (
        <button onClick={handleUnpublish} className="... border-orange-300 text-orange-600 ...">
          <EyeOff className="h-4 w-4 mr-1" /> 비공개
        </button>
      )}
      <button onClick={handleDelete} className="... border-red-300 text-red-600 ...">
        <Trash2 className="h-4 w-4 mr-1" /> 삭제
      </button>
      <a href={`${SITE_URL}/blog/${slug}`} target="_blank" rel="noopener noreferrer" className="...">
        <ExternalLink className="h-4 w-4 mr-1" /> 프론트에서 보기
      </a>
    </div>
  </div>

  {/* Metadata Grid */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <StatCard label="상태" value={blog.status === "PUBLISHED" ? "발행됨" : "초안"} />
    <StatCard label="조회수" value={blog.viewsCount.toLocaleString()} />
    <StatCard label="좋아요" value={blog.likesCount.toLocaleString()} />
    <StatCard label="댓글" value={blog.commentsCount.toLocaleString()} />
  </div>

  {/* Cover Image */}
  {blog.coverImageUrl && (
    <img src={blog.coverImageUrl} alt="" className="w-full max-h-64 object-cover rounded-lg mb-6" />
  )}

  {/* Summary */}
  {blog.summary && (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">요약</h3>
      <p className="text-gray-700">{blog.summary}</p>
    </div>
  )}

  {/* SpotLine Info */}
  <div className="bg-gray-50 rounded-lg p-4">
    <h3 className="text-sm font-medium text-gray-500 mb-2">연결된 SpotLine</h3>
    <p className="text-gray-700">{blog.spotLineTitle} · {blog.spotLineArea} · {blog.spotCount}곳</p>
  </div>
</div>
```

`StatCard`는 인라인 컴포넌트로 작성:
```tsx
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}
```

### 3.5 `src/components/Layout.tsx` — 네비게이션 추가

#### Import 추가
```typescript
import { FileText } from "lucide-react";
```

#### navigation 배열에 콘텐츠 섹션 추가
기존 "파트너 섹션" 위에 추가:

```typescript
// 콘텐츠 섹션
{ name: "블로그 관리", href: "/blogs", icon: FileText, section: "content", minRole: "admin" },
```

#### sidebarContent에 NavSection 추가
기존 `<NavSection title="파트너".../>` 위에:

```tsx
<NavSection title="콘텐츠" section="content" onClick={onNav} />
```

### 3.6 `src/App.tsx` — 라우트 추가

#### Import 추가
```typescript
import BlogManagement from "./pages/BlogManagement";
import BlogDetail from "./pages/BlogDetail";
```

#### Routes 추가 (partners 블록 위에)
```tsx
<Route path="blogs" element={
  <ProtectedRoute requiredRole="admin"><BlogManagement /></ProtectedRoute>
} />
<Route path="blogs/:slug" element={
  <ProtectedRoute requiredRole="admin"><BlogDetail /></ProtectedRoute>
} />
```

---

## 4. Verification Checklist

- [ ] types/v2.ts에 BlogListItem, BlogDetailResponse, BlogStatus 타입 존재
- [ ] blogAPI.ts에 getList, getBySlug, unpublish, delete 메서드 존재
- [ ] BlogManagement.tsx에 DataTable + 상태탭 + 지역필터 + 검색 + 페이지네이션
- [ ] BlogManagement.tsx에 unpublish/delete 액션 버튼
- [ ] BlogDetail.tsx에 메타데이터 + 통계 + 커버이미지 + 요약 + SpotLine 정보
- [ ] BlogDetail.tsx에 비공개/삭제/프론트에서보기 버튼
- [ ] Layout.tsx에 "콘텐츠" 섹션 + "블로그 관리" 메뉴
- [ ] App.tsx에 /blogs, /blogs/:slug 라우트
- [ ] admin 이상 권한 체크 (ProtectedRoute + minRole)
- [ ] TypeScript 타입 체크 통과
- [ ] 빌드 통과
