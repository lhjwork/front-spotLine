import type {
  UserProfile,
  MockupSpot,
  SpotLineSummary,
  UserSpotActivity,
} from "@/types";

// ============================================================
// Mock 유저 프로필
// ============================================================
export const MOCK_USERS: UserProfile[] = [
  {
    id: "user-1",
    nickname: "커피탐험가",
    avatar: "https://picsum.photos/seed/avatar1/100/100",
    bio: "서울의 숨겨진 카페를 찾아다니는 커피 러버",
    joinedAt: "2025-11-15",
    stats: { visited: 42, liked: 28, recommended: 12, spotlines: 3, spotsCount: 0, spotLinesCount: 0, blogsCount: 0, followers: 48, following: 23 },
  },
  {
    id: "user-2",
    nickname: "도시산책러",
    avatar: "https://picsum.photos/seed/avatar2/100/100",
    bio: "걸으며 발견하는 서울의 매력",
    joinedAt: "2025-12-01",
    stats: { visited: 67, liked: 45, recommended: 23, spotlines: 5, spotsCount: 0, spotLinesCount: 0, blogsCount: 0, followers: 120, following: 56 },
  },
  {
    id: "user-3",
    nickname: "전시덕후",
    avatar: "https://picsum.photos/seed/avatar3/100/100",
    bio: "현대미술과 갤러리를 사랑합니다",
    joinedAt: "2026-01-10",
    stats: { visited: 31, liked: 22, recommended: 8, spotlines: 2, spotsCount: 0, spotLinesCount: 0, blogsCount: 0, followers: 35, following: 18 },
  },
  {
    id: "user-4",
    nickname: "맛집헌터",
    avatar: "https://picsum.photos/seed/avatar4/100/100",
    bio: "로컬 맛집만 골라 다니는 미식가",
    joinedAt: "2026-01-20",
    stats: { visited: 55, liked: 38, recommended: 19, spotlines: 4, spotsCount: 0, spotLinesCount: 0, blogsCount: 0, followers: 89, following: 42 },
  },
  {
    id: "user-5",
    nickname: "감성여행자",
    avatar: "https://picsum.photos/seed/avatar5/100/100",
    bio: "사진 찍기 좋은 곳을 찾아다닙니다",
    joinedAt: "2026-02-05",
    stats: { visited: 23, liked: 15, recommended: 6, spotlines: 2, spotsCount: 0, spotLinesCount: 0, blogsCount: 0, followers: 15, following: 31 },
  },
];

// ============================================================
// SpotLine 요약 (제휴 SpotLine 목록)
// ============================================================
export const MOCK_SPOTLINES: SpotLineSummary[] = [
  {
    id: "sl-seongsu",
    name: "성수 크리에이티브 라인",
    description: "성수동의 갤러리, 카페, 공방을 잇는 크리에이티브 루트",
    color: "#3B82F6",
    curatorName: "크루 민지",
    curatorAvatar: "https://picsum.photos/seed/crew1/100/100",
    spotCount: 6,
    totalLikes: 142,
    totalVisits: 523,
    area: "성수",
    coverImage: "https://picsum.photos/seed/sl-seongsu/800/400",
  },
  {
    id: "sl-euljiro",
    name: "을지로 레트로 라인",
    description: "을지로의 힙한 공간과 레트로 감성 스팟을 연결",
    color: "#F59E0B",
    curatorName: "크루 지훈",
    curatorAvatar: "https://picsum.photos/seed/crew2/100/100",
    spotCount: 4,
    totalLikes: 98,
    totalVisits: 387,
    area: "을지로",
    coverImage: "https://picsum.photos/seed/sl-euljiro/800/400",
  },
  {
    id: "sl-yeonnam",
    name: "연남 감성 산책 라인",
    description: "연남동 골목골목 감성적인 공간들을 이어주는 루트",
    color: "#8B5CF6",
    curatorName: "크루 수연",
    curatorAvatar: "https://picsum.photos/seed/crew3/100/100",
    spotCount: 5,
    totalLikes: 115,
    totalVisits: 412,
    area: "연남",
    coverImage: "https://picsum.photos/seed/sl-yeonnam/800/400",
  },
  {
    id: "sl-ikseon",
    name: "익선 한옥 라인",
    description: "익선동 한옥 골목의 매력적인 공간들",
    color: "#EF4444",
    curatorName: "크루 하은",
    curatorAvatar: "https://picsum.photos/seed/crew4/100/100",
    spotCount: 4,
    totalLikes: 87,
    totalVisits: 298,
    area: "익선동",
    coverImage: "https://picsum.photos/seed/sl-ikseon/800/400",
  },
];

