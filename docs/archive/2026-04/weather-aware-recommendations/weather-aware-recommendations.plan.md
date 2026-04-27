# Weather-Aware Recommendations Plan

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | 현재 추천 시스템은 카테고리/인기도 기반으로만 작동하여, 비 오는 날 야외 Spot을 추천하거나 아침에 바/클럽을 표시하는 등 맥락을 무시한 추천이 발생함 |
| **Solution** | 날씨 API 연동 + Spot 시간대/실내외 메타데이터 + 컨텍스트 기반 추천 스코어링을 추가하여 "지금 가기 좋은 곳"을 실시간으로 추천 |
| **Function UX Effect** | 피드/탐색에서 날씨·시간 배지 표시, "지금 추천" 섹션 추가, 일정 복제 시 날씨 기반 대안 제안 |
| **Core Value** | 네이버 Place 대비 차별화된 "살아있는 추천" — 같은 Spot도 상황에 따라 다르게 추천하여 사용자 신뢰도와 재방문율 향상 |

---

## 1. Feature Overview

### 1.1 Feature Name
`weather-aware-recommendations`

### 1.2 Problem Statement
Spotline의 추천 엔진(recommendation-engine)은 콘텐츠 기반(40%) + 협업 필터링(40%) + 인기도(20%) 알고리즘을 사용하지만, **실시간 컨텍스트(날씨, 시간대)를 전혀 반영하지 않음**.

결과적으로:
- 비 오는 날 야외 산책 코스를 추천
- 아침 8시에 바/클럽 Spot을 상위에 표시
- 35°C 폭염에 야외 활동 SpotLine을 추천
- 일몰 시간대 최적인 전망 카페를 낮에 추천

### 1.3 Target Users
- **일반 사용자**: 피드에서 "지금 가기 좋은 곳" 컨텍스트 추천을 받음
- **크루**: Spot에 시간대/날씨 태그를 큐레이션하여 추천 품질 향상
- **일정 사용자**: 복제한 SpotLine의 날씨 기반 대안 제안을 받음

### 1.4 Success Metrics
- 추천 클릭률(CTR) 20% 향상
- "지금 추천" 섹션 사용률 50% 이상
- Spot 상세 페이지 도달률 15% 향상

---

## 2. Scope

### 2.1 In Scope

#### Backend (springboot-spotLine-backend)
- **Weather API 연동**: 기상청 단기예보 API (공공데이터포털) 또는 OpenWeatherMap API
  - 현재 날씨 조회 (기온, 강수, 풍속, 하늘상태)
  - 24시간 캐싱 (동일 지역/시간대 중복 호출 방지)
- **Spot 메타데이터 확장**: `bestTimeOfDay`, `bestWeatherCondition`, `isIndoor` 필드 추가
- **추천 스코어링 확장**: 기존 알고리즘에 컨텍스트 가중치 추가
  - `contextScore` = weatherFit(0.5) + timeOfDayFit(0.5)
  - 최종: `contentScore*0.3 + collaborativeScore*0.3 + popularityScore*0.15 + contextScore*0.25`
- **"지금 추천" API 엔드포인트**: `GET /api/v2/recommendations/now?lat=&lng=`

#### Frontend (front-spotLine)
- **날씨 배지 컴포넌트**: Spot 카드/상세에 날씨·시간 적합도 배지 표시
- **"지금 추천" 섹션**: 피드 상단에 현재 컨텍스트 기반 추천 섹션
- **시간대 인디케이터**: Spot 카드에 "🌅 일몰 최적", "☀️ 맑은 날 추천" 라벨
- **위치 기반 날씨 조회**: 사용자 위치 동의 후 현재 날씨 표시

#### Admin (admin-spotLine)
- **Spot 시간대/날씨 태깅 UI**: Spot 편집 시 bestTimeOfDay, bestWeather, isIndoor 설정
- **벌크 태깅**: 카테고리 기반 자동 태깅 (카페→실내, 산책→야외 등)

### 2.2 Out of Scope
- 주간/월간 날씨 예보 기반 장기 추천
- 날씨 알림 (푸시 알림 시스템 미구축)
- 사용자별 날씨 선호도 학습 (향후 데이터 축적 후)
- 날씨 기반 SpotLine 자동 생성

---

## 3. Technical Approach

### 3.1 Data Model Changes

#### Spot 엔티티 확장 (Backend)
```
Spot (기존 필드 + 추가):
  + bestTimeOfDay: enum [DAWN, MORNING, AFTERNOON, SUNSET, NIGHT, ANY]
  + bestWeatherCondition: enum [SUNNY, CLOUDY, RAINY, SNOWY, ANY]
  + isIndoor: boolean (default: null → 미설정)
```

#### WeatherCache 엔티티 (신규)
```
WeatherCache:
  id: Long
  regionCode: String        // 기상청 지역 코드 또는 lat/lng grid
  temperature: Double       // 현재 기온 (°C)
  precipitationType: String // NONE, RAIN, SNOW, SLEET
  skyCondition: String      // CLEAR, PARTLY_CLOUDY, CLOUDY
  humidity: Integer         // %
  windSpeed: Double         // m/s
  fetchedAt: LocalDateTime
  expiresAt: LocalDateTime  // fetchedAt + 1h
```

### 3.2 API Design

#### 신규 엔드포인트
```
GET /api/v2/weather/current?lat={lat}&lng={lng}
  → { temperature, precipitationType, skyCondition, humidity, windSpeed, sunsetTime }

GET /api/v2/recommendations/now?lat={lat}&lng={lng}&size={size}
  → { weather: WeatherInfo, spots: RecommendedSpot[], timeContext: "MORNING"|"AFTERNOON"|... }
```

