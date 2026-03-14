# types/ 규칙

## 구조

- `index.ts` 단일 파일에 모든 인터페이스 정의
- barrel export 미사용 — 직접 `@/types`에서 임포트

## 타입 컨벤션

- `interface` 사용 (type alias 대신), 확장 가능성 유지
- 모든 ID는 `string` 타입
- 타임스탬프는 ISO 문자열 (`string`)
- 좌표: `[lng, lat]` 순서 (GeoJSON 표준)
- 선택적 필드는 `?` 사용

## 주요 타입 계층

- `Store` — 상세 매장 정보 (레거시)
- `SpotlineStore` — 간소화된 매장 정보 (VERSION002, 현재 메인)
- `NextSpot` — 추천 다음 장소
- `ExperienceSession` — 체험 세션 추적
- `SpotlineAnalyticsEvent` — 분석 이벤트 (union 타입)

## 주의사항

- 새 타입 추가 시 기존 네이밍 패턴 준수
- 카테고리는 string literal union 타입으로 정의
- API 응답 타입과 내부 앱 타입 구분 유지
