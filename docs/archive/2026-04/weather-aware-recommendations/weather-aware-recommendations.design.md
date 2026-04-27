# Weather-Aware Recommendations Design

## Reference
- Plan: `docs/01-plan/features/weather-aware-recommendations.plan.md`
- Feature: `weather-aware-recommendations`
- Repos: springboot-spotLine-backend, admin-spotLine, front-spotLine

---

## Design Items

### DI-01: Backend — TimeOfDay & WeatherCondition Enums (NEW)
**Type**: NEW
**Repo**: springboot-spotLine-backend
**Path**: `src/main/java/com/spotline/api/domain/enums/TimeOfDay.java`, `WeatherCondition.java`

```java
// TimeOfDay.java
public enum TimeOfDay {
    DAWN,       // 05:00-07:00
    MORNING,    // 07:00-11:00
    AFTERNOON,  // 11:00-16:00
    SUNSET,     // 16:00-19:00
    NIGHT,      // 19:00-05:00
    ANY         // 시간 무관
}

// WeatherCondition.java
public enum WeatherCondition {
    SUNNY,      // 맑음
    CLOUDY,     // 흐림
    RAINY,      // 비
    SNOWY,      // 눈
    ANY         // 날씨 무관
}
```

**Acceptance Criteria**:
- Both enums in `domain/enums/` alongside existing SpotCategory, SpotSource
- Values match plan specification exactly

---

### DI-02: Backend — Spot Entity Extension (MODIFY)
**Type**: MODIFY
**Repo**: springboot-spotLine-backend
**Path**: `src/main/java/com/spotline/api/domain/entity/Spot.java`

Add 3 new fields to existing Spot entity:

```java
@Enumerated(EnumType.STRING)
@Column(name = "best_time_of_day")
private TimeOfDay bestTimeOfDay;  // default null (미설정)

@Enumerated(EnumType.STRING)
@Column(name = "best_weather_condition")
private WeatherCondition bestWeatherCondition;  // default null

@Column(name = "is_indoor")
private Boolean isIndoor;  // default null (미설정)
```

**Acceptance Criteria**:
- Fields nullable (null = 미설정, 기존 Spot 데이터 영향 없음)
- `ddl-auto=update`로 자동 컬럼 추가 (별도 마이그레이션 불필요)
- SpotDetailResponse DTO에도 3개 필드 추가

---

### DI-03: Backend — WeatherCache Entity (NEW)
**Type**: NEW
**Repo**: springboot-spotLine-backend
**Path**: `src/main/java/com/spotline/api/domain/entity/WeatherCache.java`, `src/main/java/com/spotline/api/domain/repository/WeatherCacheRepository.java`

```java
@Entity
@Table(name = "weather_cache", indexes = {
    @Index(name = "idx_weather_region_expires", columnList = "regionCode, expiresAt")
})
public class WeatherCache {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String regionCode;          // "nx_ny" grid format (e.g., "60_127")

    private Double temperature;          // °C

    @Enumerated(EnumType.STRING)
    private WeatherCondition condition;  // SUNNY, CLOUDY, RAINY, SNOWY

    private Integer humidity;            // %
    private Double windSpeed;            // m/s

    @Column(nullable = false)
    private LocalDateTime fetchedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;     // fetchedAt + 1h
}
```

**Repository**:
```java
public interface WeatherCacheRepository extends JpaRepository<WeatherCache, Long> {
    Optional<WeatherCache> findTopByRegionCodeAndExpiresAtAfterOrderByFetchedAtDesc(
        String regionCode, LocalDateTime now);
}
```

**Acceptance Criteria**:
- regionCode uses KMA grid format (nx_ny) for Korea weather
- Cache TTL 1 hour (expiresAt = fetchedAt + 1h)
- Index on regionCode + expiresAt for fast lookup

---

### DI-04: Backend — WeatherService (NEW)
**Type**: NEW
**Repo**: springboot-spotLine-backend
**Path**: `src/main/java/com/spotline/api/service/WeatherService.java`

