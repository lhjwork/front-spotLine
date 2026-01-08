# SpotLine 데모 시스템 백엔드 구현 가이드

## 📋 개요

이 문서는 백엔드 개발자가 SpotLine 데모 시스템을 구현하기 위한 상세한 가이드입니다.

---

## 🗄️ 데이터베이스 스키마

### 1. DemoStore 스키마 (MongoDB)

```javascript
// models/DemoStore.js
const mongoose = require("mongoose");

const demoStoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      maxLength: 100,
    },
    representativeImage: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: "representativeImage must be a valid URL",
      },
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      mapLink: {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            return /^https?:\/\/.+/.test(v);
          },
          message: "mapLink must be a valid URL",
        },
      },
    },
    externalLinks: {
      instagram: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: "instagram must be a valid URL",
        },
      },
      website: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: "website must be a valid URL",
        },
      },
      blog: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: "blog must be a valid URL",
        },
      },
    },
    spotlineStory: {
      type: String,
      required: true,
      minLength: 50,
      maxLength: 1000,
    },
    qrCode: {
      id: {
        type: String,
        required: true,
        unique: true,
        match: /^demo_[a-z]+_\d{3}$/,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    isDemoMode: {
      type: Boolean,
      default: true,
      immutable: true,
    },
    demoNotice: {
      type: String,
      default: "이것은 업주 소개용 데모 페이지입니다.",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// 인덱스 설정
demoStoreSchema.index({ "qrCode.id": 1 });
demoStoreSchema.index({ isActive: 1 });

module.exports = mongoose.model("DemoStore", demoStoreSchema);
```

### 2. DemoRecommendation 스키마

```javascript
// models/DemoRecommendation.js
const mongoose = require("mongoose");

const demoRecommendationSchema = new mongoose.Schema(
  {
    fromStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DemoStore",
      required: true,
    },
    toStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DemoStore",
      required: true,
    },
    category: {
      type: String,
      enum: ["cafe", "restaurant", "culture", "gallery", "dessert", "bookstore"],
      required: true,
    },
    priority: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    distance: {
      type: Number, // 미터 단위
      min: 0,
      required: true,
    },
    walkingTime: {
      type: Number, // 분 단위
      min: 1,
      required: true,
    },
    description: {
      type: String,
      maxLength: 200,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// 인덱스 설정
demoRecommendationSchema.index({ fromStoreId: 1, priority: -1 });
demoRecommendationSchema.index({ isActive: 1 });

module.exports = mongoose.model("DemoRecommendation", demoRecommendationSchema);
```

---

## 🔧 API 컨트롤러 구현

### 1. 랜덤 데모 체험 API

```javascript
// controllers/demoController.js
const DemoStore = require("../models/DemoStore");

/**
 * GET /api/demo/experience
 * 랜덤 데모 매장 선택
 */
exports.getDemoExperience = async (req, res) => {
  try {
    // 활성화된 데모 매장 중 랜덤 선택
    const demoStores = await DemoStore.find({
      isActive: true,
      "qrCode.isActive": true,
    });

    if (demoStores.length === 0) {
      return res.status(404).json({
        success: false,
        message: "사용 가능한 데모 매장이 없습니다",
        error: "NO_DEMO_STORES_AVAILABLE",
      });
    }

    // 랜덤 선택
    const randomIndex = Math.floor(Math.random() * demoStores.length);
    const selectedStore = demoStores[randomIndex];

    // 프론트엔드 URL 생성
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const redirectUrl = `${frontendUrl}/spotline/${selectedStore._id}`;

    res.json({
      success: true,
      message: "데모 체험 매장 선택 성공",
      data: {
        qrId: selectedStore.qrCode.id,
        storeId: selectedStore._id.toString(),
        storeName: selectedStore.name,
        area: "데모 지역", // 데모용 고정값
        redirectUrl,
        isDemoMode: true,
      },
    });
  } catch (error) {
    console.error("데모 체험 오류:", error);
    res.status(500).json({
      success: false,
      message: "데모 체험 중 오류가 발생했습니다",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};
```

