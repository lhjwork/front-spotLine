# src/ 공통 규칙

## 임포트 규칙

- 경로 별칭 `@/*`을 항상 사용 (상대 경로 `../` 지양)
- 임포트 순서: React/Next.js → 외부 라이브러리 → 내부 모듈 → 타입
- 타입 임포트는 `import type { ... }` 사용

## 네이밍 컨벤션

- 컴포넌트 파일: PascalCase (`StoreInfo.tsx`)
- 유틸/훅 파일: camelCase (`useSpotlineStore.ts`, `api.ts`)
- 타입/인터페이스: PascalCase, `Props` 접미사 (`NextSpotCardProps`)
- 함수: camelCase, 동사 시작 (`formatDistance`, `handleClick`)

## 언어 규칙

- UI 텍스트, 에러 메시지: 한국어
- 코드(변수명, 주석, 타입명): 영어

## 스타일링

- Tailwind CSS 4 클래스 사용, 인라인 스타일 지양
- 조건부 클래스는 반드시 `cn()` 유틸리티 사용 (`clsx` + `tailwind-merge`)
- 모바일 퍼스트 반응형: 기본 → `md:` → `lg:` 순서
- 색상 체계: Blue-600 프라이머리, Green/Red/Purple 액센트
