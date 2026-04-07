# Plan: global-search

## Executive Summary

| Perspective | Description |
|-------------|-------------|
| **Problem** | 유저가 피드 밖에서 Spot/SpotLine/블로그를 키워드로 검색할 방법이 없음. Header에 검색바가 없고, 전용 검색 페이지도 없어 콘텐츠 발견이 어려움. |
| **Solution** | Header에 검색 아이콘 + /search 페이지 추가. 기존 백엔드 키워드 검색 엔드포인트(Spot, SpotLine, Blog)를 병렬 호출하여 통합 검색 결과 표시. |
| **Function UX Effect** | 어디서든 검색 아이콘 탭 → /search 페이지 → 키워드 입력 → Spot/SpotLine/블로그 탭별 결과 확인. 최근 검색어 localStorage 저장. |
| **Core Value** | 콘텐츠 발견성 대폭 향상 → Cold Start 마찰 감소 → 검색 유입 SEO 기반 확보. |

---

## 1. Feature Overview

- **Feature Name**: global-search
- **Priority**: Medium
- **Scope**: front-spotLine (프론트엔드 전용 — 백엔드 변경 없음)
- **Target Repo**: `front-spotLine`

### 1.1 Background

현재 검색은 피드 페이지(`/feed`) 내 FeedSearchBar에서만 가능하며, Spot 키워드 검색만 지원한다. SpotLine과 블로그는 피드에서 키워드 검색이 불가하다. Header에 검색 진입점이 없어 유저가 특정 장소나 코스를 찾으려면 도시/테마 페이지를 일일이 탐색해야 한다.

**기존 백엔드 검색 지원 현황:**

| Entity | Endpoint | keyword 지원 | 검색 대상 필드 |
|--------|----------|:------------:|---------------|
| Spot | `GET /api/v2/spots` | ✅ | title, crewNote |
| SpotLine | `GET /api/v2/spotlines/popular` | ✅ | title, description |
| Blog | `GET /api/v2/blogs` | ❌ (area만) | — |

→ **핵심 전략**: 새 백엔드 엔드포인트 없이, 기존 Spot + SpotLine 키워드 검색 API를 프론트에서 병렬 호출하여 통합 검색 UX를 제공한다. Blog는 area 필터만 가능하므로 v1에서는 제외하고, 향후 백엔드에 keyword 파라미터 추가 시 확장한다.

### 1.2 Goals

- Header에 검색 아이콘 추가 (탭 시 `/search`로 이동)
- `/search` 검색 전용 페이지 구현
- Spot + SpotLine 키워드 통합 검색 (탭 UI로 분리)
- 최근 검색어 저장 (localStorage, 최대 10개)
- URL 파라미터 동기화 (`/search?q=라멘&tab=spot`)
- 모바일 퍼스트 반응형 UI

### 1.3 Non-Goals (v1)

- 백엔드 통합 검색 엔드포인트 (`/api/v2/search`) 신규 개발
- Blog/User 검색 (백엔드 keyword 미지원)
- 자동완성/TypeAhead (별도 API 필요)
- 검색어 분석/인기 검색어 (백엔드 미지원)

---

## 2. Functional Requirements

### FR-01: Header Search Icon
- Header 오른쪽 영역에 Search 아이콘 버튼 추가
- 클릭 시 `/search` 페이지로 이동
- showBackButton 모드에서도 표시

### FR-02: Search Page (`/search`)
- 상단: 검색 입력 필드 (자동 포커스, 300ms 디바운스)
- 탭: "Spot" | "SpotLine" (기본: Spot)
- 결과: 기존 카드 컴포넌트 재활용 (SpotCard, SpotLineCard)
- 페이지네이션: 무한스크롤 ("더 보기" 버튼)
- 빈 상태: 검색어 없을 때 최근 검색어 표시
- 결과 없음 상태: "검색 결과가 없습니다" 안내

