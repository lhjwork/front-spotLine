# constants/ 규칙

## 패턴

- `as const` 단언으로 리터럴 타입 보장
- 설정값은 named export로 개별 내보내기
- 유틸리티 함수 포함 가능 (이미지 검증 등)

## 이미지 설정 (demoImages.ts)

- SVG 폴백은 data URI 형태로 정의
- 외부 이미지 도메인 화이트리스트 관리
- 이미지 품질: 85 기본값
- 반응형 사이즈: mobile/tablet/desktop 브레이크포인트 정의