```java
@Service
public class WeatherService {
    private final WeatherCacheRepository cacheRepo;
    private final WebClient webClient;

    // KMA 단기예보 API (공공데이터포털)
    @Value("${weather.api.key}") private String apiKey;

    public WeatherInfo getCurrentWeather(double lat, double lng) {
        String regionCode = convertToGrid(lat, lng);  // lat/lng → KMA nx/ny grid

        // 1. 캐시 조회
        Optional<WeatherCache> cached = cacheRepo
            .findTopByRegionCodeAndExpiresAtAfterOrderByFetchedAtDesc(regionCode, LocalDateTime.now());
        if (cached.isPresent()) return toWeatherInfo(cached.get());

        // 2. KMA API 호출
        WeatherCache fresh = fetchFromKma(regionCode);
        cacheRepo.save(fresh);
        return toWeatherInfo(fresh);
    }

    public TimeOfDay getCurrentTimeOfDay() {
        int hour = LocalTime.now().getHour();
        if (hour >= 5 && hour < 7) return TimeOfDay.DAWN;
        if (hour >= 7 && hour < 11) return TimeOfDay.MORNING;
        if (hour >= 11 && hour < 16) return TimeOfDay.AFTERNOON;
        if (hour >= 16 && hour < 19) return TimeOfDay.SUNSET;
        return TimeOfDay.NIGHT;
    }

    private String convertToGrid(double lat, double lng) { /* LCC 변환 */ }
    private WeatherCache fetchFromKma(String regionCode) { /* API 호출 */ }
    private WeatherInfo toWeatherInfo(WeatherCache cache) { /* DTO 변환 */ }
}
```

**WeatherInfo DTO**:
```java
public record WeatherInfo(
    double temperature,
    WeatherCondition condition,
    int humidity,
    double windSpeed,
    TimeOfDay currentTimeOfDay
) {}
```

**Acceptance Criteria**:
- DB 캐시 우선, 만료 시 API 호출
- KMA API 실패 시 마지막 유효 캐시 반환 (graceful degradation)
- `weather.api.key` 환경 변수 필수
- lat/lng → KMA grid 변환 (LCC projection)

---

### DI-05: Backend — WeatherController (NEW)
**Type**: NEW
**Repo**: springboot-spotLine-backend
**Path**: `src/main/java/com/spotline/api/controller/WeatherController.java`

```java
@RestController
@RequestMapping("/api/v2/weather")
public class WeatherController {
    @GetMapping("/current")
    public ApiResponse<WeatherInfo> getCurrentWeather(
        @RequestParam double lat,
        @RequestParam double lng
    ) { ... }
}
```

**Acceptance Criteria**:
- `GET /api/v2/weather/current?lat=37.5665&lng=126.9780` → WeatherInfo
- Swagger @Tag, @Operation 어노테이션 포함
- 응답: `{ success: true, data: { temperature, condition, humidity, windSpeed, currentTimeOfDay } }`

---

### DI-06: Backend — ContextScoreCalculator Service (NEW)
**Type**: NEW
**Repo**: springboot-spotLine-backend
**Path**: `src/main/java/com/spotline/api/service/ContextScoreCalculator.java`

```java
@Service
public class ContextScoreCalculator {

    public double calculate(Spot spot, WeatherCondition currentWeather, TimeOfDay currentTime) {
        double weatherScore = calculateWeatherFit(spot, currentWeather);
        double timeScore = calculateTimeOfDayFit(spot, currentTime);
        return weatherScore * 0.5 + timeScore * 0.5;
    }

    private double calculateWeatherFit(Spot spot, WeatherCondition current) {
        if (spot.getBestWeatherCondition() == null || spot.getBestWeatherCondition() == WeatherCondition.ANY) return 0.7;
        if (spot.getBestWeatherCondition() == current) return 1.0;
        if (Boolean.TRUE.equals(spot.getIsIndoor()) && current == WeatherCondition.RAINY) return 0.9;
        if (Boolean.FALSE.equals(spot.getIsIndoor()) && current == WeatherCondition.SUNNY) return 0.9;
        if (Boolean.FALSE.equals(spot.getIsIndoor()) && current == WeatherCondition.RAINY) return 0.2;
        return 0.5;
    }

    private double calculateTimeOfDayFit(Spot spot, TimeOfDay current) {
        if (spot.getBestTimeOfDay() == null || spot.getBestTimeOfDay() == TimeOfDay.ANY) return 0.7;
        if (spot.getBestTimeOfDay() == current) return 1.0;
        if (isAdjacent(spot.getBestTimeOfDay(), current)) return 0.7;
        return 0.3;
    }

    private boolean isAdjacent(TimeOfDay a, TimeOfDay b) {
        // DAWN↔MORNING, MORNING↔AFTERNOON, AFTERNOON↔SUNSET, SUNSET↔NIGHT
    }
}
```