### FR-03: Recent Searches
- localStorage에 최근 검색어 저장 (최대 10개)
- 검색 페이지 진입 시 검색어 없으면 최근 검색어 목록 표시
- 개별 삭제 + 전체 삭제 버튼
- 최근 검색어 클릭 시 해당 키워드로 즉시 검색

### FR-04: URL Sync
- 검색어와 탭 상태를 URL 파라미터에 반영: `/search?q=keyword&tab=spot`
- 브라우저 뒤로가기/앞으로가기 지원
- URL 직접 접근 시 파라미터로 검색 실행 (SSR 불필요, CSR)

---

## 3. Technical Approach

### 3.1 Reusable Patterns

| Pattern | Source | Reuse |
|---------|--------|-------|
| FeedSearchBar | `components/feed/FeedSearchBar.tsx` | 디바운스 로직 참고 (컴포넌트 자체는 피드 전용) |
| fetchFeedSpots | `lib/api.ts` | Spot 키워드 검색 API 함수 재사용 |
| fetchFeedSpotLines | `lib/api.ts` | SpotLine 검색 (keyword 파라미터 추가 필요) |
| SpotCard / SpotLineCard | 기존 컴포넌트 | 결과 카드 렌더링 |
| URL 파라미터 동기화 | BlogsPageClient.tsx 패턴 | useSearchParams + useRouter |

### 3.2 New/Modified Files

| File | Purpose | Type |
|------|---------|------|
| `src/app/search/page.tsx` | 검색 페이지 (CSR) | 새 파일 |
| `src/app/search/SearchPageClient.tsx` | 검색 로직 컴포넌트 | 새 파일 |
| `src/components/layout/Header.tsx` | 검색 아이콘 추가 | 수정 |
| `src/lib/api.ts` | fetchFeedSpotLines에 keyword 파라미터 추가 | 수정 |

### 3.3 API Calls (병렬 실행)

```
/search?q=라멘&tab=spot
  ├─ tab=spot  → fetchFeedSpots(area=null, category=null, page, size, sort="POPULAR", keyword="라멘")
  └─ tab=spotline → fetchFeedSpotLines(area=null, theme=null, page, size, keyword="라멘")
```

활성 탭의 API만 호출 (불필요한 요청 방지).

### 3.4 Recent Searches (localStorage)

```typescript
const STORAGE_KEY = "spotline_recent_searches";
const MAX_ITEMS = 10;

function getRecentSearches(): string[] { ... }
function addRecentSearch(query: string): void { ... }
function removeRecentSearch(query: string): void { ... }
function clearRecentSearches(): void { ... }
```

---

## 4. Constraints & Risks

| Risk | Mitigation |
|------|------------|
| SpotLine API에 keyword 파라미터가 이미 있는지 확인 필요 | 탐색 결과: `GET /api/v2/spotlines/popular`에 keyword 지원 확인됨 ✅ |
| Blog 검색 미지원 (keyword 파라미터 없음) | v1에서 제외, 향후 백엔드 업데이트 시 탭 추가 |
| fetchFeedSpotLines 함수에 keyword 파라미터 미전달 | api.ts 수정 필요 (간단) |
| 모바일에서 검색 UX (키보드 올라옴) | autoFocus + 입력 완료 시 키보드 내림 처리 |

---

## 5. Success Criteria

- [ ] Header에 검색 아이콘 표시 + `/search` 이동
- [ ] `/search` 페이지에서 Spot 키워드 검색 동작
- [ ] `/search` 페이지에서 SpotLine 키워드 검색 동작
- [ ] Spot/SpotLine 탭 전환 동작
- [ ] 최근 검색어 저장/표시/삭제 동작
- [ ] URL 파라미터 동기화 (`?q=...&tab=...`)
- [ ] 모바일/데스크톱 반응형 UI
- [ ] TypeScript 타입 체크 통과
- [ ] 빌드 통과
