# Plan: admin-blog-management

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | admin-spotLine에 블로그 관리 기능이 전혀 없음. 크루가 발행된 블로그를 모니터링하거나, 부적절한 블로그를 비공개 처리할 수 없음. |
| **Solution** | 기존 SpotManagement 패턴(DataTable + 필터 + 페이지네이션)을 재활용하여 블로그 목록/상세/상태관리 페이지 구현. |
| **Function UX Effect** | 크루가 전체 블로그를 한눈에 파악하고, 상태(초안/발행)별 필터링, 블로그 비공개 처리 가능. |
| **Core Value** | 콘텐츠 품질 관리 체계 확보 → 플랫폼 신뢰도 유지 → 크루 운영 효율성 향상. |

---

## 1. Feature Overview

- **Feature Name**: admin-blog-management
- **Priority**: Medium
- **Scope**: admin-spotLine 레포 (React + Vite + TanStack Query)
- **Target Repo**: `admin-spotLine`

### 1.1 Background

front-spotLine에서 유저가 블로그를 작성/발행할 수 있지만, 크루 어드민에서 이를 관리할 수 없다. 부적절한 콘텐츠 모니터링, 통계 확인, 상태 변경(unpublish) 등의 관리 기능이 필요하다.

Backend API에는 이미 블로그 관련 엔드포인트가 존재한다:
- `GET /api/v2/blogs` — 블로그 목록 (page, size, area, status)
- `GET /api/v2/blogs/{slug}` — 블로그 상세
- `PATCH /api/v2/blogs/{slug}/unpublish` — 비공개 처리
- `DELETE /api/v2/blogs/{slug}` — 삭제

### 1.2 Goals

- 블로그 목록 페이지 (필터: 상태, 지역 / 정렬 / 페이지네이션)
- 블로그 상세 보기 (내용 미리보기 + 메타데이터)
- 블로그 상태 관리 (unpublish, delete)
- 사이드바 네비게이션에 "블로그 관리" 메뉴 추가

---

## 2. Functional Requirements

### FR-01: Blog List Page (`/blogs`)
- DataTable 패턴 재활용 (SpotManagement 참고)
- 컬럼: 제목, 작성자, 지역, 상태(DRAFT/PUBLISHED), 조회수, 좋아요, 발행일
- 필터: 상태 탭 (전체/초안/발행됨), 지역 드롭다운
- 검색: 제목/작성자 키워드 검색
- 페이지네이션: SpringPage 패턴 (0-indexed → 1-indexed 변환)
- 행 클릭 → 상세 페이지 이동

### FR-02: Blog Detail Page (`/blogs/:slug`)
- 블로그 메타데이터 표시 (제목, 작성자, 지역, 상태, 통계)
- 블로그 내용 미리보기 (blocks 렌더링)
- 연결된 SpotLine 정보 표시
- 액션 버튼: "비공개 처리", "삭제" (확인 모달)

### FR-03: Blog Status Management
- Unpublish: `PATCH /blogs/{slug}/unpublish` → 확인 모달 후 실행
- Delete: `DELETE /blogs/{slug}` → 확인 모달 후 실행
- 목록에서 빠른 액션 버튼 (unpublish/delete)

### FR-04: Navigation Integration
- Layout.tsx 사이드바에 "콘텐츠" 섹션 추가
- 하위 메뉴: "블로그 관리"
- 아이콘: FileText (lucide-react)
- 권한: admin 이상

---

## 3. Technical Approach

### 3.1 Reusable Patterns (from admin-spotLine)

| Pattern | Source | Reuse |
|---------|--------|-------|
| DataTable + Pagination | SpotManagement.tsx | 컬럼 정의만 변경 |
| API Service | spotAPI.ts | blogAPI.ts 동일 패턴 |
| TanStack Query | SpotManagement.tsx | useQuery + useMutation |
| 필터 + 검색 | SpotManagement.tsx | 상태탭 + 키워드 |
| ProtectedRoute | App.tsx | requiredRole="admin" |

### 3.2 New Files

| File | Purpose |
|------|---------|
| `src/services/v2/blogAPI.ts` | 블로그 API 서비스 |
| `src/pages/BlogManagement.tsx` | 블로그 목록 페이지 |
| `src/pages/BlogDetail.tsx` | 블로그 상세 페이지 |
| `src/types/v2.ts` | BlogListItem, BlogDetailResponse 타입 추가 |
| `src/components/Layout.tsx` | 네비게이션에 블로그 메뉴 추가 |
| `src/App.tsx` | 라우트 추가 |

### 3.3 Type Definitions

```typescript
// types/v2.ts에 추가
interface BlogListItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
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
```

---

## 4. Constraints & Risks

| Risk | Mitigation |
|------|------------|
| Backend blog API가 admin 전용 필터 미지원 | 기존 public API 사용, 필요 시 Backend PDCA |
| 블로그 내용 렌더링 (Tiptap JSON) | 읽기 전용 HTML 변환 or JSON 요약 표시 |
| admin-spotLine 레포에서 작업 (현재 CWD는 front-spotLine) | 구현 시 CWD 변경 필요 |

---

## 5. Success Criteria

- [ ] `/blogs` 목록 페이지 동작 (필터, 검색, 페이지네이션)
- [ ] `/blogs/:slug` 상세 페이지 동작
- [ ] Unpublish/Delete 액션 동작
- [ ] 사이드바에 "블로그 관리" 메뉴 표시
- [ ] admin 이상 권한 체크
- [ ] TypeScript 타입 체크 통과
- [ ] 빌드 통과
