# Recommendation Engine — Plan Document

> Feature: `recommendation-engine`
> Created: 2026-04-18
> Status: Plan

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | 현재 피드는 POPULAR/NEWEST 정렬과 지역/카테고리 필터만 제공하여, 사용자 취향과 무관한 콘텐츠가 노출됨. 좋아요/저장/방문/팔로우 등 풍부한 행동 데이터가 수집되고 있으나 추천에 전혀 활용되지 않음 |
| **Solution** | 백엔드에 RecommendationService를 구축하여 협업 필터링(유사 사용자 행동 기반) + 콘텐츠 기반 필터링(카테고리/테마/지역 유사도)을 결합한 하이브리드 추천 엔진을 구현하고, 프론트엔드 피드에 "맞춤 추천" 섹션을 추가 |
| **Function UX Effect** | 피드 상단에 개인화된 Spot/SpotLine 추천이 표시되어 콘텐츠 발견 효율이 높아지고, Spot 상세 페이지에서 "비슷한 장소" 추천으로 탐색 깊이가 증가 |
| **Core Value** | 사용자 행동 데이터를 활용한 개인화로 체류 시간과 재방문율을 높이고, Cold Start 단계에서 크루 큐레이션 콘텐츠의 노출 효과를 극대화 |

---

## 1. Background

### 1.1 Current State

**데이터 수집 레이어 (구현 완료)**:
- `SpotLike`, `SpotSave`, `SpotVisit` — Spot 대상 사용자 행동
- `SpotLineLike`, `SpotLineSave` — SpotLine 대상 사용자 행동
- `BlogLike`, `BlogSave` — 블로그 대상 사용자 행동
- `UserFollow`, `Comment` — 소셜 상호작용
- `QrScanLog` — QR 스캔 이력
- 각 Spot/SpotLine에 `likesCount`, `savesCount`, `viewsCount` 등 집계 필드

**현재 피드 시스템**:
- "전체" 탭: 지역/카테고리/정렬(POPULAR|NEWEST)/키워드/파트너 필터
- "팔로잉" 탭: 팔로우한 사용자의 SpotLine + Blog를 createdAt DESC로 병합
- POPULAR 정렬은 단순 `likesCount` 기준 (추정), 개인화 없음

**레거시 추천 시스템**:
- `src/components/recommendation/` — QR 기반 "다음 장소" 추천 (현재 비활성)
- `getRecommendationsByQR()`, `getNextSpots()` — 레거시 API 함수 (사용되지 않음)

### 1.2 Goal

사용자의 좋아요, 저장, 방문, 팔로우 행동 데이터를 분석하여 개인화된 콘텐츠를 추천함으로써:
- 피드에서의 콘텐츠 발견율 향상
- Spot/SpotLine 상세 페이지 체류 시간 증가
- Cold Start 콘텐츠(크루 큐레이션) 효율적 노출

### 1.3 Scope

- **In Scope**:
  - 백엔드: `RecommendationService` + 추천 API 엔드포인트
  - 프론트엔드: 피드 내 "맞춤 추천" 섹션, Spot 상세의 "비슷한 장소" 섹션
  - 추천 알고리즘: 콘텐츠 기반 + 협업 필터링 하이브리드
- **Out of Scope**:
  - ML 모델 학습 파이프라인 (Phase 2에서 고려)
  - 실시간 추천 업데이트 (배치 기반으로 시작)
  - 추천 A/B 테스트 프레임워크

---

## 2. Functional Requirements

### FR-01: Personalized Feed Section

피드 "전체" 탭 상단에 "맞춤 추천" 가로 스크롤 섹션 추가.

- 로그인 사용자: 행동 데이터 기반 개인화 추천 (5~10개 Spot)
- 비로그인/신규 사용자: 인기 + 최신 기반 트렌딩 추천 (Cold Start 대응)
- 가로 스크롤 카드 레이아웃 (기존 FeedSpotLineSection과 유사한 패턴)
- "추천 이유" 라벨 표시 (예: "카페를 자주 저장했어요", "홍대 근처 인기 장소")

**API**: `GET /api/v2/recommendations/feed?page=0&size=10`
**수정 대상**: `FeedPage.tsx`, 새 `FeedRecommendationSection.tsx`

### FR-02: Similar Spots on Spot Detail

Spot 상세 페이지 하단에 "비슷한 장소" 섹션 추가.

- 같은 카테고리 + 같은 지역의 Spot 중 유사도 점수 높은 순으로 4~6개 표시
- 유사도 기준: 카테고리 일치, 지역 근접성, 공통 좋아요/저장 사용자 수
- 현재 보고 있는 Spot 제외
- 그리드 카드 레이아웃 (2열)

**API**: `GET /api/v2/spots/{spotId}/similar?size=6`
**수정 대상**: Spot 상세 페이지, 새 `SimilarSpots.tsx`

### FR-03: Similar SpotLines on SpotLine Detail

