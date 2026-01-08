# SpotLine 백엔드 설계 변경사항 - 매장 ID 기반 구조

## 📋 개요

기존 QR ID 기반 구조에서 **매장 ID 기반 구조**로 변경하여 더 명확하고 확장 가능한 시스템을 구축합니다.

## 🔄 변경사항 요약

### 기존 구조 (변경 전)

```
QR 스캔 → /qr/{qrId} → /spotline/{qrId} (QR ID = 매장 식별자)
```

### 새로운 구조 (변경 후)

```
QR 스캔 → /qr/{qrId} → QR→Store 매핑 조회 → /spotline/{storeId}?qr={qrId}
```

---

## 🗄️ 데이터베이스 스키마 변경

### 1. QR 코드 테이블 (신규 또는 수정)

```javascript
// QRCode Collection
{
  _id: ObjectId,
  qrId: "qr_cafe_gangnam_001",     // QR 코드 고유 ID
  storeId: ObjectId,               // 매장 ID (Store 컬렉션 참조)
  isActive: true,
  createdAt: Date,
  updatedAt: Date,

  // 선택적 필드
  campaignId: ObjectId,            // 마케팅 캠페인 연결
  expiresAt: Date,                 // QR 코드 만료일
  scanCount: 0,                    // 스캔 횟수
  lastScannedAt: Date             // 마지막 스캔 시간
}
```

### 2. 매장 테이블 (기존 유지, 일부 수정)

```javascript
// Store Collection
{
  _id: ObjectId,                   // 매장 고유 ID (Primary Key)
  name: "카페 스팟라인",
  category: "cafe",
  location: {
    address: "서울시 강남구 테헤란로 123",
    coordinates: {
      type: "Point",
      coordinates: [127.0276, 37.4979]
    }
  },

  // SpotLine 전용 필드
  shortDescription: "조용한 분위기의 프리미엄 카페",
  representativeImage: "https://...",
  externalLinks: {
    instagram: "https://instagram.com/cafe_spotline",
    website: "https://cafe-spotline.com"
  },
  spotlineStory: "이곳은 SpotLine이 엄선한...",

  // QR 코드 연결 (역참조)
  qrCodes: [ObjectId],             // 해당 매장의 QR 코드들

  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔧 API 엔드포인트 변경

### 1. QR 코드 처리 API (신규)

```http
GET /api/qr/{qrId}/store
```

**응답:**

```json
{
  "success": true,
  "message": "QR 코드 조회 성공",
  "data": {
    "qrId": "qr_cafe_gangnam_001",
    "storeId": "675a1b2c3d4e5f6789012346"
  }
}
```

### 2. 매장 정보 조회 API (수정)

```http
GET /api/stores/spotline/{storeId}
```

**기존:** `/api/stores/spotline/{qrId}`
**변경:** `/api/stores/spotline/{storeId}`

**응답:**

```json
{
  "success": true,
  "message": "매장 조회 성공",
  "data": {
    "id": "675a1b2c3d4e5f6789012346",
    "name": "카페 스팟라인",
    "shortDescription": "조용한 분위기의 프리미엄 카페",
    "representativeImage": "https://...",
    "location": {
      "address": "서울시 강남구 테헤란로 123",
      "mapLink": "https://maps.google.com/..."
    },
    "externalLinks": {
      "instagram": "https://instagram.com/cafe_spotline",
      "website": "https://cafe-spotline.com"
    },
    "spotlineStory": "이곳은 SpotLine이 엄선한...",
    "qrCode": {
      "id": "qr_cafe_gangnam_001",
      "isActive": true
    }
  }
}
```

### 3. 추천 매장 조회 API (수정)

```http
GET /api/recommendations/next-spots/{storeId}?limit=4
```

**기존:** 매개변수가 혼재
**변경:** 명확히 storeId 기반

---

## 📊 분석 시스템 변경

### 1. 이벤트 로깅 구조 수정

```javascript
// SpotlineAnalyticsEvent
{
  qrCode: "qr_cafe_gangnam_001",   // QR 코드 ID (선택적)
  store: "675a1b2c3d4e5f6789012346", // 매장 ID (필수)
  eventType: "page_enter",
  sessionId: "session_...",
  timestamp: Date,
  metadata: {
    // 추가 정보
  }
}
```

### 2. 분석 API 수정

```http
GET /api/analytics/store/{storeId}
GET /api/analytics/qr/{qrId}
```

---

## 🔄 마이그레이션 계획

### 1단계: 데이터베이스 준비

```javascript
// 1. QRCode 컬렉션 생성
db.createCollection("qrcodes");

// 2. 기존 Store 데이터에 QR 매핑 추가
db.stores.updateMany(
  {},
  {
    $set: {
      qrCodes: [],
    },
  }
);

// 3. 기존 QR ID → Store ID 매핑 데이터 생성
const qrMappings = [
  { qrId: "cafe_gangnam_001", storeId: ObjectId("...") },
  { qrId: "restaurant_hongdae_001", storeId: ObjectId("...") },
  // ...
];

qrMappings.forEach((mapping) => {
  db.qrcodes.insertOne({
    qrId: mapping.qrId,
    storeId: mapping.storeId,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});
```

### 2단계: API 구현

1. `GET /api/qr/{qrId}/store` 구현
2. `GET /api/stores/spotline/{storeId}` 수정
3. 기존 QR 기반 API 호환성 유지 (임시)

### 3단계: 프론트엔드 배포

1. QR 페이지 수정 배포
2. SpotLine 페이지 수정 배포

### 4단계: 정리

1. 기존 QR 기반 API 제거
2. 불필요한 코드 정리

---

## 🎯 장점

### 1. **명확한 구조**

- QR 코드와 매장이 명확히 분리
- 하나의 매장에 여러 QR 코드 연결 가능

### 2. **확장성**

- 마케팅 캠페인별 QR 코드 생성 가능
- QR 코드 만료, 교체 등 유연한 관리

### 3. **분석 개선**

- 매장별 통계와 QR별 통계 분리
- 더 정확한 사용자 행동 분석

### 4. **관리 편의성**

- Admin에서 매장과 QR 코드 독립적 관리
- QR 코드 재발급 시 매장 데이터 유지

---

## 🚨 주의사항

### 1. **호환성 유지**

- 기존 QR 코드들이 계속 작동해야 함
- 점진적 마이그레이션 필요

### 2. **성능 고려**

- QR → Store 조회 시 추가 DB 쿼리 발생
- 적절한 인덱싱 필요

### 3. **에러 처리**

- 존재하지 않는 QR 코드 처리
- 비활성화된 QR 코드 처리

---

## 📝 구현 체크리스트

### 백엔드

- [ ] QRCode 스키마 설계 및 생성
- [ ] `GET /api/qr/{qrId}/store` API 구현
- [ ] `GET /api/stores/spotline/{storeId}` API 수정
- [ ] 분석 시스템 매장 ID 기반으로 수정
- [ ] 기존 데이터 마이그레이션 스크립트 작성
- [ ] Admin API 수정 (QR 코드 관리)

### 프론트엔드

- [x] QR 페이지 수정 (QR → Store ID 조회)
- [x] SpotLine 페이지 매장 ID 기반으로 수정
- [x] API 함수들 수정
- [x] 에러 처리 개선

### 테스트

- [ ] QR 스캔 플로우 테스트
- [ ] 매장 페이지 로딩 테스트
- [ ] 분석 데이터 수집 테스트
- [ ] 데모 모드 동작 테스트

이 변경사항을 통해 더 명확하고 확장 가능한 SpotLine 시스템을 구축할 수 있습니다!
