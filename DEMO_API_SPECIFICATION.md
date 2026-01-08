# SpotLine 데모 시스템 API 명세서

## 📋 개요

SpotLine 데모 시스템은 업주에게 서비스를 소개하기 위한 별도의 시스템입니다. 실제 운영 데이터와 완전히 분리되어 있으며, 통계 수집을 하지 않습니다.

## 🎯 데모 접근 시나리오

### 시나리오 1: 랜덤 데모 체험 (기본)

```
사용자 → /demo 페이지 → "데모 체험하기" 버튼 클릭 → 랜덤 데모 매장으로 이동
```

### 시나리오 2: 데모 매장 목록에서 선택

```
사용자 → /demo 페이지 → "데모 매장 목록 보기" → 특정 매장 선택 → 해당 데모 매장으로 이동
```

### 시나리오 3: 데모 QR 코드 스캔

```
사용자 → 데모 QR 스캔 → /qr/demo_cafe_001 → 데모 매장 페이지로 이동
```

---

## 🔧 필요한 백엔드 API

### 1. 랜덤 데모 체험 API

```http
GET /api/demo/experience
```

**설명:** 랜덤하게 데모 매장을 선택하여 체험할 수 있도록 합니다.

**응답:**

```json
{
  "success": true,
  "message": "데모 체험 매장 선택 성공",
  "data": {
    "qrId": "demo_cafe_001",
    "storeId": "675a1b2c3d4e5f6789012346",
    "storeName": "카페 데모",
    "area": "강남역",
    "redirectUrl": "http://localhost:3000/spotline/675a1b2c3d4e5f6789012346",
    "isDemoMode": true
  }
}
```

**프론트엔드 사용:**

```javascript
// DemoExperienceButton.tsx에서 사용
const response = await fetch("/api/demo/experience");
const data = await response.json();
if (data.success) {
  window.location.href = data.data.redirectUrl;
}
```

---

### 2. 데모 매장 목록 조회 API

```http
GET /api/demo/stores
```

**설명:** 모든 데모 매장 목록을 반환합니다.

**응답:**

```json
{
  "success": true,
  "message": "데모 매장 목록 조회 성공",
  "data": [
    {
      "id": "675a1b2c3d4e5f6789012346",
      "name": "카페 데모",
      "shortDescription": "조용한 분위기에서 커피와 함께하는 시간",
      "representativeImage": "https://images.unsplash.com/photo-1...",
      "location": {
        "address": "서울시 강남구 테헤란로 123 (데모용 주소)",
        "mapLink": "https://map.naver.com/..."
      },
      "externalLinks": {
        "instagram": "https://instagram.com/demo_cafe",
        "website": "https://demo-cafe.spotline.com"
      },
      "spotlineStory": "이곳은 SpotLine 서비스를 소개하기 위한 데모 카페입니다...",
      "qrCode": {
        "id": "demo_cafe_001",
        "isActive": true
      },
      "isDemoMode": true,
      "demoNotice": "이것은 업주 소개용 데모 페이지입니다."
    },
    {
      "id": "675a1b2c3d4e5f6789012347",
      "name": "갤러리 데모",
      "shortDescription": "현대 미술과 함께하는 문화 공간",
      "representativeImage": "https://images.unsplash.com/photo-2...",
      "location": {
        "address": "서울시 홍대입구역 근처 (데모용 주소)",
        "mapLink": "https://map.naver.com/..."
      },
      "externalLinks": {
        "instagram": "https://instagram.com/demo_gallery"
      },
      "spotlineStory": "예술과 일상이 만나는 특별한 공간입니다...",
      "qrCode": {
        "id": "demo_gallery_001",
        "isActive": true
      },
      "isDemoMode": true,
      "demoNotice": "이것은 업주 소개용 데모 페이지입니다."
    }
  ]
}
```

**프론트엔드 사용:**

```javascript
// demo/page.tsx에서 사용
const stores = await getDemoStores();
setDemoStores(stores);
```

---

### 3. 데모 매장 상세 조회 API

```http
GET /api/demo/stores/{qrId}
```

**설명:** 특정 데모 매장의 상세 정보를 조회합니다.

**예시:**

```http
GET /api/demo/stores/demo_cafe_001
```

**응답:**

```json
{
  "success": true,
  "message": "데모 매장 조회 성공",
  "data": {
    "id": "675a1b2c3d4e5f6789012346",
    "name": "카페 데모",
    "shortDescription": "조용한 분위기에서 커피와 함께하는 시간",
    "representativeImage": "https://images.unsplash.com/photo-1...",
    "location": {
      "address": "서울시 강남구 테헤란로 123 (데모용 주소)",
      "mapLink": "https://map.naver.com/..."
    },
    "externalLinks": {
      "instagram": "https://instagram.com/demo_cafe",
      "website": "https://demo-cafe.spotline.com"
    },
    "spotlineStory": "이곳은 SpotLine 서비스를 소개하기 위한 데모 카페입니다. 실제 서비스에서는 업주님의 매장 스토리가 이 자리에 표시됩니다. 고객들에게 매장의 특별한 이야기와 분위기를 전달할 수 있습니다.",
    "qrCode": {
      "id": "demo_cafe_001",
      "isActive": true
    },
    "isDemoMode": true,
    "demoNotice": "이것은 업주 소개용 데모 페이지입니다."
  }
}
```

---

### 4. 데모 다음 Spot 조회 API

```http
GET /api/demo/next-spots/{storeId}?limit=4
```

**설명:** 데모 매장의 다음 추천 Spot들을 조회합니다.