### 2. 데모 매장 목록 조회 API

```javascript
/**
 * GET /api/demo/stores
 * 모든 데모 매장 목록 조회
 */
exports.getDemoStores = async (req, res) => {
  try {
    const demoStores = await DemoStore.find({
      isActive: true,
      "qrCode.isActive": true,
    }).sort({ createdAt: 1 });

    const formattedStores = demoStores.map((store) => ({
      id: store._id.toString(),
      name: store.name,
      shortDescription: store.shortDescription,
      representativeImage: store.representativeImage,
      location: store.location,
      externalLinks: store.externalLinks,
      spotlineStory: store.spotlineStory,
      qrCode: store.qrCode,
      isDemoMode: store.isDemoMode,
      demoNotice: store.demoNotice,
    }));

    res.json({
      success: true,
      message: "데모 매장 목록 조회 성공",
      data: formattedStores,
    });
  } catch (error) {
    console.error("데모 매장 목록 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "데모 매장 목록을 불러올 수 없습니다",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};
```

### 3. 데모 매장 상세 조회 API

```javascript
/**
 * GET /api/demo/stores/:qrId
 * 특정 데모 매장 상세 정보 조회
 */
exports.getDemoStoreByQR = async (req, res) => {
  try {
    const { qrId } = req.params;

    // QR ID 형식 검증
    if (!qrId.startsWith("demo_")) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 데모 QR 코드입니다",
        error: "INVALID_DEMO_QR_FORMAT",
      });
    }

    const demoStore = await DemoStore.findOne({
      "qrCode.id": qrId,
      isActive: true,
      "qrCode.isActive": true,
    });

    if (!demoStore) {
      return res.status(404).json({
        success: false,
        message: "데모 매장을 찾을 수 없습니다",
        error: "DEMO_STORE_NOT_FOUND",
      });
    }

    const formattedStore = {
      id: demoStore._id.toString(),
      name: demoStore.name,
      shortDescription: demoStore.shortDescription,
      representativeImage: demoStore.representativeImage,
      location: demoStore.location,
      externalLinks: demoStore.externalLinks,
      spotlineStory: demoStore.spotlineStory,
      qrCode: demoStore.qrCode,
      isDemoMode: demoStore.isDemoMode,
      demoNotice: demoStore.demoNotice,
    };

    res.json({
      success: true,
      message: "데모 매장 조회 성공",
      data: formattedStore,
    });
  } catch (error) {
    console.error("데모 매장 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "데모 매장 정보를 불러올 수 없습니다",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};
```

### 4. 데모 다음 Spot 조회 API

```javascript
const DemoRecommendation = require("../models/DemoRecommendation");

/**
 * GET /api/demo/next-spots/:storeId
 * 데모 매장의 다음 추천 Spot 조회
 */
exports.getDemoNextSpots = async (req, res) => {
  try {
    const { storeId } = req.params;
    const limit = parseInt(req.query.limit) || 4;

    // 매장 ID 유효성 검증
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 매장 ID입니다",
        error: "INVALID_STORE_ID",
      });
    }

    // 추천 매장 조회
    const recommendations = await DemoRecommendation.find({
      fromStoreId: storeId,
      isActive: true,
    })
      .populate("toStoreId")
      .sort({ priority: -1, createdAt: 1 })
      .limit(limit);

    const nextSpots = recommendations
      .filter((rec) => rec.toStoreId && rec.toStoreId.isActive)
      .map((rec) => ({
        id: rec.toStoreId._id.toString(),
        name: rec.toStoreId.name,
        shortDescription: rec.toStoreId.shortDescription,
        representativeImage: rec.toStoreId.representativeImage,
        mapLink: rec.toStoreId.location.mapLink,
        category: rec.category,
        walkingTime: rec.walkingTime,
        distance: rec.distance,
      }));

    res.json({
      success: true,
      message: "데모 다음 Spot 조회 성공",
      data: nextSpots,
    });
  } catch (error) {
    console.error("데모 다음 Spot 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "데모 다음 Spot을 불러올 수 없습니다",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};
```

