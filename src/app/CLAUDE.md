# app/ 규칙 (Next.js App Router)

## 라우팅 구조

- `/` — 랜딩 페이지 (서버 컴포넌트)
- `/qr/[qrId]` — QR 스캔 진입점 (데모/실제 분기 후 리다이렉트)
- `/spotline/[slug]` — SpotLine 상세 페이지 (SSR + SEO)
- `/spotline/demo-store` — 데모 전용 페이지
- `/spot/[slug]` — Spot 상세 페이지 (SSR + SEO)
- `/my-spotlines` — 내 SpotLine 일정 관리
- `/about` — 서비스 소개
- `/api/demo/*` — 데모 데이터 API 라우트

## 페이지 컴포넌트 규칙

- 서버 컴포넌트가 기본, 인터랙션 필요 시에만 `"use client"`
- `page.tsx`에서 데이터 페칭 → 하위 컴포넌트에 props 전달
- 에러 처리: `error.tsx`, `not-found.tsx` 파일 활용
- 로딩 상태: `loading.tsx` 또는 컴포넌트 내부 상태

## 메타데이터

- `layout.tsx`에서 SEO 메타데이터 정의 (OpenGraph, Twitter Card)
- 한국어 `lang="ko"` 설정
- Geist 폰트 패밀리 사용

## QR 플로우

1. QR 스캔 → `/qr/[qrId]` 진입
2. `demo_` 접두사로 데모 모드 감지
3. API로 매장 ID 매핑 조회
4. `/spot/[slug]?qr=[qrId]`로 리다이렉트

## 분석 & 세션

- 페이지 진입 시 `page_enter` 이벤트 로깅
- 페이지 이탈 시 체류 시간 계산
- 데모 모드에서는 분석 수집 건너뜀
