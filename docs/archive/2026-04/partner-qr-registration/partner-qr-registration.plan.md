# Partner QR Registration Planning Document

> **Summary**: 파트너 QR 등록 완성 — 파트너 자가 신청 페이지, 셀프서비스 대시보드, QR 이미지 생성/다운로드, 파트너 Spot 탐색 필터
>
> **Project**: Spotline (front-spotLine)
> **Version**: 1.0
> **Author**: Claude
> **Date**: 2026-04-18
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 파트너 등록이 어드민 수동 입력에만 의존하여 확장성이 없고, 파트너가 자신의 QR 성과를 확인할 수 없으며, QR 코드 이미지 생성/다운로드가 불가하여 실물 배포 불가능 |
| **Solution** | 파트너 자가 신청 페이지 + 셀프서비스 대시보드(스캔 분석) + QR 이미지 생성/다운로드 + 탐색 UI에 파트너 Spot 필터 추가 |
| **Function/UX Effect** | 매장 사장님이 직접 파트너 신청 → 승인 후 대시보드에서 QR 성과 확인 + QR 이미지 다운로드 → 매장에 부착. 사용자는 탐색에서 파트너 혜택 Spot 필터링 |
| **Core Value** | 파트너 온보딩 자동화로 영업 비용 절감 + 파트너 자가 성과 확인으로 유지율 향상 + QR 이미지 실물 배포 가능 = 수익 모델 실현 기반 |

---

## 1. Overview

### 1.1 Purpose

Phase 8(QR 파트너 시스템)의 프론트엔드 완성. 현재 Backend API 9개 + Admin 관리 도구는 완료 상태이나, 파트너(매장 사장님)가 직접 접근하는 공개 UI가 부재. 파트너 자가 신청 → 승인 → 셀프서비스 대시보드까지의 end-to-end 플로우를 구현한다.

### 1.2 Background

- **이전 PDCA**: `partner-qr-system` (2026-04-13, 100%, archived) — 프론트엔드 디스플레이 컴포넌트 완료
  - PartnerBadge, PartnerBenefit, PartnerQrBanner, 4단계 전환 퍼널 이벤트 트래킹
- **Backend 완료**: Partner CRUD, QR 생성/관리, 스캔 로깅, 분석 API (9개 어드민 엔드포인트 + QR 스캔 API)
- **Admin 완료**: 파트너 등록/관리, QR 생성/관리, 분석 대시보드
- **현재 Gap**: 파트너 자가 신청, 셀프서비스 대시보드, QR 이미지 생성, 파트너 필터

### 1.3 Related Documents

- 이전 PDCA: `docs/archive/2026-04/partner-qr-system/`
- 전체 Plan: `docs/01-plan/features/experience-social-platform.plan.md` (Phase 8)
- Backend API: Swagger UI (`localhost:4000/swagger-ui.html`)

---

## 2. Scope

### 2.1 In Scope

| ID | Feature | Description |
|----|---------|-------------|
| FR-01 | 파트너 신청 페이지 | `/partner/apply` — 매장 정보 + Spot 검색/선택 + 혜택 텍스트 입력 → 신청 제출 |
| FR-02 | 파트너 대시보드 | `/partner/dashboard` — 승인된 파트너의 QR 스캔 분석, 전환율, 일별 트렌드 |
| FR-03 | QR 코드 이미지 생성/다운로드 | 파트너 대시보드에서 QR 이미지 PNG/SVG 생성 + 다운로드 (qrcode.react 활용) |
| FR-04 | 파트너 Spot 필터 | 탐색/발견 페이지에서 "파트너 혜택" 필터 토글 추가 |

### 2.2 Out of Scope

- Backend API 신규 개발 (기존 9개 엔드포인트 활용)
- 파트너 결제/정산 시스템
- 파트너 전용 앱
- QR 디자인 커스터마이징 (브랜드 로고 삽입 등)

### 2.3 Dependencies

- Backend Partner API 동작 (기존 완료)
- Backend에 파트너 자가 신청용 Public API 필요 여부 확인 (현재 admin-only 엔드포인트)

---

## 3. Functional Requirements

### FR-01: 파트너 신청 페이지 (`/partner/apply`)

**목적**: 매장 사장님이 직접 파트너 신청 가능

**UI 구성**:
1. 매장 검색 — 기존 Spot 검색 API 활용, Place API 연동 Spot 선택
2. 비즈니스 정보 — 사업자 이름, 연락처, 이메일
3. 혜택 정보 — benefitText 입력 (예: "음료 10% 할인"), brandColor 선택
4. 파트너 티어 — BASIC/PREMIUM 설명 + 선택
5. 신청 제출 → 관리자 승인 대기 안내