**예시:**

```http
GET /api/demo/next-spots/675a1b2c3d4e5f6789012346?limit=4
```

**응답:**

```json
{
  "success": true,
  "message": "데모 다음 Spot 조회 성공",
  "data": [
    {
      "id": "675a1b2c3d4e5f6789012347",
      "name": "갤러리 데모",
      "shortDescription": "현대 미술과 함께하는 문화 공간",
      "representativeImage": "https://images.unsplash.com/photo-2...",
      "mapLink": "https://map.naver.com/...",
      "category": "culture",
      "walkingTime": 5,
      "distance": 250
    },
    {
      "id": "675a1b2c3d4e5f6789012348",
      "name": "레스토랑 데모",
      "shortDescription": "신선한 재료로 만든 건강한 식사",
      "representativeImage": "https://images.unsplash.com/photo-3...",
      "mapLink": "https://map.naver.com/...",
      "category": "restaurant",
      "walkingTime": 8,
      "distance": 400
    },
    {
      "id": "675a1b2c3d4e5f6789012349",
      "name": "북카페 데모",
      "shortDescription": "책과 커피가 어우러진 조용한 공간",
      "representativeImage": "https://images.unsplash.com/photo-4...",
      "mapLink": "https://map.naver.com/...",
      "category": "cafe",
      "walkingTime": 3,
      "distance": 150
    }
  ]
}
```

---

## 🗄️ 데모 데이터베이스 구조

### DemoStore Collection

```javascript
{
  _id: ObjectId("675a1b2c3d4e5f6789012346"),
  name: "카페 데모",
  shortDescription: "조용한 분위기에서 커피와 함께하는 시간",
  representativeImage: "https://images.unsplash.com/photo-1...",
  location: {
    address: "서울시 강남구 테헤란로 123 (데모용 주소)",
    mapLink: "https://map.naver.com/..."
  },
  externalLinks: {
    instagram: "https://instagram.com/demo_cafe",
    website: "https://demo-cafe.spotline.com"
  },
  spotlineStory: "이곳은 SpotLine 서비스를 소개하기 위한 데모 카페입니다...",
  qrCode: {
    id: "demo_cafe_001",
    isActive: true
  },
  isDemoMode: true,
  demoNotice: "이것은 업주 소개용 데모 페이지입니다.",
  createdAt: Date,
  updatedAt: Date
}
```

### DemoRecommendation Collection

```javascript
{
  _id: ObjectId,
  fromStoreId: ObjectId("675a1b2c3d4e5f6789012346"), // 출발 매장
  toStoreId: ObjectId("675a1b2c3d4e5f6789012347"),   // 추천 매장
  category: "culture",
  priority: 1,
  distance: 250,
  walkingTime: 5,
  description: "카페에서 갤러리로 이어지는 문화적 경험",
  isActive: true,
  createdAt: Date
}
```

---

## 🎯 데모 데이터 예시

### 데모 매장 4개

1. **카페 데모** (`demo_cafe_001`)

   - 조용한 분위기의 카페
   - 다음 추천: 갤러리, 레스토랑, 북카페

2. **갤러리 데모** (`demo_gallery_001`)

   - 현대 미술 전시 공간
   - 다음 추천: 북카페, 카페, 디저트샵

3. **레스토랑 데모** (`demo_restaurant_001`)

   - 건강한 식사 공간
   - 다음 추천: 디저트샵, 카페, 갤러리

4. **북카페 데모** (`demo_bookcafe_001`)
   - 책과 커피가 어우러진 공간
   - 다음 추천: 카페, 갤러리, 레스토랑

---

## 🚨 중요 사항

### 1. 데모 시스템 특징

- ✅ **통계 수집 없음**: 데모 시스템은 분석 데이터를 수집하지 않습니다
- ✅ **별도 데이터베이스**: 실제 운영 데이터와 완전히 분리
- ✅ **데모 표시**: 모든 페이지에 데모임을 명확히 표시
- ✅ **QR 코드 구분**: `demo_*` 형태의 QR 코드 ID 사용

### 2. 에러 처리

```json
{
  "success": false,
  "message": "데모 매장을 찾을 수 없습니다",
  "error": "DEMO_STORE_NOT_FOUND"
}
```

### 3. 프론트엔드 환경변수

```bash
# .env.local
NEXT_PUBLIC_DEMO_API_URL=http://localhost:4000/api/demo
NEXT_PUBLIC_DEMO_ENABLED=true
```

---

## 📝 구현 체크리스트

### 백엔드 구현 필요사항

- [ ] `GET /api/demo/experience` - 랜덤 데모 체험
- [ ] `GET /api/demo/stores` - 데모 매장 목록
- [ ] `GET /api/demo/stores/{qrId}` - 데모 매장 상세
- [ ] `GET /api/demo/next-spots/{storeId}` - 데모 다음 Spot
- [ ] DemoStore 스키마 생성
- [ ] DemoRecommendation 스키마 생성
- [ ] 데모 데이터 시드 스크립트
- [ ] 통계 수집 제외 로직

### 프론트엔드 (완료)

- [x] `getDemoExperience()` API 함수
- [x] `getDemoStores()` API 함수
- [x] `getDemoStoreByQR()` API 함수
- [x] `getDemoNextSpots()` API 함수
- [x] 데모 페이지 매장 목록 UI
- [x] 데모 모드 표시 UI

이 명세서를 바탕으로 백엔드에서 데모 시스템을 구현하면 프론트엔드와 완벽하게 연동됩니다!
