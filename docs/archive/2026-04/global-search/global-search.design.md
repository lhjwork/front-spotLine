# Design: global-search

## 1. Overview

front-spotLine에 글로벌 검색 기능을 추가한다. Header에 검색 아이콘, `/search` 전용 페이지, 최근 검색어 기능을 구현한다. 백엔드 변경 없이 기존 Spot/SpotLine keyword API를 활용한다.

**Target Repo**: `/Users/hanjinlee/Desktop/projects/qrAd/front-spotLine/`

---

## 2. Implementation Order

| # | File | Change | LOC |
|---|------|--------|-----|
| 1 | `src/lib/api.ts` | fetchFeedSpotLines에 keyword, sort 파라미터 추가 | ~5 |
| 2 | `src/components/layout/Header.tsx` | 검색 아이콘 버튼 추가 | ~10 |
| 3 | `src/app/search/page.tsx` | 검색 페이지 (서버 컴포넌트 래퍼) | ~15 |
| 4 | `src/app/search/SearchPageClient.tsx` | 검색 로직 + UI (새 파일) | ~200 |

---

## 3. Detailed Changes

### 3.1 `src/lib/api.ts` — fetchFeedSpotLines 수정

기존 함수에 `keyword`와 `sort` 파라미터 추가:

```typescript
export const fetchFeedSpotLines = async (
  area?: string,
  theme?: string,
  page = 0,
  size = 10,
  keyword?: string,
  sort?: string
): Promise<PaginatedResponse<SpotLinePreview>> => {
  try {
    const params: Record<string, string | number> = { page, size };
    if (area) params.area = area;
    if (theme) params.theme = theme.replace(/-/g, "_");
    if (keyword) params.keyword = keyword;
    if (sort) params.sort = sort;
    const response = await apiV2.get<PaginatedResponse<SpotLinePreview>>("/spotlines/popular", { params, timeout: 5000 });
    return response.data;
  } catch (error) {
    return handleApiError(error, "SpotLine 목록을 불러올 수 없습니다");
  }
};
```

**기존 호출부 영향 없음**: keyword와 sort는 optional이므로 기존 호출 코드 변경 불필요.

### 3.2 `src/components/layout/Header.tsx` — 검색 아이콘 추가

```typescript
'use client';

import Link from 'next/link';
import { QrCode, ArrowLeft, Search } from 'lucide-react';

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
}

export default function Header({ showBackButton = false, title }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 왼쪽: 뒤로가기 버튼 또는 로고 */}
          <div className="flex items-center">
            {showBackButton ? (
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-medium">뒤로</span>
              </button>
            ) : (
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                  <QrCode className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Spotline</span>
              </Link>
            )}
          </div>

          {/* 중앙: 제목 */}
          {title && (
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h1>
            </div>
          )}

          {/* 오른쪽: 검색 아이콘 */}
          <div className="w-16 flex justify-end">
            <Link
              href="/search"
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="검색"
            >
              <Search className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
```

변경 사항:
- `Search` 아이콘 import 추가
- 오른쪽 영역: 빈 `<div className="w-16">` → Search 링크 버튼으로 교체
- `aria-label="검색"` 접근성 속성 추가

### 3.3 `src/app/search/page.tsx` — 검색 페이지 (새 파일)

```typescript
import { Suspense } from "react";
import Layout from "@/components/layout/Layout";
import SearchPageClient from "./SearchPageClient";

export const metadata = {
  title: "검색 - Spotline",
  description: "Spot과 SpotLine을 검색하세요",
};

export default function SearchPage() {
  return (
    <Layout showBackButton>
      <Suspense fallback={null}>
        <SearchPageClient />
      </Suspense>
    </Layout>
  );
}
```

### 3.4 `src/app/search/SearchPageClient.tsx` — 검색 로직 + UI (새 파일)

#### Imports
```typescript
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Clock, Trash2 } from "lucide-react";
import { fetchFeedSpots, fetchFeedSpotLines } from "@/lib/api";
import SpotPreviewCard from "@/components/shared/SpotPreviewCard";
import SpotLinePreviewCard from "@/components/shared/SpotLinePreviewCard";
import type { SpotDetailResponse, SpotLinePreview } from "@/types";
```

