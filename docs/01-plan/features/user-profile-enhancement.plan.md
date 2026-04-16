# user-profile-enhancement Planning Document

> **Summary**: 프로필 페이지를 소셜 허브로 강화 — 공개 콘텐츠 탭, 정확한 통계, 프로필 공유 기능 추가
>
> **Project**: front-spotLine (Spotline)
> **Version**: 0.1.0
> **Author**: Claude
> **Date**: 2026-04-16
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 다른 사용자의 프로필에서 생성한 SpotLine/Spot을 볼 수 없고, 통계가 부정확하며(recommended 항상 0, spotlines가 저장 수 표시), 프로필 공유 수단이 없어 소셜 플랫폼으로서 핵심 기능이 부족함 |
| **Solution** | 공개 프로필에 콘텐츠 탭(SpotLine/Spot) 추가, Backend의 spotsCount/spotLinesCount 활용한 정확한 통계, Web Share API 기반 프로필 공유, 블로그 탭 인라인 표시로 전환 |
| **Function/UX Effect** | 다른 사용자의 프로필 방문 시 생성 콘텐츠를 직접 탐색 가능하고, 정확한 활동 통계로 신뢰도 향상, 프로필 링크를 외부에 공유하여 유입 증대 |
| **Core Value** | 프로필이 단순 정보 표시에서 소셜 허브로 전환되어, 콘텐츠 크리에이터의 가시성을 높이고 플랫폼 소셜 기능(Pillar 3)의 기반을 확립 |

---

## 1. Overview

### 1.1 Purpose

현재 프로필 페이지는 기본 정보와 좋아요/저장 목록만 보여주며, 다른 사용자가 생성한 콘텐츠(SpotLine, Spot)를 탐색할 수 없다. 소셜 플랫폼으로서 프로필이 "사용자의 콘텐츠 허브" 역할을 하도록 강화한다.

### 1.2 Background

- Spotline은 Experience Based Social Platform으로 Social Sharing(Pillar 3)이 핵심 축
- 현재 프로필에서 다른 사용자의 생성 콘텐츠를 볼 수 없어 소셜 발견 경로가 단절됨
- Backend에는 이미 `spotsCount`, `spotLinesCount`, `blogsCount` 필드가 존재하지만 공개 프로필 API에 미노출
- `recommended` 통계가 항상 0, `spotlines` 통계가 생성이 아닌 저장 수를 표시하는 버그 존재
- 프로필 공유 기능이 없어 외부 유입 경로 부재

### 1.3 Related Documents

- Plan: `docs/01-plan/features/experience-social-platform.plan.md`
- CLAUDE.md: 프로젝트 아키텍처 및 컨벤션
- Backend: UserController, FollowController, SocialController API 참조

---

## 2. Scope

### 2.1 In Scope

- [ ] 공개 프로필에 "SpotLine" 탭 추가 (다른 사용자가 생성한 SpotLine 목록)
- [ ] 공개 프로필에 "Spot" 탭 추가 (다른 사용자가 생성한 Spot 목록)
- [ ] 프로필 통계 수정 (생성 콘텐츠 수 정확히 반영)
- [ ] 프로필 공유 버튼 (Web Share API + 클립보드 복사 폴백)
- [ ] 블로그 탭 인라인 표시 (리다이렉트 대신 프로필 내 목록)
- [ ] 프로필 SEO 메타데이터 강화

### 2.2 Out of Scope