#### 기존 엔드포인트 확장
```
GET /api/v2/recommendations/feed  (기존)
  + 쿼리 파라미터: lat, lng (optional — 제공 시 컨텍스트 스코어 반영)

GET /api/v2/spots/{id}  (기존)
  + 응답 필드: bestTimeOfDay, bestWeatherCondition, isIndoor
```

### 3.3 Weather API 선택

**1순위: 기상청 단기예보 API (공공데이터포털)**
- 무료, 일 10,000건
- 한국 지역 최적화
- 1시간 단위 예보

**2순위 (폴백): OpenWeatherMap Free Tier**
- 월 1,000건 무료
- 글로벌 커버리지
- 더 간단한 API 구조

### 3.4 추천 스코어링 로직

```
weatherFitScore(spot, currentWeather):
  if spot.bestWeatherCondition == ANY → 0.7
  if spot.bestWeatherCondition == currentWeather → 1.0
  if spot.isIndoor && currentWeather == RAINY → 0.9  // 비 올 때 실내 보너스
  if !spot.isIndoor && currentWeather == SUNNY → 0.9 // 맑을 때 야외 보너스
  if !spot.isIndoor && currentWeather == RAINY → 0.2 // 비 올 때 야외 페널티
  default → 0.5

timeOfDayFitScore(spot, currentTimeOfDay):
  if spot.bestTimeOfDay == ANY → 0.7
  if spot.bestTimeOfDay == currentTimeOfDay → 1.0
  if adjacent(spot.bestTimeOfDay, currentTimeOfDay) → 0.7 // 인접 시간대
  default → 0.3
```

---

## 4. Implementation Plan

### Phase 1: Backend — 데이터 모델 + Weather API (springboot-spotLine-backend)
1. Spot 엔티티에 `bestTimeOfDay`, `bestWeatherCondition`, `isIndoor` 필드 추가 + DB 마이그레이션
2. `TimeOfDay`, `WeatherCondition` enum 생성
3. `WeatherCache` 엔티티 + Repository 생성
4. `WeatherService` — 기상청 API 연동 + 캐싱 로직
5. `WeatherController` — `GET /api/v2/weather/current` 엔드포인트
6. 기존 Spot CRUD API에 새 필드 반영

### Phase 2: Backend — 추천 스코어링 확장
7. `ContextScoreCalculator` 서비스 — weatherFit + timeOfDayFit 계산
8. 기존 RecommendationService에 contextScore 통합
9. `GET /api/v2/recommendations/now` 신규 엔드포인트
10. 기존 `GET /api/v2/recommendations/feed`에 lat/lng 옵션 파라미터 추가

### Phase 3: Admin — 크루 태깅 도구 (admin-spotLine)
11. Spot 편집 폼에 bestTimeOfDay, bestWeatherCondition, isIndoor 필드 추가
12. 카테고리 기반 자동 태깅 버튼 (카페→실내, nature→야외+SUNNY 등)
13. SpotLine 빌더에서 각 Spot의 시간대/날씨 정보 표시

### Phase 4: Frontend — UI 컴포넌트 (front-spotLine)
14. `WeatherBadge` 컴포넌트 — 날씨·시간 적합도 배지
15. `NowRecommendation` 섹션 — 피드 상단 "지금 가기 좋은 곳"
16. Spot 카드에 시간대 라벨 표시 (FeedRecommendationSection 확장)
17. Spot 상세 페이지에 "방문하기 좋은 시간" 정보 표시
18. 위치 권한 요청 + Geolocation API 연동

---

## 5. Dependencies

### 외부 의존성
- **기상청 단기예보 API**: 공공데이터포털 API 키 필요
- **OpenWeatherMap API (폴백)**: API 키 필요
- **Geolocation API**: 브라우저 내장 (사용자 동의 필요)

### 내부 의존성
- `recommendation-engine` (완료) — 기존 추천 알고리즘 확장
- `feed-discovery-v2` (완료) — 피드 UI에 날씨 섹션 통합
- `admin-spot-bulk-curation` (완료) — 벌크 태깅 인터페이스 확장

### 환경 변수 (추가)
```
WEATHER_API_KEY                    # 기상청 또는 OpenWeatherMap API 키
WEATHER_API_PROVIDER=kma           # kma | openweathermap
WEATHER_CACHE_TTL_MINUTES=60       # 캐시 유지 시간
```

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 기상청 API 장애/지연 | 추천 품질 저하 | 캐시 만료 시 이전 데이터 유지 + OpenWeatherMap 폴백 |
| Spot 태깅 데이터 부족 (초기) | 컨텍스트 스코어 의미 없음 | 카테고리 기반 자동 태깅으로 초기값 설정 |
| 사용자 위치 권한 거부 | "지금 추천" 불가 | 서울 기본 지역으로 폴백 + 수동 지역 선택 UI |
| API 호출 비용 증가 | 운영 비용 | 공공 API(무료) 우선, 1시간 캐시로 호출 최소화 |

---

## 7. Affected Repositories

| Repository | Changes |
|------------|---------|
| `springboot-spotLine-backend` | Spot 엔티티 확장, WeatherCache 엔티티, WeatherService, 추천 스코어링 확장, 신규 API 2개 |
| `admin-spotLine` | Spot 편집 폼 확장, 자동 태깅 기능, SpotLine 빌더 날씨 정보 표시 |
| `front-spotLine` | WeatherBadge 컴포넌트, NowRecommendation 섹션, Spot 카드/상세 확장, Geolocation 연동 |