#### Types & Constants
```typescript
type SearchTab = "spot" | "spotline";

const STORAGE_KEY = "spotline_recent_searches";
const MAX_RECENT = 10;
const PAGE_SIZE = 20;
```

#### Recent Searches Helpers
```typescript
function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  const searches = getRecentSearches().filter((s) => s !== trimmed);
  searches.unshift(trimmed);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches.slice(0, MAX_RECENT)));
}

function removeRecentSearch(query: string) {
  const searches = getRecentSearches().filter((s) => s !== query);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

function clearRecentSearches() {
  localStorage.removeItem(STORAGE_KEY);
}
```

#### Component State
```typescript
export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [tab, setTab] = useState<SearchTab>(
    (searchParams.get("tab") as SearchTab) || "spot"
  );

  // Spot results
  const [spots, setSpots] = useState<SpotDetailResponse[]>([]);
  const [spotsPage, setSpotsPage] = useState(0);
  const [hasMoreSpots, setHasMoreSpots] = useState(true);

  // SpotLine results
  const [spotLines, setSpotLines] = useState<SpotLinePreview[]>([]);
  const [spotLinesPage, setSpotLinesPage] = useState(0);
  const [hasMoreSpotLines, setHasMoreSpotLines] = useState(true);

  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
```

#### Debounce + URL Sync
```typescript
  // 디바운스
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // URL 동기화
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (tab !== "spot") params.set("tab", tab);
    const qs = params.toString();
    router.replace(`/search${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [debouncedQuery, tab, router]);
