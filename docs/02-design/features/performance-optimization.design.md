# Performance Optimization Design

## Overview
front-spotLine 프로덕션 성능 최적화를 위한 설계 문서. 5개 FR 구현 (FR-01, FR-04, FR-05는 대상 부재로 제외).

## Implementation Items

### DI-01: OptimizedImage 개선 (FR-02)
- **File**: `src/components/common/OptimizedImage.tsx`
- **Changes**:
  - `unoptimized` prop 제거 → Next.js Image 최적화 활성화
  - render 중 `setImgSrc` 호출을 useEffect로 이동
- **Type**: MODIFY

### DI-02: BlogEditor Dynamic Import (FR-03)
- **File**: `src/app/blog/new/page.tsx`
- **Changes**: `import BlogEditor` → `const BlogEditor = dynamic(() => import(...))`
- **Loading**: Loader2 스피너
- **Type**: MODIFY

### DI-03: BlogEditor Dynamic Import - Edit (FR-03)
- **File**: `src/app/blog/edit/[slug]/page.tsx`
- **Changes**: `import BlogEditor` → `const BlogEditor = dynamic(() => import(...))`
- **Loading**: Loader2 스피너
- **Type**: MODIFY

### DI-04: SpotLineBuilder Dynamic Import - Create (FR-03)
- **File**: `src/app/create-spotline/page.tsx`
- **Changes**: `import SpotLineBuilder` → `const SpotLineBuilder = dynamic(() => import(...))`
- **Loading**: Loader2 스피너
- **Type**: MODIFY

### DI-05: SpotLineBuilder Dynamic Import - Edit (FR-03)
- **File**: `src/app/spotline/[slug]/edit/page.tsx`
- **Changes**: `import SpotLineBuilder` → `const SpotLineBuilder = dynamic(() => import(...))`
- **Loading**: Loader2 스피너
- **Type**: MODIFY

### DI-06: Console Dev Guards (FR-06)
- **Files**: 전체 코드베이스 (~25+ files)
- **Pattern**: 모든 `console.log/warn/error` → `if (process.env.NODE_ENV === "development") console.xxx(...)`
- **Key files**:
  - `src/lib/api.ts` (7 statements)
  - `src/store/useSocialStore.ts` (4 statements)
  - `src/store/useMySpotStore.ts` (1 statement)
  - `src/store/useMySpotLinesStore.ts` (2 statements)
  - `src/lib/spotline.ts` (3 statements)
  - `src/components/blog/BlockMediaUpload.tsx` (1)
  - `src/components/blog/MyBlogsList.tsx` (1)
  - `src/components/blog/BlogCoverEditor.tsx` (1)
  - `src/components/spotline/DemoExperienceButton.tsx` (1)
  - `src/components/common/ErrorBoundary.tsx` (1)
  - `src/components/spotline/SpotlineExperienceButton.tsx` (1)
  - `src/components/spotline/SpotlineStoreInfo.tsx` (2)
  - `src/components/spotline/SpotlineLegacyPage.tsx` (5)
  - `src/app/api/nearby-spots/route.ts` (1)
  - `src/app/api/directions/route.ts` (1)
  - `src/app/api/demo/store/route.ts` (1)
  - `src/app/spotline/demo-store/page.tsx` (2)
  - `src/app/mockup/h/page.tsx` (1)
  - `src/components/spot/CreateFormPhotoUpload.tsx` (1)
  - `src/app/qr/[qrId]/page.tsx` (1)
  - `src/app/error.tsx` (1)
  - `src/components/spotline-builder/SpotPhotoUpload.tsx` (1)
  - `src/components/spotline/NextSpotCard.tsx` (2)
  - `src/components/common/OptimizedImage.tsx` (1)
  - `src/components/blog/BlogEditor.tsx` (1)
- **Type**: MODIFY

### DI-07: optimizePackageImports (FR-07)
- **File**: `next.config.ts`
- **Changes**: `experimental.optimizePackageImports` 배열에 `lucide-react`, `date-fns` 추가
- **Type**: MODIFY

### DI-08: Zustand useShallow (FR-08)
- **File**: `src/components/blog/BlogEditor.tsx`
- **Changes**: 14개 개별 `useEditorStore(s => s.xxx)` → 1개 `useEditorStore(useShallow(s => ({...})))` 호출
- **Type**: MODIFY

## Excluded Items (대상 부재)
- FR-01: API caching — 타겟 컴포넌트 불일치
- FR-04: React.memo — SpotPreviewCard, SpotLinePreviewCard 등 미존재
- FR-05: useMemo — SpotImageGallery, ExploreNavBar 등 미존재

## Dependencies
- `next/dynamic` (built-in)
- `zustand/react/shallow` (already installed)
- No new dependencies required

## Testing Strategy
- `pnpm build` 성공 확인
- 기존 기능 동작 확인 (수동)
