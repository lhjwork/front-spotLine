# spotline-sharing-collaboration Planning Document

> **Summary**: SpotLine/Spot 공유 기능 확장 — QR 코드 공유, Spot 개별 공유, 공유 추적, 레퍼럴 링크 시스템
>
> **Project**: Spotline
> **Author**: Claude
> **Date**: 2026-04-19
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 현재 공유 기능이 SpotLine 단위에만 한정되어 있고, 공유 추적이 없어 바이럴 성장 측정이 불가능하며, 플랫폼의 핵심인 QR을 활용한 오프라인 공유가 빠져 있음 |
| **Solution** | Spot 개별 공유 시트, SpotLine QR 코드 생성, 공유 횟수 추적(sharesCount), 레퍼럴 링크(`?ref=`) 시스템을 구현하여 공유 경험을 완성 |
| **Function/UX Effect** | Spot 상세에서도 공유 가능, SpotLine QR 이미지 다운로드/공유, 공유 통계 표시, 레퍼럴을 통한 유입 추적으로 크리에이터 동기 부여 |
| **Core Value** | Social Sharing (Pillar 3) 완성 — 온라인+오프라인 공유 채널 확보, 바이럴 성장 루프 구축, 크리에이터 인센티브 기반 마련 |

---

## 1. Overview

### 1.1 Purpose

기존 ShareSheet(링크 복사, 카카오톡, 네이티브 공유)를 확장하여:
- 개별 Spot도 공유 가능하게 함
- QR 코드 기반 오프라인 공유 채널 추가
- 공유 횟수 추적으로 바이럴 효과 측정
- 레퍼럴 링크로 유입 경로 추적

### 1.2 Background

- 현재 ShareSheet는 SpotLine 상세에서만 동작 (`ShareSheet.tsx`)
- 공유 채널: 링크 복사, 카카오톡, Web Share API — **QR 코드 없음**
- `sharesCount` 필드가 백엔드에 없어 공유 통계 미수집
- 레퍼럴 시스템 부재로 바이럴 성장 측정 불가
- Spotline 플랫폼이 QR 기반인데, SpotLine 공유에 QR 미활용

### 1.3 Related Documents

- `src/components/spotline/ShareSheet.tsx` — 기존 공유 시트
- `src/components/spotline/SpotLineBottomBar.tsx` — 하단 액션 바
- `src/lib/share.ts` — 공유 유틸리티 함수

---

## 2. Scope

### 2.1 In Scope

- [ ] Spot 개별 공유 시트 (SpotShareSheet) — Spot 상세 페이지에서 사용
- [ ] SpotLine QR 코드 생성 — ShareSheet에 QR 다운로드 옵션 추가
- [ ] 공유 추적 — `sharesCount` 필드 + 공유 이벤트 기록 API
- [ ] 레퍼럴 링크 — `?ref={userId}` 파라미터 추가, 유입 추적

### 2.2 Out of Scope

- 협업 편집 (Collaborative SpotLine editing) — 별도 feature
- Instagram Stories 카드 이미지 생성 — 향후 확장
- 공유 알림 ("누군가 당신의 SpotLine을 공유했어요") — 별도 feature
- 공유 분석 대시보드 (Admin) — 별도 feature

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Spot 상세 페이지에 공유 버튼 + SpotShareSheet 추가 | High | Pending |
| FR-02 | ShareSheet에 QR 코드 생성/다운로드 옵션 추가 | High | Pending |
| FR-03 | Backend: `sharesCount` 필드 추가 + `POST /api/v2/shares` 공유 추적 API | High | Pending |
| FR-04 | 레퍼럴 링크 생성 — 공유 URL에 `?ref={userId}` 자동 추가 | Medium | Pending |
| FR-05 | Frontend: 공유 통계(sharesCount) SpotLine/Spot 상세에 표시 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | QR 코드 생성 < 100ms (클라이언트 사이드) | 브라우저 DevTools |
| UX | 공유 시트 열기/닫기 애니메이션 200ms | 시각적 확인 |
| 호환성 | QR 이미지 PNG 다운로드 iOS/Android 모두 지원 | 디바이스 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] SpotShareSheet 구현 및 Spot 상세 페이지에 연결
- [ ] ShareSheet에 QR 코드 옵션 추가
- [ ] Backend sharesCount 필드 + 공유 추적 API 동작
- [ ] 레퍼럴 파라미터 공유 URL에 포함
- [ ] 공유 통계 UI 표시

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build succeeds
- [ ] 모바일/데스크톱 반응형 동작

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| QR 라이브러리 번들 크기 증가 | Medium | Medium | `qrcode` 라이브러리 dynamic import로 코드 스플리팅 |
| 공유 추적 API 남용 (스팸) | Low | Low | Rate limiting (1분 10회), 인증 필수 |
| iOS Safari QR 이미지 다운로드 제한 | Medium | Medium | `canvas.toBlob()` + `URL.createObjectURL()` 방식 사용 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | |
| **Dynamic** | Feature-based modules, BaaS | Web apps with backend | X |
| **Enterprise** | Strict layer separation | High-traffic systems | |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| QR 라이브러리 | qrcode / qrcode.react / canvas 직접 | `qrcode` | 가볍고 Canvas/SVG 모두 지원, React 의존성 없음 |
| QR 생성 위치 | Client-side / Server-side | Client-side | 서버 부하 없음, 즉시 생성, 다운로드 용이 |
| 공유 추적 방식 | Fire-and-forget / 동기 | Fire-and-forget | 공유 UX 차단 금지, 분석 로깅과 동일 패턴 |
| 레퍼럴 파라미터 | URL query param / path segment | Query param `?ref=` | SEO 영향 없음, 기존 라우팅 변경 불필요 |

### 6.3 구현 범위별 파일

```
Frontend (front-spotLine):
├── src/components/spot/SpotShareSheet.tsx          — NEW: Spot용 공유 시트
├── src/components/spotline/ShareSheet.tsx           — MODIFY: QR 코드 옵션 추가
├── src/components/common/QRCodeGenerator.tsx        — NEW: QR 코드 생성 컴포넌트
├── src/lib/share.ts                                 — MODIFY: 레퍼럴 파라미터 추가
├── src/app/spot/[slug]/page.tsx                     — MODIFY: 공유 버튼 추가
└── src/app/spotline/[slug]/page.tsx                 — MODIFY: sharesCount 표시

Backend (springboot-spotLine-backend):
├── controller/ShareController.java                  — NEW: 공유 추적 API
├── service/ShareService.java                        — NEW: 공유 비즈니스 로직
├── domain/entity/Share.java                         — NEW: 공유 이벤트 엔티티
├── domain/repository/ShareRepository.java           — NEW: Repository
├── domain/enums/ShareChannel.java                   — NEW: LINK, KAKAO, QR, NATIVE
└── dto/response/SpotLineDetailResponse.java         — MODIFY: sharesCount 추가
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] ESLint configuration
- [x] TypeScript configuration (`tsconfig.json`)
- [x] Tailwind CSS 4 + `cn()` utility

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | Exists | 공유 관련 컴포넌트 네이밍 (SpotShareSheet) | High |
| **Folder structure** | Exists | `spot/` 컴포넌트 디렉토리 확인 | High |
| **Error handling** | Exists | 공유 실패 시 토스트 메시지 패턴 | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| - | 추가 환경변수 없음 (기존 설정으로 충분) | - | - |

---

## 8. Next Steps

1. [ ] Write design document (`spotline-sharing-collaboration.design.md`)
2. [ ] Start implementation
3. [ ] Gap analysis

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-19 | Initial draft | Claude |