**동작**:
- 폼 유효성 검증 (필수 필드, 이메일 형식, 연락처 형식)
- 제출 시 Backend API 호출 (현재 admin 엔드포인트 → Public 엔드포인트 필요할 수 있음, 없으면 demo-style 처리)
- 성공 시 "신청이 접수되었습니다" 안내 페이지로 이동

### FR-02: 파트너 대시보드 (`/partner/dashboard`)

**목적**: 승인된 파트너가 자신의 QR 성과 확인

**UI 구성**:
1. 요약 카드 — 총 스캔 수, 고유 방문자, 전환율, 이번 주 vs 지난 주 비교
2. 일별 트렌드 차트 — 7일/30일/90일 기간 선택 가능
3. QR 코드 목록 — 각 QR별 스캔 수, 라벨, 활성 상태
4. QR 이미지 다운로드 버튼 (FR-03과 연결)

**데이터**: `GET /api/v2/admin/partners/{id}/analytics` 활용
**인증**: 파트너 전용 간단 인증 (이메일 + 파트너 ID 기반 매직 링크 또는 토큰)

### FR-03: QR 코드 이미지 생성/다운로드

**목적**: 실물 QR 코드 프린트용 이미지 제공

**구현**:
- `qrcode.react` 라이브러리로 QR 코드 SVG/Canvas 렌더링
- QR 값: 사이트 URL + QR ID (예: `https://spotline.kr/qr/partner-cafe-slug-001`)
- 다운로드 옵션: PNG (300dpi 인쇄용), SVG (벡터)
- 브랜드 컬러 적용 가능 (QR 전경색)

### FR-04: 파트너 Spot 필터

**목적**: 사용자가 파트너 혜택 있는 Spot 쉽게 발견

**구현**:
- 탐색 페이지(`/discover` 또는 `/explore`)에 "파트너 혜택" 토글 필터 추가
- API 쿼리 파라미터: `partner=true` 전달
- 파트너 Spot에 PartnerBadge 강조 표시 (기존 컴포넌트 재활용)

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | 성능 | QR 이미지 생성 클라이언트사이드, 서버 부하 없음 |
| NFR-02 | 반응형 | 모바일 퍼스트 — 파트너 신청/대시보드 모바일에서 사용 가능 |
| NFR-03 | SEO | 파트너 신청 페이지 검색 노출 (`/partner/apply` — SSR 메타데이터) |
| NFR-04 | 접근성 | 폼 필드 라벨, 에러 메시지 접근성 준수 |

---

## 5. Technical Approach

### 5.1 Architecture

```
파트너 신청 플로우:
  /partner/apply (SSR 랜딩) → 폼 제출 → Backend API → 관리자 승인 (Admin)

파트너 대시보드:
  /partner/dashboard (Client) → Backend Analytics API → 차트 렌더링

QR 이미지 생성:
  qrcode.react (클라이언트) → Canvas → PNG/SVG 다운로드
```

### 5.2 Key Libraries

- `qrcode.react` — QR 코드 렌더링 (이미 검증된 React 라이브러리)
- 기존 Chart 라이브러리 (admin에서 사용 중인 것과 동일)

### 5.3 File Structure

```
src/app/partner/
  ├── apply/
  │   └── page.tsx          — 파트너 신청 페이지
  ├── dashboard/
  │   └── page.tsx          — 파트너 대시보드
  └── layout.tsx            — 파트너 섹션 레이아웃

src/components/partner/
  ├── PartnerApplyForm.tsx  — 신청 폼 컴포넌트
  ├── PartnerDashboard.tsx  — 대시보드 메인 컴포넌트
  ├── QrCodeGenerator.tsx   — QR 이미지 생성/다운로드
  └── PartnerAnalyticsChart.tsx — 분석 차트
```

---

## 6. Implementation Order

1. **FR-03** QR 코드 이미지 생성/다운로드 (독립 컴포넌트, 의존성 없음)
2. **FR-01** 파트너 신청 페이지 (Spot 검색 기존 API 활용)
3. **FR-02** 파트너 대시보드 (분석 API 연동 + QR 이미지 생성 통합)
4. **FR-04** 파트너 Spot 필터 (기존 탐색 페이지 수정)

---

## 7. Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Backend에 Public 파트너 신청 API 없음 | 신청 폼 제출 불가 | 프론트에서 폼 UI 완성 + 제출 시 안내 메시지 표시 (admin이 수동 입력), 이후 Backend Public 엔드포인트 추가 |
| 파트너 대시보드 인증 미구현 | 보안 위험 | 간단한 토큰 기반 접근 (URL에 토큰 포함) 또는 이메일 인증 |
| QR 코드 라이브러리 번들 크기 | 로딩 속도 | dynamic import로 필요 시에만 로드 |
