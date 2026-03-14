# store/ 규칙

## Zustand 스토어 패턴

- **단일 스토어** 원칙: `useSpotlineStore` 하나로 전체 상태 관리
- Provider 패턴 미사용 — 컴포넌트에서 훅으로 직접 접근
- 셀렉터 패턴 권장: `useSpotlineStore(state => state.property)`로 필요한 상태만 구독

## 네이밍

- setter: `set[PropertyName]()` 패턴 통일
- 초기화: `clearAll()`, `clearError()` 등 `clear` 접두사

## 상태 구조

- 현재 매장 데이터 (`currentStore`)
- 추천 목록 (`nextSpots`, `recommendations`)
- 필터 상태 (`selectedCategory`)
- UI 상태 (`isLoading`, `error`)
- 세션 (`sessionId`)
- 지도 (`showMap`, `selectedStoreForMap`)

## 주의사항

- 파생 상태(derived state)나 구독(subscription) 미사용 — 단순 getter 패턴 유지
- 새 상태 추가 시 반드시 `clearAll()`에 초기화 로직 포함
- 비동기 액션은 스토어 내부가 아닌 컴포넌트/lib에서 처리