// ============================================================
// MockupSpot 데이터 (SpotLine 제휴 + 유저 추천 혼합)
// ============================================================
export const MOCK_SPOTS: MockupSpot[] = [
  // ── SpotLine 제휴 Spot ──
  {
    id: "ondo-coffee",
    slug: "ondo-coffee",
    name: "온도 커피",
    category: "cafe",
    categoryLabel: "카페",
    description: "핸드드립 전문 카페. 조용한 분위기에서 원두의 풍미를 즐길 수 있는 곳.",
    image: "https://picsum.photos/seed/cafe1/400/300",
    images: [
      "https://picsum.photos/seed/cafe1-1/400/300",
      "https://picsum.photos/seed/cafe1-2/400/300",
      "https://picsum.photos/seed/cafe1-3/400/300",
    ],
    distance: 120,
    walkingTime: 2,
    rating: 4.8,
    tags: ["핸드드립", "디저트", "작업하기 좋은"],
    area: "성수",
    address: "서울 성동구 성수이로 12길 21",
    lat: 37.5445,
    lng: 127.056,
    source: "CREW",
    spotlineAffiliation: {
      spotlineId: "sl-seongsu",
      spotlineName: "성수 크리에이티브 라인",
      spotlineColor: "#3B82F6",
      isPartner: true,
      partnerSince: "2025-12-01",
      qrCodeId: "qr-ondo",
      curatorName: "크루 민지",
    },
    author: "크루 민지",
    userStats: {
      visitCount: 89,
      likeCount: 34,
      recommendCount: 12,
      recentVisitors: [
        { id: "user-1", nickname: "커피탐험가", avatar: "https://picsum.photos/seed/avatar1/100/100" },
        { id: "user-2", nickname: "도시산책러", avatar: "https://picsum.photos/seed/avatar2/100/100" },
        { id: "user-5", nickname: "감성여행자", avatar: "https://picsum.photos/seed/avatar5/100/100" },
      ],
    },
  },
  {
    id: "eulji-gallery",
    slug: "eulji-gallery",
    name: "을지 갤러리",
    category: "exhibition",
    categoryLabel: "전시",
    description: "현대미술 기획전이 열리는 소규모 갤러리. 이달의 전시: '도시의 단면'",
    image: "https://picsum.photos/seed/gallery1/400/300",
    distance: 350,
    walkingTime: 5,
    rating: 4.6,
    tags: ["현대미술", "사진전", "무료입장"],
    area: "을지로",
    address: "서울 중구 을지로 156",
    lat: 37.546,
    lng: 127.059,
    source: "CREW",
    spotlineAffiliation: {
      spotlineId: "sl-euljiro",
      spotlineName: "을지로 레트로 라인",
      spotlineColor: "#F59E0B",
      isPartner: true,
      partnerSince: "2026-01-15",
      curatorName: "크루 지훈",
    },
    author: "크루 지훈",
    userStats: {
      visitCount: 56,
      likeCount: 22,
      recommendCount: 7,
      recentVisitors: [
        { id: "user-3", nickname: "전시덕후", avatar: "https://picsum.photos/seed/avatar3/100/100" },
        { id: "user-5", nickname: "감성여행자", avatar: "https://picsum.photos/seed/avatar5/100/100" },
      ],
    },
  },
  {
    id: "mido-restaurant",
    slug: "mido-restaurant",
    name: "미도식당",
    category: "restaurant",
    categoryLabel: "맛집",
    description: "40년 전통의 수제 돈까스. 점심시간에는 줄을 서야 할 수도 있습니다.",
    image: "https://picsum.photos/seed/restaurant1/400/300",
    distance: 200,
    walkingTime: 3,
    rating: 4.9,
    tags: ["돈까스", "점심맛집", "웨이팅"],
    area: "성수",
    address: "서울 성동구 뚝섬로 337",
    lat: 37.5435,
    lng: 127.0545,
    source: "CREW",
    spotlineAffiliation: {
      spotlineId: "sl-seongsu",
      spotlineName: "성수 크리에이티브 라인",
      spotlineColor: "#3B82F6",
      isPartner: true,
      partnerSince: "2025-12-15",
      curatorName: "크루 수연",
    },
    author: "크루 수연",
    userStats: {
      visitCount: 132,
      likeCount: 67,
      recommendCount: 28,
      recentVisitors: [
        { id: "user-4", nickname: "맛집헌터", avatar: "https://picsum.photos/seed/avatar4/100/100" },
        { id: "user-2", nickname: "도시산책러", avatar: "https://picsum.photos/seed/avatar2/100/100" },
        { id: "user-1", nickname: "커피탐험가", avatar: "https://picsum.photos/seed/avatar1/100/100" },
      ],
    },
  },
  {
    id: "moment-shop",
    slug: "moment-shop",
    name: "소품샵 모먼트",
    category: "shopping",
    categoryLabel: "쇼핑",
    description: "감성적인 소품과 문구를 큐레이션하는 작은 가게.",
    image: "https://picsum.photos/seed/shop1/400/300",
    distance: 180,
    walkingTime: 3,
    rating: 4.5,
    tags: ["문구", "소품", "선물"],
    area: "성수",
    address: "서울 성동구 성수이로 7길 15",
    lat: 37.545,
    lng: 127.053,
    source: "CREW",
    spotlineAffiliation: {
      spotlineId: "sl-seongsu",
      spotlineName: "성수 크리에이티브 라인",
      spotlineColor: "#3B82F6",
      isPartner: false,
      curatorName: "크루 민지",
    },
    author: "크루 민지",
    userStats: {
      visitCount: 45,
      likeCount: 19,
      recommendCount: 5,
      recentVisitors: [
        { id: "user-5", nickname: "감성여행자", avatar: "https://picsum.photos/seed/avatar5/100/100" },
      ],
    },
  },
  {
    id: "roasting-house",
    slug: "roasting-house",
    name: "로스팅 하우스",
    category: "cafe",
    categoryLabel: "카페",
    description: "직접 로스팅한 원두로 내린 커피와 수제 베이커리를 즐길 수 있는 공간.",
    image: "https://picsum.photos/seed/cafe2/400/300",
    distance: 450,
    walkingTime: 6,
    rating: 4.7,
    tags: ["로스팅", "베이커리", "테라스"],
    area: "연남",
    address: "서울 마포구 연남로 42",
    lat: 37.5665,
    lng: 126.9235,
    source: "CREW",
    spotlineAffiliation: {
      spotlineId: "sl-yeonnam",
      spotlineName: "연남 감성 산책 라인",
      spotlineColor: "#8B5CF6",
      isPartner: true,
      partnerSince: "2026-02-01",
      qrCodeId: "qr-roasting",
      curatorName: "크루 수연",
    },
    author: "크루 수연",
    userStats: {
      visitCount: 78,
      likeCount: 31,
      recommendCount: 14,
      recentVisitors: [
        { id: "user-1", nickname: "커피탐험가", avatar: "https://picsum.photos/seed/avatar1/100/100" },
        { id: "user-2", nickname: "도시산책러", avatar: "https://picsum.photos/seed/avatar2/100/100" },
      ],
    },
  },

  // ── 유저가 추천/소개한 Spot ──
  {
    id: "hidden-alley-cafe",
    slug: "hidden-alley-cafe",
    name: "골목 끝 카페",
    category: "cafe",
    categoryLabel: "카페",
    description: "아는 사람만 아는 성수 골목의 숨겨진 카페. 시그니처 라떼가 일품.",
    image: "https://picsum.photos/seed/user-cafe1/400/300",
    distance: 280,
    walkingTime: 4,
    rating: 4.6,
    tags: ["숨은맛집", "라떼", "인스타감성"],
    area: "성수",
    address: "서울 성동구 성수이로 18길 8",
    lat: 37.5442,
    lng: 127.0575,
    source: "USER",
    recommendedBy: {
      id: "user-1",
      nickname: "커피탐험가",
      avatar: "https://picsum.photos/seed/avatar1/100/100",
    },
    userStats: {
      visitCount: 23,
      likeCount: 15,
      recommendCount: 4,
      recentVisitors: [
        { id: "user-2", nickname: "도시산책러", avatar: "https://picsum.photos/seed/avatar2/100/100" },
        { id: "user-5", nickname: "감성여행자", avatar: "https://picsum.photos/seed/avatar5/100/100" },
      ],
    },
  },
  {
    id: "vintage-bookshop",
    slug: "vintage-bookshop",
    name: "빈티지 서점",
    category: "culture",
    categoryLabel: "문화",
    description: "독립출판물과 빈티지 서적을 만날 수 있는 아늑한 공간.",
    image: "https://picsum.photos/seed/user-book1/400/300",
    distance: 320,
    walkingTime: 4,
    rating: 4.7,
    tags: ["독립출판", "빈티지", "아늑한"],
    area: "연남",
    address: "서울 마포구 연남로1길 28",
    lat: 37.567,
    lng: 126.924,
    source: "USER",
    recommendedBy: {
      id: "user-3",
      nickname: "전시덕후",
      avatar: "https://picsum.photos/seed/avatar3/100/100",
    },
    userStats: {
      visitCount: 18,
      likeCount: 12,
      recommendCount: 3,
      recentVisitors: [
        { id: "user-1", nickname: "커피탐험가", avatar: "https://picsum.photos/seed/avatar1/100/100" },
      ],
    },
  },
  {
    id: "rooftop-bar-euljiro",
    slug: "rooftop-bar-euljiro",
    name: "을지로 루프탑",
    category: "restaurant",
    categoryLabel: "맛집",
    description: "을지로 빌딩 옥상의 숨겨진 바. 야경과 함께하는 칵테일이 최고.",
    image: "https://picsum.photos/seed/user-bar1/400/300",
    distance: 400,
    walkingTime: 5,
    rating: 4.4,
    tags: ["루프탑", "칵테일", "야경"],
    area: "을지로",
    address: "서울 중구 을지로 142 5층",
    lat: 37.5465,
    lng: 127.0585,
    source: "USER",
    recommendedBy: {
      id: "user-4",
      nickname: "맛집헌터",
      avatar: "https://picsum.photos/seed/avatar4/100/100",
    },
    userStats: {
      visitCount: 34,
      likeCount: 21,
      recommendCount: 9,
      recentVisitors: [
        { id: "user-2", nickname: "도시산책러", avatar: "https://picsum.photos/seed/avatar2/100/100" },
        { id: "user-5", nickname: "감성여행자", avatar: "https://picsum.photos/seed/avatar5/100/100" },
      ],
    },
  },
  {
    id: "photo-studio-seongsu",
    slug: "photo-studio-seongsu",
    name: "스튜디오 포레",
    category: "culture",
    categoryLabel: "문화",
    description: "셀프 사진관과 전시가 결합된 복합 포토 스튜디오.",
    image: "https://picsum.photos/seed/user-studio1/400/300",
    distance: 250,
    walkingTime: 3,
    rating: 4.5,
    tags: ["셀프사진", "포토존", "전시"],
    area: "성수",
    address: "서울 성동구 성수이로 20길 16",
    lat: 37.5448,
    lng: 127.0555,
    source: "USER",
    recommendedBy: {
      id: "user-5",
      nickname: "감성여행자",
      avatar: "https://picsum.photos/seed/avatar5/100/100",
    },
    userStats: {
      visitCount: 41,
      likeCount: 26,
      recommendCount: 11,
      recentVisitors: [
        { id: "user-1", nickname: "커피탐험가", avatar: "https://picsum.photos/seed/avatar1/100/100" },
        { id: "user-3", nickname: "전시덕후", avatar: "https://picsum.photos/seed/avatar3/100/100" },
        { id: "user-4", nickname: "맛집헌터", avatar: "https://picsum.photos/seed/avatar4/100/100" },
      ],
    },
  },
];