**Acceptance Criteria**:
- Plan의 스코어링 로직 그대로 구현
- null-safe: bestTimeOfDay/bestWeatherCondition이 null이면 0.7 (중립) 반환
- isIndoor null이면 날씨 보너스/페널티 없음

---

### DI-07: Backend — Recommendations Now Endpoint (NEW)
**Type**: NEW
**Repo**: springboot-spotLine-backend
**Path**: `src/main/java/com/spotline/api/controller/RecommendationController.java` (기존 파일 확장)

```java
@GetMapping("/now")
public ApiResponse<NowRecommendationResponse> getContextualRecommendations(
    @RequestParam double lat,
    @RequestParam double lng,
    @RequestParam(defaultValue = "10") int size
) {
    WeatherInfo weather = weatherService.getCurrentWeather(lat, lng);
    TimeOfDay timeOfDay = weatherService.getCurrentTimeOfDay();
    List<Spot> candidates = spotRepository.findApprovedOrderByViewsCountDesc(PageRequest.of(0, 50));
    // Score each candidate with contextScore
    // Sort by contextScore DESC, take top N
    return ApiResponse.success(new NowRecommendationResponse(weather, rankedSpots, timeOfDay));
}
```

**NowRecommendationResponse DTO**:
```java
public record NowRecommendationResponse(
    WeatherInfo weather,
    List<RecommendedSpotResponse> spots,
    TimeOfDay timeContext
) {}
```

**Acceptance Criteria**:
- `GET /api/v2/recommendations/now?lat=37.5&lng=126.9&size=10`
- 상위 50개 인기 Spot 후보 → contextScore로 재정렬 → 상위 size개 반환
- 응답에 현재 날씨 정보 포함 (프론트엔드 표시용)
- 기존 `/api/v2/recommendations/feed`에도 optional lat/lng 파라미터 추가

---

### DI-08: Backend — Spot CRUD에 새 필드 반영 (MODIFY)
**Type**: MODIFY
**Repo**: springboot-spotLine-backend
**Path**: `src/main/java/com/spotline/api/controller/SpotController.java`, `src/main/java/com/spotline/api/dto/`

- `CreateSpotRequest` / `UpdateSpotRequest`에 `bestTimeOfDay`, `bestWeatherCondition`, `isIndoor` 필드 추가
- `SpotDetailResponse`에 3개 필드 포함
- Spot 생성/수정 시 새 필드 저장

**Acceptance Criteria**:
- 기존 API 하위 호환: 새 필드 없이 요청해도 null로 저장 (기존 클라이언트 영향 없음)
- GET /api/v2/spots/{slug} 응답에 bestTimeOfDay, bestWeatherCondition, isIndoor 포함

---

### DI-09: Admin — Spot Form Weather/Time Fields (MODIFY)
**Type**: MODIFY
**Repo**: admin-spotLine
**Path**: `src/components/curation/SpotFormPanel.tsx`

Spot 편집 폼에 3개 필드 추가:

```tsx
// bestTimeOfDay select
<select {...register("bestTimeOfDay")}>
  <option value="">미설정</option>
  <option value="DAWN">새벽 (05-07시)</option>
  <option value="MORNING">오전 (07-11시)</option>
  <option value="AFTERNOON">오후 (11-16시)</option>
  <option value="SUNSET">일몰 (16-19시)</option>
  <option value="NIGHT">야간 (19-05시)</option>
  <option value="ANY">시간 무관</option>
</select>

// bestWeatherCondition select
<select {...register("bestWeatherCondition")}>
  <option value="">미설정</option>
  <option value="SUNNY">맑은 날</option>
  <option value="CLOUDY">흐린 날</option>
  <option value="RAINY">비 오는 날</option>
  <option value="SNOWY">눈 오는 날</option>
  <option value="ANY">날씨 무관</option>
</select>

// isIndoor toggle
<label>
  <input type="checkbox" {...register("isIndoor")} />
  실내 공간
</label>
```

**Acceptance Criteria**:
- "날씨/시간 정보" 섹션으로 그룹화 (crewNote 아래)
- 기존 폼 레이아웃 유지, 새 필드는 optional
- react-hook-form register로 관리

---

### DI-10: Admin — Category Auto-Tagging Button (NEW)
**Type**: NEW
**Repo**: admin-spotLine
**Path**: `src/components/curation/SpotFormPanel.tsx` (인라인 추가)

