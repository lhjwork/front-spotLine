# components/ 규칙

## 컴포넌트 작성 규칙

- 인터랙티브 컴포넌트 파일 최상단에 `"use client"` 디렉티브 필수
- 함수형 컴포넌트 + 훅 패턴만 사용 (ErrorBoundary 제외)
- ref 전달이 필요한 컴포넌트는 `forwardRef` 사용
- Props 인터페이스는 `[컴포넌트명]Props`로 정의하고 named export

## 디렉토리 구조

- `common/` — 재사용 가능한 범용 UI (Button, Loading, OptimizedImage, ErrorBoundary)
- `layout/` — 페이지 레이아웃 (Layout, Header, Footer)
- `spotline/` — SpotLine 핵심 기능 컴포넌트
- `store/` — 매장 정보 표시 컴포넌트
- `map/` — 지도 연동 컴포넌트
- `recommendation/` — 추천 시스템 (레거시, SpotLine 이전 패턴)

## 데모 모드 처리

- 데모 모드 여부는 props로 전달받아 처리
- 데모 모드에서는 분석 로깅을 `console.log`로 대체
- UX는 프로덕션과 동일하게 유지

## 이미지 처리

- 이미지는 반드시 `OptimizedImage` 컴포넌트 사용
- 외부 이미지(Picsum 등)는 Next.js 최적화 비활성화
- SVG data URI 폴백 플레이스홀더 필수 제공

## 분석 로깅

- 이벤트 로깅은 fire-and-forget (사용자 인터랙션 차단 금지)
- `e.stopPropagation()` 주의: 지도 버튼 등 중첩 클릭 영역에서 필요
