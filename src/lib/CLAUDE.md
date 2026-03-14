# lib/ 규칙

## 파일별 역할

- `api.ts` — Axios 기반 API 호출 레이어 (유일한 HTTP 통신 진입점)
- `utils.ts` — 순수 유틸리티 함수 (포맷터, 세션 관리, 카테고리 매핑)
- `spotline.ts` — SpotLine 체험 세션 헬퍼 및 React 훅

## API 레이어 규칙 (api.ts)

- 모든 API 호출은 이 파일을 통해야 함 (컴포넌트에서 직접 axios 호출 금지)
- 에러 핸들링: `handleApiError()`로 통일, 타입 안전한 에러 던지기
- 타임아웃: 일반 API 3~10초, 분석 로깅 5초 (AbortController 사용)
- 분석 로깅 함수는 실패해도 무시 (fire-and-forget)
- 데모 API와 메인 API 엔드포인트 분리 유지
- 응답 타입은 제네릭으로 타입 안전성 보장

## 유틸리티 규칙 (utils.ts)

- 순수 함수만 작성 (부수 효과 없음)
- 세션 ID: 클라이언트에서 UUID 생성, `sessionStorage`에 저장
- 시간대: 영업시간 판단 시 서울 타임존(`Asia/Seoul`) 사용
- `cn()` 함수는 이 파일에서만 정의, 전역에서 임포트하여 사용

## 훅 규칙 (spotline.ts)

- `useSpotlineExperience()` 훅: 로딩/에러 상태 관리 포함
- 페이지 이동은 `window.location.href` 사용 (Next.js router 대신, 전체 페이지 새로고침 의도)