카테고리 선택 시 날씨/시간 자동 추천 버튼:

```tsx
const AUTO_TAG_MAP: Record<SpotCategory, { timeOfDay?: string; weather?: string; isIndoor?: boolean }> = {
  CAFE: { isIndoor: true, weather: "ANY", timeOfDay: "ANY" },
  RESTAURANT: { isIndoor: true, weather: "ANY" },
  BAR: { timeOfDay: "NIGHT", isIndoor: true },
  NATURE: { isIndoor: false, weather: "SUNNY" },
  WALK: { isIndoor: false, weather: "SUNNY", timeOfDay: "AFTERNOON" },
  CULTURE: { isIndoor: true, weather: "ANY" },
  EXHIBITION: { isIndoor: true, weather: "RAINY" },  // 비 올 때 추천
  ACTIVITY: { isIndoor: false, weather: "SUNNY" },
  SHOPPING: { isIndoor: true, weather: "ANY" },
  OTHER: {},
};
```

**Acceptance Criteria**:
- "자동 태깅" 버튼 클릭 시 현재 category에 맞는 기본값 세팅
- 크루가 수동으로 덮어쓰기 가능
- 이미 값이 설정된 필드는 덮어쓰지 않음 (빈 값만 채움)

---

### DI-11: Admin — Types Extension (MODIFY)
**Type**: MODIFY
**Repo**: admin-spotLine
**Path**: `src/types/v2.ts`

```typescript
// 기존 enum에 추가
export type TimeOfDay = "DAWN" | "MORNING" | "AFTERNOON" | "SUNSET" | "NIGHT" | "ANY";
export type WeatherCondition = "SUNNY" | "CLOUDY" | "RAINY" | "SNOWY" | "ANY";

// CreateSpotRequest 확장
export interface CreateSpotRequest {
  // ... 기존 필드
  bestTimeOfDay?: TimeOfDay;
  bestWeatherCondition?: WeatherCondition;
  isIndoor?: boolean;
}

// SpotDetailResponse 확장
export interface SpotDetailResponse {
  // ... 기존 필드
  bestTimeOfDay: TimeOfDay | null;
  bestWeatherCondition: WeatherCondition | null;
  isIndoor: boolean | null;
}
```

**Acceptance Criteria**:
- 새 타입은 optional (null 허용)
- CreateSpotRequest에서 새 필드는 optional (기존 폼 호환)

---

### DI-12: Frontend — Types Extension (MODIFY)
**Type**: MODIFY
**Repo**: front-spotLine
**Path**: `src/types/index.ts`

```typescript
// 새 타입 추가
export type TimeOfDay = "DAWN" | "MORNING" | "AFTERNOON" | "SUNSET" | "NIGHT" | "ANY";
export type WeatherCondition = "SUNNY" | "CLOUDY" | "RAINY" | "SNOWY" | "ANY";

export interface WeatherInfo {
  temperature: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
  currentTimeOfDay: TimeOfDay;
}

export interface NowRecommendationResponse {
  weather: WeatherInfo;
  spots: RecommendedSpot[];
  timeContext: TimeOfDay;
}

// SpotDetailResponse 확장
export interface SpotDetailResponse {
  // ... 기존 필드
  bestTimeOfDay: TimeOfDay | null;
  bestWeatherCondition: WeatherCondition | null;
  isIndoor: boolean | null;
}
```

**Acceptance Criteria**:
- WeatherInfo, NowRecommendationResponse 인터페이스 추가
- SpotDetailResponse에 3개 필드 추가
- 기존 타입 하위 호환 유지

---

### DI-13: Frontend — API Functions (MODIFY)
**Type**: MODIFY
**Repo**: front-spotLine
**Path**: `src/lib/api.ts`

```typescript
// 새 API 함수 추가
export async function getCurrentWeather(lat: number, lng: number): Promise<WeatherInfo> {
  const res = await api.get(`/v2/weather/current`, { params: { lat, lng } });
  return res.data.data;
}

export async function getNowRecommendations(lat: number, lng: number, size = 10): Promise<NowRecommendationResponse> {
  const res = await api.get(`/v2/recommendations/now`, { params: { lat, lng, size } });
  return res.data.data;
}
```

**Acceptance Criteria**:
- 기존 api 인스턴스(axios) 사용
- 에러 핸들링은 기존 handleApiError 패턴 따름
- 타임아웃 5초