// ============================================================
// 최근 유저 활동 (피드용)
// ============================================================
export const MOCK_USER_ACTIVITIES: UserSpotActivity[] = [
  {
    id: "act-1",
    user: MOCK_USERS[0],
    spotId: "ondo-coffee",
    type: "visit",
    createdAt: "2026-03-09T14:30:00",
    review: "역시 핸드드립이 최고! 에티오피아 예가체프 강추합니다.",
    photos: ["https://picsum.photos/seed/act1-1/300/300"],
  },
  {
    id: "act-2",
    user: MOCK_USERS[1],
    spotId: "mido-restaurant",
    type: "like",
    createdAt: "2026-03-09T12:00:00",
  },
  {
    id: "act-3",
    user: MOCK_USERS[2],
    spotId: "eulji-gallery",
    type: "visit",
    createdAt: "2026-03-08T16:00:00",
    review: "'도시의 단면' 전시 정말 인상적이었어요. 사진 촬영도 가능합니다.",
  },
  {
    id: "act-4",
    user: MOCK_USERS[3],
    spotId: "rooftop-bar-euljiro",
    type: "recommend",
    createdAt: "2026-03-08T22:00:00",
    review: "을지로 야경 최고의 뷰 포인트! 시그니처 칵테일 꼭 드셔보세요.",
  },
  {
    id: "act-5",
    user: MOCK_USERS[4],
    spotId: "photo-studio-seongsu",
    type: "recommend",
    createdAt: "2026-03-07T15:00:00",
    review: "셀프 사진관인데 전시도 볼 수 있어서 일석이조!",
    photos: ["https://picsum.photos/seed/act5-1/300/300"],
  },
  {
    id: "act-6",
    user: MOCK_USERS[0],
    spotId: "roasting-house",
    type: "visit",
    createdAt: "2026-03-07T11:00:00",
    review: "직접 로스팅하는 걸 볼 수 있어요. 크로플도 맛있었습니다.",
  },
  {
    id: "act-7",
    user: MOCK_USERS[1],
    spotId: "hidden-alley-cafe",
    type: "visit",
    createdAt: "2026-03-06T14:00:00",
    review: "커피탐험가님 추천대로 시그니처 라떼가 정말 맛있었어요!",
  },
  {
    id: "act-8",
    user: MOCK_USERS[3],
    spotId: "mido-restaurant",
    type: "visit",
    createdAt: "2026-03-06T12:30:00",
    review: "12시 전에 가면 줄 안 서요. 치즈돈까스 강추!",
  },
];