---

## 🛣️ 라우터 설정

```javascript
// routes/demo.js
const express = require("express");
const router = express.Router();
const demoController = require("../controllers/demoController");

// 데모 체험 관련 라우트
router.get("/experience", demoController.getDemoExperience);
router.get("/stores", demoController.getDemoStores);
router.get("/stores/:qrId", demoController.getDemoStoreByQR);
router.get("/next-spots/:storeId", demoController.getDemoNextSpots);

module.exports = router;
```

```javascript
// app.js에서 라우터 등록
const demoRoutes = require("./routes/demo");
app.use("/api/demo", demoRoutes);
```

---

## 🌱 데모 데이터 시드 스크립트

```javascript
// scripts/seedDemoData.js
const mongoose = require("mongoose");
const DemoStore = require("../models/DemoStore");
const DemoRecommendation = require("../models/DemoRecommendation");

const demoStoresData = [
  {
    name: "카페 데모",
    shortDescription: "조용한 분위기에서 커피와 함께하는 시간",
    representativeImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
    location: {
      address: "서울시 강남구 테헤란로 123 (데모용 주소)",
      mapLink: "https://map.naver.com/p/search/강남역%20카페",
    },
    externalLinks: {
      instagram: "https://instagram.com/demo_cafe",
      website: "https://demo-cafe.spotline.com",
    },
    spotlineStory:
      "이곳은 SpotLine 서비스를 소개하기 위한 데모 카페입니다. 실제 서비스에서는 업주님의 매장 스토리가 이 자리에 표시됩니다. 고객들에게 매장의 특별한 이야기와 분위기를 전달할 수 있습니다.",
    qrCode: {
      id: "demo_cafe_001",
      isActive: true,
    },
  },
  {
    name: "갤러리 데모",
    shortDescription: "현대 미술과 함께하는 문화 공간",
    representativeImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262",
    location: {
      address: "서울시 홍대입구역 근처 (데모용 주소)",
      mapLink: "https://map.naver.com/p/search/홍대%20갤러리",
    },
    externalLinks: {
      instagram: "https://instagram.com/demo_gallery",
    },
    spotlineStory: "예술과 일상이 만나는 특별한 공간입니다. 매월 새로운 작가의 작품을 만나볼 수 있으며, 커피와 함께 여유로운 시간을 보낼 수 있습니다.",
    qrCode: {
      id: "demo_gallery_001",
      isActive: true,
    },
  },
  {
    name: "레스토랑 데모",
    shortDescription: "신선한 재료로 만든 건강한 식사",
    representativeImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    location: {
      address: "서울시 이태원동 (데모용 주소)",
      mapLink: "https://map.naver.com/p/search/이태원%20레스토랑",
    },
    externalLinks: {
      website: "https://demo-restaurant.spotline.com",
    },
    spotlineStory: "건강하고 맛있는 식사를 제공하는 레스토랑입니다. 신선한 재료와 정성스러운 요리로 고객들에게 특별한 식사 경험을 선사합니다.",
    qrCode: {
      id: "demo_restaurant_001",
      isActive: true,
    },
  },
  {
    name: "북카페 데모",
    shortDescription: "책과 커피가 어우러진 조용한 공간",
    representativeImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570",
    location: {
      address: "서울시 성수동 (데모용 주소)",
      mapLink: "https://map.naver.com/p/search/성수동%20북카페",
    },
    externalLinks: {
      instagram: "https://instagram.com/demo_bookcafe",
      blog: "https://blog.naver.com/demo_bookcafe",
    },
    spotlineStory: "책과 커피의 완벽한 조화를 경험할 수 있는 공간입니다. 조용한 분위기에서 독서와 함께 여유로운 시간을 보내세요.",
    qrCode: {
      id: "demo_bookcafe_001",
      isActive: true,
    },
  },
];

async function seedDemoData() {
  try {
    // 기존 데모 데이터 삭제
    await DemoStore.deleteMany({});
    await DemoRecommendation.deleteMany({});

    // 데모 매장 생성
    const createdStores = await DemoStore.insertMany(demoStoresData);
    console.log(`${createdStores.length}개의 데모 매장이 생성되었습니다.`);

    // 추천 관계 생성
    const recommendations = [];

    // 카페 → 갤러리, 레스토랑, 북카페
    recommendations.push(
      {
        fromStoreId: createdStores[0]._id,
        toStoreId: createdStores[1]._id,
        category: "culture",
        priority: 8,
        distance: 250,
        walkingTime: 5,
        description: "카페에서 갤러리로 이어지는 문화적 경험",
      },
      {
        fromStoreId: createdStores[0]._id,
        toStoreId: createdStores[2]._id,
        category: "restaurant",
        priority: 7,
        distance: 400,
        walkingTime: 8,
        description: "커피 후 건강한 식사",
      },
      {
        fromStoreId: createdStores[0]._id,
        toStoreId: createdStores[3]._id,
        category: "cafe",
        priority: 6,
        distance: 150,
        walkingTime: 3,
        description: "카페에서 북카페로 이어지는 독서 시간",
      }
    );

    // 갤러리 → 북카페, 카페, 레스토랑
    recommendations.push(
      {
        fromStoreId: createdStores[1]._id,
        toStoreId: createdStores[3]._id,
        category: "cafe",
        priority: 9,
        distance: 300,
        walkingTime: 6,
        description: "예술 감상 후 독서와 함께하는 시간",
      },
      {
        fromStoreId: createdStores[1]._id,
        toStoreId: createdStores[0]._id,
        category: "cafe",
        priority: 7,
        distance: 250,
        walkingTime: 5,
        description: "갤러리에서 카페로 여유로운 시간",
      },
      {
        fromStoreId: createdStores[1]._id,
        toStoreId: createdStores[2]._id,
        category: "restaurant",
        priority: 6,
        distance: 500,
        walkingTime: 10,
        description: "문화 활동 후 맛있는 식사",
      }
    );

    await DemoRecommendation.insertMany(recommendations);
    console.log(`${recommendations.length}개의 데모 추천 관계가 생성되었습니다.`);

    console.log("데모 데이터 시드 완료!");
  } catch (error) {
    console.error("데모 데이터 시드 오류:", error);
  }
}

module.exports = seedDemoData;

// 직접 실행 시
if (require.main === module) {
  mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/spotline")
    .then(() => {
      console.log("MongoDB 연결 성공");
      return seedDemoData();
    })
    .then(() => {
      mongoose.disconnect();
    })
    .catch((error) => {
      console.error("오류:", error);
      mongoose.disconnect();
    });
}
```