---

### DI-14: Frontend — WeatherBadge Component (NEW)
**Type**: NEW
**Repo**: front-spotLine
**Path**: `src/components/common/WeatherBadge.tsx`

```tsx
"use client";

export interface WeatherBadgeProps {
  bestTimeOfDay?: TimeOfDay | null;
  bestWeatherCondition?: WeatherCondition | null;
  isIndoor?: boolean | null;
  size?: "sm" | "md";
}

export default function WeatherBadge({ bestTimeOfDay, bestWeatherCondition, isIndoor, size = "sm" }: WeatherBadgeProps) {
  // 시간대 라벨: "새벽 추천", "일몰 최적" 등
  // 날씨 라벨: "맑은 날 추천", "비 올 때 좋아요" 등
  // 실내/야외 배지: "실내", "야외"
  // null이면 해당 배지 숨김
}
```

**Acceptance Criteria**:
- Tailwind 스타일, cn() 유틸리티 사용
- null 필드는 배지 미표시
- size="sm": Spot 카드용 (작은 텍스트), size="md": 상세 페이지용
- 한국어 라벨

---

### DI-15: Frontend — NowRecommendation Section (NEW)
**Type**: NEW
**Repo**: front-spotLine
**Path**: `src/components/feed/NowRecommendationSection.tsx`

```tsx
"use client";

export default function NowRecommendationSection() {
  // 1. Geolocation API로 현재 위치 요청 (거부 시 서울 기본값 37.5665, 126.9780)
  // 2. getNowRecommendations(lat, lng) 호출
  // 3. 상단: 현재 날씨 표시 (아이콘 + 기온 + 상태)
  // 4. 하단: 추천 Spot 카드 리스트 (수평 스크롤)
  // 5. 각 카드에 WeatherBadge 포함
}
```

**Acceptance Criteria**:
- 피드 페이지 상단에 배치 (FeedTrendingSection 위)
- 위치 권한 거부 시 서울 기본 좌표 사용 + "위치를 허용하면 더 정확한 추천을 받을 수 있어요" 안내
- 로딩 중 스켈레톤 UI
- 날씨 정보 + "지금 가기 좋은 곳" 헤더
- 에러 시 섹션 자체를 숨김 (UX 차단 금지)

---

### DI-16: Frontend — Feed Page Integration (MODIFY)
**Type**: MODIFY
**Repo**: front-spotLine
**Path**: `src/app/page.tsx` 또는 피드 페이지 컴포넌트

- NowRecommendationSection을 피드 최상단에 추가
- 기존 FeedTrendingSection, FeedSpotLineSection 아래 배치

**Acceptance Criteria**:
- NowRecommendationSection → FeedTrendingSection → FeedSpotLineSection → FeedCategoryCuration 순서
- lazy import + Suspense로 코드 분할

---

### DI-17: Frontend — Spot Detail Weather Info (MODIFY)
**Type**: MODIFY
**Repo**: front-spotLine
**Path**: Spot 상세 페이지 컴포넌트

- Spot 상세 페이지에 WeatherBadge(size="md") 표시
- "방문하기 좋은 시간" 섹션 추가 (bestTimeOfDay + bestWeatherCondition 기반)

**Acceptance Criteria**:
- 기존 Spot 상세 레이아웃 내 crewNote 아래에 배치
- bestTimeOfDay/bestWeatherCondition 모두 null이면 섹션 미표시
- 한국어: "일몰 시간대에 방문하면 좋아요", "맑은 날에 추천해요" 등

---

## Implementation Order

```
Phase 1: Backend Data Model
  DI-01 → DI-02 → DI-03

Phase 2: Backend Services & API
  DI-04 → DI-05 → DI-06 → DI-07 → DI-08

Phase 3: Admin Tagging
  DI-11 → DI-09 → DI-10

Phase 4: Frontend
  DI-12 → DI-13 → DI-14 → DI-15 → DI-16 → DI-17
```

## Summary

| Metric | Value |
|--------|-------|
| Total DI Items | 17 |
| NEW | 9 (DI-01, DI-03, DI-04, DI-05, DI-06, DI-07, DI-10, DI-14, DI-15) |
| MODIFY | 8 (DI-02, DI-08, DI-09, DI-11, DI-12, DI-13, DI-16, DI-17) |
| Repos | 3 (backend, admin, front) |
| Est. Files | ~20 (9 NEW, ~11 MODIFY) |