```

#### Data Loading
```typescript
  // 검색 실행
  useEffect(() => {
    if (!debouncedQuery) {
      setSpots([]);
      setSpotLines([]);
      return;
    }

    // 최근 검색어에 추가
    addRecentSearch(debouncedQuery);
    setRecentSearches(getRecentSearches());

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        if (tab === "spot") {
          const result = await fetchFeedSpots(undefined, undefined, 0, PAGE_SIZE, "POPULAR", debouncedQuery);
          if (!cancelled) {
            setSpots(result.content);
            setSpotsPage(0);
            setHasMoreSpots(!result.last);
          }
        } else {
          const result = await fetchFeedSpotLines(undefined, undefined, 0, PAGE_SIZE, debouncedQuery, "POPULAR");
          if (!cancelled) {
            setSpotLines(result.content);
            setSpotLinesPage(0);
            setHasMoreSpotLines(!result.last);
          }
        }
      } catch {
        // 조용히 처리
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [debouncedQuery, tab]);

  // 더 보기
  const handleLoadMore = useCallback(async () => {
    if (loading || !debouncedQuery) return;
    setLoading(true);
    try {
      if (tab === "spot") {
        const nextPage = spotsPage + 1;
        const result = await fetchFeedSpots(undefined, undefined, nextPage, PAGE_SIZE, "POPULAR", debouncedQuery);
        setSpots((prev) => [...prev, ...result.content]);
        setSpotsPage(nextPage);
        setHasMoreSpots(!result.last);
      } else {
        const nextPage = spotLinesPage + 1;
        const result = await fetchFeedSpotLines(undefined, undefined, nextPage, PAGE_SIZE, debouncedQuery, "POPULAR");
        setSpotLines((prev) => [...prev, ...result.content]);
        setSpotLinesPage(nextPage);
        setHasMoreSpotLines(!result.last);
      }
    } catch {
      // 조용히 처리
    } finally {
      setLoading(false);
    }
  }, [loading, debouncedQuery, tab, spotsPage, spotLinesPage]);
```

#### Initial Load (최근 검색어 + autoFocus)
```typescript
  useEffect(() => {
    setRecentSearches(getRecentSearches());
    inputRef.current?.focus();
  }, []);
```

#### Tab Change Handler
```typescript
  const handleTabChange = useCallback((newTab: SearchTab) => {
    setTab(newTab);
    // 탭 변경 시 해당 탭 데이터 리셋 → useEffect에서 재조회
    if (newTab === "spot") {
      setSpots([]);
      setSpotsPage(0);
      setHasMoreSpots(true);
    } else {
      setSpotLines([]);
      setSpotLinesPage(0);
      setHasMoreSpotLines(true);
    }
  }, []);
```

#### Render — Search Input
```tsx
  return (
    <div className="mx-auto max-w-2xl pb-20">
      {/* 검색 입력 */}
      <div className="sticky top-16 z-40 bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Spot, SpotLine 검색..."
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
```

#### Render — Recent Searches (검색어 없을 때)
```tsx
      {/* 최근 검색어 (검색어 없을 때) */}
      {!debouncedQuery && recentSearches.length > 0 && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">최근 검색</h2>
            <button
              onClick={() => { clearRecentSearches(); setRecentSearches([]); }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              전체 삭제
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <div key={term} className="flex items-center gap-1 rounded-full bg-gray-100 pl-3 pr-1.5 py-1.5">
                <button
                  onClick={() => setQuery(term)}
                  className="flex items-center gap-1.5 text-sm text-gray-700"
                >
                  <Clock className="h-3 w-3 text-gray-400" />
                  {term}
                </button>
                <button
                  onClick={() => {
                    removeRecentSearch(term);
                    setRecentSearches(getRecentSearches());
                  }}
                  className="p-0.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
```

#### Render — Tabs + Results (검색어 있을 때)
```tsx
      {/* 탭 + 결과 */}
      {debouncedQuery && (
        <>
          {/* 탭 */}
          <div className="flex border-b border-gray-200 px-4">
            {([
              { key: "spot" as const, label: "Spot" },
              { key: "spotline" as const, label: "SpotLine" },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Spot 결과 */}
          {tab === "spot" && (
            <div className="px-4 py-4">
              {spots.length === 0 && !loading ? (
                <p className="py-12 text-center text-sm text-gray-400">
                  검색 결과가 없습니다
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {spots.map((spot) => (
                      <SpotPreviewCard key={spot.id} spot={spot} />
                    ))}
                  </div>
                  {hasMoreSpots && !loading && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={handleLoadMore}
                        className="rounded-lg border border-gray-200 px-6 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        더 보기
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* SpotLine 결과 */}
          {tab === "spotline" && (
            <div className="px-4 py-4">
              {spotLines.length === 0 && !loading ? (
                <p className="py-12 text-center text-sm text-gray-400">
                  검색 결과가 없습니다
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    {spotLines.map((sl) => (
                      <SpotLinePreviewCard key={sl.id} spotLine={sl} />
                    ))}
                  </div>
                  {hasMoreSpotLines && !loading && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={handleLoadMore}
                        className="rounded-lg border border-gray-200 px-6 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        더 보기
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* 로딩 */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          )}
        </>
      )}

      {/* 검색어 없고 최근 검색어도 없을 때 */}
      {!debouncedQuery && recentSearches.length === 0 && (
        <div className="px-4 py-16 text-center">
          <Search className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">Spot이나 SpotLine을 검색해보세요</p>
        </div>
      )}
    </div>
  );
}
```

---

## 4. Verification Checklist

- [ ] Header.tsx에 Search 아이콘 + `/search` 링크 존재
- [ ] `/search` 페이지 접근 시 검색 입력 필드 표시 (autoFocus)
- [ ] 키워드 입력 → 300ms 디바운스 → Spot 검색 결과 표시
- [ ] Spot/SpotLine 탭 전환 동작
- [ ] SpotLine 탭에서 키워드 검색 결과 표시
- [ ] 최근 검색어 저장 (localStorage)
- [ ] 최근 검색어 클릭 시 즉시 검색
- [ ] 최근 검색어 개별 삭제 + 전체 삭제
- [ ] URL 파라미터 동기화 (`?q=...&tab=...`)
- [ ] "더 보기" 버튼으로 페이지네이션 동작
- [ ] 결과 없음 상태 표시
- [ ] fetchFeedSpotLines에 keyword, sort 파라미터 전달 확인
- [ ] 기존 FeedSpotLineSection 등 fetchFeedSpotLines 호출부 영향 없음
- [ ] TypeScript 타입 체크 통과
- [ ] 빌드 통과