---

## 🔒 환경변수 설정

```bash
# .env
MONGODB_URI=mongodb://localhost:27017/spotline
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🧪 테스트 스크립트

```javascript
// tests/demo.test.js
const request = require("supertest");
const app = require("../app");

describe("Demo API Tests", () => {
  test("GET /api/demo/experience - 랜덤 데모 체험", async () => {
    const response = await request(app).get("/api/demo/experience").expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("qrId");
    expect(response.body.data).toHaveProperty("storeId");
    expect(response.body.data).toHaveProperty("redirectUrl");
    expect(response.body.data.isDemoMode).toBe(true);
  });

  test("GET /api/demo/stores - 데모 매장 목록", async () => {
    const response = await request(app).get("/api/demo/stores").expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test("GET /api/demo/stores/demo_cafe_001 - 데모 매장 상세", async () => {
    const response = await request(app).get("/api/demo/stores/demo_cafe_001").expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("name");
    expect(response.body.data.isDemoMode).toBe(true);
  });
});
```

---

## 🚀 배포 명령어

```bash
# 데모 데이터 시드
npm run seed:demo

# 또는
node scripts/seedDemoData.js

# 테스트 실행
npm test -- tests/demo.test.js

# 서버 시작
npm start
```

이 가이드를 따라 구현하면 프론트엔드와 완벽하게 연동되는 데모 시스템을 구축할 수 있습니다!
