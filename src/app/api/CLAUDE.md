# api/ 규칙 (Next.js Route Handlers)

## API 라우트 패턴

- `route.ts` 파일에 HTTP 메서드별 함수 export (`GET`, `POST` 등)
- 응답 형식: `{ success: boolean, data: {...}, meta?: {...} }`
- 에러 응답: `{ success: false, error: string }`

## 데모 API (`/api/demo/`)

- 시뮬레이션 딜레이 포함 (500ms) — 실제 네트워크 체감 재현
- Picsum 이미지 URL은 seed 기반으로 일관성 유지
- 반환 구조: `{ store: SpotlineStore, nextSpots: NextSpot[] }`

## 주의사항

- API 라우트는 서버에서만 실행 — 클라이언트 코드/훅 사용 금지
- `NextResponse.json()` 사용
- 프로덕션 API는 백엔드 서버에서 처리, 이 디렉토리는 데모/유틸리티 용도