- 프로필 커스터마이징 (배경 이미지, 테마 색상)
- 프로필 내 활동 타임라인/피드
- 사용자 검색/디스커버리 기능
- 프로필 뱃지/레벨 시스템
- Backend API 수정 (Frontend만 변경, 기존 API 활용)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 공개 프로필에서 해당 사용자가 생성한 SpotLine 목록을 "SpotLine" 탭에 표시 | High | Pending |
| FR-02 | 공개 프로필에서 해당 사용자가 생성한 Spot 목록을 "Spot" 탭에 표시 | High | Pending |
| FR-03 | 프로필 통계에서 `spotlines`를 생성한 SpotLine 수로, `recommended`를 생성한 Spot 수로 변경 | High | Pending |
| FR-04 | ProfileHeader에 공유 버튼 추가 (Web Share API, 클립보드 폴백) | Medium | Pending |
| FR-05 | 블로그 탭을 /my-blogs 리다이렉트 대신 프로필 내 인라인 목록으로 전환 | Medium | Pending |
| FR-06 | 프로필 페이지 SSR 메타데이터에 사용자 통계, 생성 콘텐츠 수 반영 | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 탭 전환 시 200ms 이내 응답 | 브라우저 DevTools |
| SEO | 프로필 페이지 OG 메타데이터 포함 | Lighthouse SEO 점수 |
| UX | 모바일 퍼스트 반응형 (기본 → md: → lg:) | 실기기 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] FR-01~FR-06 모든 기능 요구사항 구현
- [ ] 공개 프로필에서 SpotLine/Spot 탭이 정상 표시
- [ ] 통계 수치가 실제 생성 콘텐츠 수와 일치
- [ ] 공유 버튼 동작 확인 (모바일 Native Share, 데스크톱 클립보드)
- [ ] TypeScript 타입 검사 통과 (`pnpm type-check`)
- [ ] ESLint 검사 통과 (`pnpm lint`)

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build succeeds (`pnpm build`)
- [ ] 모바일/데스크톱 반응형 정상 동작

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Backend 공개 프로필 API에 spotsCount/spotLinesCount 미포함 | High | Medium | 기존 `/users/{userId}/spots`, `/users/{userId}/spotlines` API로 별도 호출하여 카운트 |
| 사용자 생성 콘텐츠가 0인 경우 빈 탭 UX | Medium | High | 빈 상태 안내 메시지와 콘텐츠 생성 유도 CTA 표시 |
| Web Share API 미지원 브라우저 | Low | Medium | 클립보드 복사 폴백 구현 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend | ☑ |
| **Enterprise** | Strict layer separation, microservices | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js 16 | Next.js 16 | 기존 프로젝트 유지 |
| State Management | Zustand | Zustand | useSocialStore 등 기존 패턴 활용 |
| API Client | Axios | Axios | 기존 api.ts 레이어 활용 |
| Styling | Tailwind CSS 4 | Tailwind CSS 4 | 기존 프로젝트 유지 |

### 6.3 주요 파일 변경 계획

```
변경 대상:
├── src/components/profile/ProfileTabs.tsx      — 탭 구성 수정 (SpotLine/Spot 탭 공개)
├── src/components/profile/ProfileHeader.tsx    — 공유 버튼 추가, 통계 라벨 수정
├── src/app/profile/[userId]/ProfileClient.tsx  — 신규 탭 데이터 페칭 로직
├── src/app/profile/[userId]/page.tsx           — SEO 메타데이터 강화
├── src/types/index.ts                          — UserProfile stats 타입 확장
├── src/lib/api.ts                              — 사용자별 SpotLine/Spot 조회 API 함수 (기존 것 활용 확인)
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] `src/CLAUDE.md` has import/naming/styling rules
- [x] ESLint configuration
- [x] TypeScript configuration (strict mode)
- [x] Tailwind CSS 4 + cn() utility

### 7.2 Conventions to Follow

| Category | Convention |
|----------|-----------|
| **Naming** | 컴포넌트 PascalCase, 유틸 camelCase |
| **Import** | `@/*` 경로 별칭, React → 외부 → 내부 → 타입 순서 |
| **UI Text** | 한국어 |
| **Styling** | Tailwind CSS 4, cn() 유틸, 모바일 퍼스트 |
| **Components** | 인터랙티브 → `"use client"`, 나머지 서버 컴포넌트 |

---

## 8. Next Steps

1. [ ] Write design document (`user-profile-enhancement.design.md`)
2. [ ] Implement changes (ProfileTabs, ProfileHeader, ProfileClient, types)
3. [ ] Gap analysis and verification

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-16 | Initial draft | Claude |
