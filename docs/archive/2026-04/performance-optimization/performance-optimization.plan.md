# Performance Optimization Plan

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| Problem | 프로덕션 빌드에서 불필요한 console 출력, 무거운 라이브러리 번들링, 비효율적 상태 관리가 성능을 저하시킴 |
| Solution | Dynamic import로 코드 스플리팅, Zustand useShallow로 리렌더 최적화, 빌드 설정 개선 |
| Function UX Effect | 초기 로딩 속도 개선, 불필요한 리렌더 제거, 프로덕션 번들 크기 감소 |
| Core Value | 사용자 체감 성능 향상과 Core Web Vitals 지표 개선 |

## Feature Name
performance-optimization

## Problem Statement
front-spotLine 프로덕션 빌드에서 다음 성능 이슈 존재:
1. 무거운 라이브러리(Tiptap, dnd-kit, Kakao Maps)가 모든 페이지 번들에 포함
2. Zustand 스토어에서 14개 개별 셀렉터 호출로 불필요한 리렌더 발생
3. 프로덕션에서 console.log/warn/error 출력 (보안+성능)
4. next.config.ts에 optimizePackageImports 미설정

## Functional Requirements

### FR-01: API Response Caching (SWR/React Query)
- **Status**: NOT IMPLEMENTED — 기존 아키텍처에서 대상 컴포넌트 불일치
- **Reason**: 타겟 컴포넌트가 존재하지 않거나 아키텍처와 맞지 않음

### FR-02: OptimizedImage unoptimized prop 제거 + render-phase state 수정
- 외부 이미지에 불필요하게 적용된 `unoptimized` prop 제거
- render 중 setState 호출 패턴 수정

### FR-03: Heavy Library Dynamic Imports
- Tiptap 에디터: BlogEditor를 dynamic import로 변경
- dnd-kit: SpotLineBuilder를 dynamic import로 변경
- react-kakao-maps-sdk: 서버 컴포넌트에서 이미 route-level 코드 스플리팅 적용

### FR-04: React.memo on Card Components
- **Status**: NOT IMPLEMENTED — 대상 컴포넌트(SpotPreviewCard 등) 미존재

### FR-05: useMemo for Array Slicing
- **Status**: NOT IMPLEMENTED — 대상 컴포넌트 미존재

### FR-06: Production Console Statement Removal
- 전체 코드베이스의 모든 console.log/warn/error를 dev-only guard로 감싸기
- 패턴: `if (process.env.NODE_ENV === "development") console.xxx(...)`

### FR-07: next.config.ts optimizePackageImports
- lucide-react, date-fns 등 tree-shaking 최적화 설정 추가

### FR-08: Zustand useShallow for BlogEditor
- BlogEditor에서 14개 개별 셀렉터를 1개 useShallow 호출로 통합

## Non-Functional Requirements
- 빌드 성공 필수 (pnpm build)
- 기존 기능 동작에 영향 없어야 함
- React Compiler (이미 활성화됨)와 호환

## Out of Scope
- FR-01, FR-04, FR-05는 대상 컴포넌트 부재로 제외
- 백엔드 성능 최적화
- CDN/캐싱 인프라 변경
