# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 빌드 & 개발 명령어

```bash
pnpm dev          # 개발 서버 (포트 3003)
pnpm build        # 프로덕션 빌드
pnpm lint         # ESLint 검사
pnpm lint:fix     # ESLint 자동 수정
pnpm type-check   # TypeScript 타입 검사 (tsc --noEmit)
pnpm clean        # .next 및 캐시 삭제
```

개발 시 백엔드 API는 `localhost:4000`에서 실행 (`.env.local`에서 설정).

## 아키텍처

**Next.js 16 App Router** 기반, React 19, TypeScript strict 모드, Tailwind CSS 4, Zustand 상태관리.

### 핵심 플로우

사용자가 QR 코드 스캔 → `/qr/[qrId]` 페이지 ���입 → Spot 상세로 리다이렉트. SpotLine 상세는 `/spotline/[slug]`. 인증 시스템 없이 익명/프라이버시 우선 설계. 세션 ID는 클라이언트에서 생성하여 분석용으로만 사용.

### 주요 파일

- `src/app/spotline/[slug]/page.tsx` — SpotLine 상세 페이지 (SSR + SEO)
- `src/app/qr/[qrId]/page.tsx` — QR 스캔 진입점 (Spot으로 리다이렉���)
- `src/lib/api.ts` — Axios 기반 API 레이어. 메인 API + 데모 API 이중 엔드포인트, 에러 핸들링, 타임아웃 관리, 분석 로깅
- `src/lib/spotline.ts` — 체험 세션 헬퍼 함수
- `src/store/useSpotlineStore.ts` — 단일 Zustand 스토어 (현재 매장 데이터, 다음 장소, 로딩/에러 상태, 필터)
- `src/types/index.ts` — 모든 TypeScript 인터페이스 (Store, SpotlineStore, NextSpot, ExperienceSession 등)
- `src/constants/demoImages.ts` — 이미지 설정 및 폴백 URI

### 데모 시스템

특수 QR ID(예: `demo_cafe_001`)로 데모 모드 감지. 데모 페이지는 안내 배너를 표시하고 분석 수집을 건너뜀. `/api/demo/store` 로컬 API 라우트에서 시뮬레이션 딜레이와 함께 데모 데이터 제공.

### 코드 패턴

- 인터랙티브 컴포넌트에 `"use client"` 디렉티브 사용
- `cn()` 유틸리티 (clsx + tailwind-merge)로 조건부 클래스 처리
- 경로 별칭: `@/*` → `./src/*`
- UI 및 에러 메시지는 한국어
- 분석 로깅은 fire-and-forget 방식 (5초 타임아웃, 실패 시 무시)
- `OptimizedImage` 컴포넌트: 재시도 로직, 지연 로딩, SVG 폴백 플레이스홀더
- MapButton을 통한 다중 지도 제공자 지원 (카카오, 구글, 네이버)

### 환경 변수

```
NEXT_PUBLIC_API_BASE_URL       # 메인 백엔드 URL
NEXT_PUBLIC_DEMO_API_URL       # 데모 API URL (선택)
NEXT_PUBLIC_KAKAO_MAP_API_KEY  # 카카오맵 API 키
```