SpotLine 상세 페이지 하단에 "비슷한 코스" 섹션 추가.

- 같은 테마 + 겹치는 지역의 SpotLine 중 유사도 점수 높은 순으로 3~4개 표시
- 유사도 기준: 테마 일치, 포함 Spot 겹침 비율, 공통 좋아요/저장 사용자
- 현재 보고 있는 SpotLine 제외

**API**: `GET /api/v2/spotlines/{spotlineId}/similar?size=4`
**수정 대상**: SpotLine 상세 페이지, 새 `SimilarSpotLines.tsx`

### FR-04: Backend Recommendation Service

Spring Boot 백엔드에 추천 로직 구현.

**하이브리드 추천 알고리즘**:

1. **콘텐츠 기반 필터링 (Content-Based)**:
   - 카테고리/테마 매칭 (SpotCategory, SpotLineTheme)
   - 지역 근접성 (좌표 기반 거리 계산)
   - 태그 유사도

2. **협업 필터링 (Collaborative)**:
   - 아이템 기반: "이 Spot을 좋아한 사용자가 좋아한 다른 Spot"
   - 공통 행동 패턴 분석 (좋아요, 저장, 방문 이벤트)

3. **점수 합산**:
   - `finalScore = contentScore * 0.4 + collaborativeScore * 0.4 + popularityScore * 0.2`
   - 이미 좋아요/저장/방문한 항목은 제외

**Cold Start 전략**:
- 신규 사용자: popularityScore 가중치를 0.8로 올림 (인기 기반)
- 행동 데이터 10개 미만: 카테고리/지역 선호도만 반영
- 행동 데이터 30개 이상: 풀 하이브리드 알고리즘 적용

**새 파일**: `RecommendationService.java`, `RecommendationController.java`
**레포**: springboot-spotLine-backend

### FR-05: Recommendation API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v2/recommendations/feed` | GET | 개인화 피드 추천 (Spot 목록) |
| `/api/v2/spots/{spotId}/similar` | GET | 유사 Spot 추천 |
| `/api/v2/spotlines/{spotlineId}/similar` | GET | 유사 SpotLine 추천 |

**공통 파라미터**: `page`, `size`, `sessionId` (비로그인 사용자 식별)

### FR-06: Recommendation Tracking

추천 효과 측정을 위한 이벤트 트래킹.

- `recommendation_impression` — 추천 섹션 노출
- `recommendation_click` — 추천 항목 클릭
- 추천 출처 태그 (feed_recommendation, similar_spot, similar_spotline)
- 기존 분석 로깅 패턴(fire-and-forget) 활용

**수정 대상**: `src/lib/api.ts` (로깅 함수 추가)

---

## 3. Non-Functional Requirements

### NFR-01: Performance
- 추천 API 응답 시간: < 500ms (캐싱 적용 시 < 100ms)
- 추천 결과 캐싱: 사용자별 30분, 유사 항목은 24시간
- 피드 로딩 시 추천 섹션은 비동기 로딩 (피드 본체 차단하지 않음)

### NFR-02: Privacy
- 세션 ID 기반 비로그인 추천 (개인 정보 수집 없음)
- 추천 데이터는 서버사이드에서만 처리 (클라이언트에 알고리즘 노출 안 함)

### NFR-03: Graceful Degradation
- 추천 API 실패 시 피드/상세 페이지 정상 작동 (추천 섹션만 숨김)
- 추천 결과가 없으면 "인기 장소" 폴백

---

## 4. Implementation Strategy

### Phase 1 — Backend (springboot-spotLine-backend)
1. `RecommendationService.java` — 추천 알고리즘 핵심 로직
2. `RecommendationController.java` — API 엔드포인트 3개
3. 캐싱 레이어 (Spring Cache + Redis or in-memory)
4. 기존 SocialService의 행동 데이터 조회 쿼리 최적화

### Phase 2 — Frontend (front-spotLine)
1. `FeedRecommendationSection.tsx` — 피드 내 추천 섹션
2. `SimilarSpots.tsx` — Spot 상세 유사 장소
3. `SimilarSpotLines.tsx` — SpotLine 상세 유사 코스
4. API 클라이언트 함수 추가 (`src/lib/api.ts`)
5. 추천 이벤트 트래킹 함수

### Estimated Files
- **NEW**: ~5 files (3 frontend components + 2 backend classes)
- **MODIFY**: ~5 files (FeedPage, Spot detail, SpotLine detail, api.ts, types)
- **Total**: ~10 files

---

## 5. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cold Start — 초기 행동 데이터 부족 | 추천 품질 저하 | 인기 기반 폴백 + 크루 큐레이션 우선 노출 |
| 추천 API 성능 — 대량 데이터 시 느림 | UX 저하 | 적극적 캐싱 + 비동기 로딩 |
| 필터 버블 — 같은 유형만 추천 | 다양성 감소 | 인기/최신 20% 혼합으로 serendipity 확보 |