// ============================================================
// 헬퍼 함수
// ============================================================

/** SpotLine 제휴 Spot만 필터링 */
export function getSpotlineSpots(): MockupSpot[] {
  return MOCK_SPOTS.filter((s) => s.source === "CREW");
}

/** 유저 추천 Spot만 필터링 */
export function getUserSpots(): MockupSpot[] {
  return MOCK_SPOTS.filter((s) => s.source === "USER");
}

/** 특정 SpotLine에 제휴된 Spot 필터링 */
export function getSpotsBySpotline(spotlineId: string): MockupSpot[] {
  return MOCK_SPOTS.filter(
    (s) => s.spotlineAffiliation?.spotlineId === spotlineId
  );
}

/** 지역별 Spot 필터링 */
export function getSpotsByArea(area: string): MockupSpot[] {
  return MOCK_SPOTS.filter((s) => s.area === area);
}

/** 카테고리별 Spot 필터링 */
export function getSpotsByCategory(category: string): MockupSpot[] {
  if (category === "all") return MOCK_SPOTS;
  return MOCK_SPOTS.filter((s) => s.category === category);
}

/** Spot ID로 조회 */
export function getSpotById(id: string): MockupSpot | undefined {
  return MOCK_SPOTS.find((s) => s.id === id);
}

/** 특정 Spot의 유저 활동 조회 */
export function getActivitiesForSpot(spotId: string): UserSpotActivity[] {
  return MOCK_USER_ACTIVITIES.filter((a) => a.spotId === spotId);
}

/** 인기순 정렬 (방문 + 좋아요 + 추천) */
export function sortByPopularity(spots: MockupSpot[]): MockupSpot[] {
  return [...spots].sort((a, b) => {
    const scoreA =
      a.userStats.visitCount +
      a.userStats.likeCount * 2 +
      a.userStats.recommendCount * 3;
    const scoreB =
      b.userStats.visitCount +
      b.userStats.likeCount * 2 +
      b.userStats.recommendCount * 3;
    return scoreB - scoreA;
  });
}
