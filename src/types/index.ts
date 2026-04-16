// 매장 관련 타입
export interface Location {
  address: string;
  coordinates: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  district?: string;
  area?: string;
}

export interface Contact {
  phone?: string;
  website?: string;
  instagram?: string;
}

export interface BusinessHours {
  [key: string]: {
    open?: string;
    close?: string;
  };
}

export interface QRCode {
  id: string;
  isActive: boolean;
}

export type StoreCategory = "cafe" | "restaurant" | "exhibition" | "hotel" | "retail" | "culture" | "other";

export interface Store {
  _id: string;
  name: string;
  category: StoreCategory;
  location: Location;
  contact?: Contact;
  businessHours?: BusinessHours;
  description?: string;
  tags?: string[];
  images?: string[];
  qrCode: QRCode;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  distance?: number; // 근처 매장 검색시 추가되는 필드
}

// 추천 관련 타입
export type RecommendationCategory = "next_meal" | "dessert" | "activity" | "shopping" | "culture" | "rest";

export interface Recommendation {
  _id: string;
  fromStore: Store;
  toStore: Store;
  category: RecommendationCategory;
  priority: number;
  distance?: number;
  walkingTime?: number;
  description?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface RecommendationResponse {
  success: boolean;
  message: string;
  data: Recommendation[];
}

// SpotLine VERSION002 타입 정의

// QR 코드 ID 타입 (의미있는 ID)
export type QRCodeId = string;

// Experience 관련 타입
export interface ExperienceResult {
  qrId: QRCodeId;
  storeName: string;
  storeId: string;
  area: string;
  configUsed: {
    id: string;
    name: string;
    type: string;
  };
  redirectUrl: string;
}

export interface ExperienceSession {
  id: string;
  qrId: QRCodeId;
  storeId: string;
  startedAt: string;
  completedAt?: string;
  sessionId: string;
}

export interface ExperienceResponse {
  success: boolean;
  message: string;
  data: {
    experience: ExperienceSession;
    store: SpotlineStore;
    nextSpots: NextSpot[];
  };
}

// Demo 시스템 타입 (VERSION002 - 데모/실제 분리)
export interface DemoExperienceResult {
  qrId: string;
  storeName: string;
  storeId: string;
  area: string;
  redirectUrl: string;
  isDemoMode: true;
}

// SpotLine 전용 매장 타입 (간소화) - 데모와 실제 운영 공통 사용
export interface SpotlineStore {
  id: string;
  name: string;
  shortDescription: string;
  representativeImage: string;
  category?: string;
  location: {
    address: string;
    mapLink?: string;
    coordinates?: [number, number]; // 데모용 좌표 (선택적)
  };
  externalLinks?: Array<{
    type: string;
    url: string;
    title: string;
  }>;
  spotlineStory?: string | {
    title: string;
    content: string;
    tags?: string[];
  };
  qrCode?: {
    id: string;
    isActive: boolean;
  };
  // 데모 모드 구분용 (선택적)
  isDemoMode?: boolean;
  demoNotice?: string;
}

// SpotLine 전용 다음 Spot 타입
export interface NextSpot {
  id: string;
  name: string;
  shortDescription: string;
  representativeImage: string;
  category: string;
  walkingTime: number;
  distance: number;
  mapLink?: string;
  spotlineStory?: {
    title: string;
    content: string;
  };
}

// SpotLine 전용 분석 이벤트 타입 (VERSION002 - 확장)
export interface SpotlineAnalyticsEvent {
  qrCode: QRCodeId;
  store: string;
  eventType: "page_enter" | "spot_click" | "map_link_click" | "page_exit" | "external_link_click" | "experience_start" | "experience_complete" | "story_expand" | "story_collapse";
  targetStore?: string;
  sessionId: string; // 익명 세션만
  experienceId?: string; // Experience 세션 ID
  metadata?: {
    spotPosition?: number;
    stayDuration?: number;
    nextSpotId?: string;
    completionTime?: number;
    linkType?: string;
    storySection?: string;
  };
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  status?: number;
}

// 필터 타입
export interface FilterOptions {
  category?: RecommendationCategory | StoreCategory;
  limit?: number;
  area?: string;
  radius?: number;
}

// 지오코딩 관련 타입
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodeResponse {
  coordinates: Coordinates;
  source: string;
  address: string;
}

export interface CoordinateValidation {
  valid: boolean;
  coordinates: Coordinates;
  message: string;
}

// 통계 관련 타입
export interface CategoryStats {
  category: string;
  count: number;
}

export interface StatsResponse {
  categories: CategoryStats[];
}

// 근처 매장 검색 관련 타입
export interface NearbyStoreParams {
  lat: number;
  lng: number;
  radius?: number;
  category?: StoreCategory;
}

// ============================================================
// Spot/SpotLine 핵심 타입 (Experience Social Platform)
// ============================================================

export type SpotCategory =
  | "cafe" | "restaurant" | "bar"
  | "nature" | "culture" | "exhibition"
  | "walk" | "activity" | "shopping" | "other";

export type SpotLineTheme =
  | "date" | "travel" | "walk" | "hangout"
  | "food-tour" | "cafe-tour" | "culture";

export type FeedSort = "popular" | "newest";

// QR Partner System (Phase 8)
export type PartnerTier = "basic" | "premium";

export interface SpotPartnerInfo {
  isPartner: boolean;
  brandColor: string;
  benefitText: string | null;
  tier: PartnerTier;
  partnerSince: string;
}

// Spot 상세 응답 (GET /api/v2/spots/:slug)
export interface SpotDetailResponse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: SpotCategory;
  source: string;
  crewNote: string | null;
  address: string;
  latitude: number;
  longitude: number;
  area: string;
  sido: string | null;
  sigungu: string | null;
  dong: string | null;
  blogUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  naverPlaceId: string | null;
  kakaoPlaceId: string | null;
  tags: string[];
  media: string[];
  mediaItems: SpotMediaItem[];
  likesCount: number;
  savesCount: number;
  visitedCount: number;
  viewsCount: number;
  commentsCount: number;
  creatorId: string | null;
  creatorType: string;
  creatorName: string | null;
  createdAt: string;
  placeInfo: DiscoverPlaceInfo | null;
  partner: SpotPartnerInfo | null;
  status: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

// SpotLine 상세 응답 (GET /api/v2/spotlines/:slug)
export interface SpotLineDetailResponse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  theme: SpotLineTheme;
  area: string;
  totalDuration: number;
  totalDistance: number;
  spots: SpotLineSpotDetail[];
  likesCount: number;
  savesCount: number;
  replicationsCount: number;
  completionsCount: number;
  commentsCount: number;
  creatorId: string | null;
  creatorType: string;
  creatorName: string | null;
  parentSpotLineId: string | null;
  variationsCount: number;
  createdAt: string;
}

// SpotLine 내 Spot 상세 (SpotLineDetailResponse.spots 항목)
export interface SpotLineSpotDetail {
  order: number;
  suggestedTime: string | null;
  stayDuration: number | null;
  walkingTimeToNext: number | null;
  distanceToNext: number | null;
  transitionNote: string | null;
  spotId: string;
  spotSlug: string;
  spotTitle: string;
  spotCategory: string;
  spotArea: string;
  spotAddress: string;
  spotLatitude: number;
  spotLongitude: number;
  crewNote: string | null;
  spotMedia: string[];
}

// ============================================================
// Discover API 타입 (Location-Based Discovery)
// ============================================================

export interface DiscoverCurrentSpot {
  spot: DiscoverSpot;
  placeInfo: DiscoverPlaceInfo | null;
  distanceFromUser: number; // meters
}

export interface DiscoverNextSpot {
  spot: DiscoverSpot;
  placeInfo: DiscoverPlaceInfo | null;
  distanceFromCurrent: number; // meters
  walkingTime: number; // minutes
}

export interface SpotMediaItem {
  id: string;
  url: string;
  mediaType: "IMAGE" | "VIDEO";
  thumbnailUrl: string | null;
  durationSec: number | null;
  displayOrder: number;
}

export interface MediaItemRequest {
  url?: string;
  s3Key?: string;
  mediaType: "IMAGE" | "VIDEO";
  displayOrder?: number;
  fileSizeBytes?: number;
  mimeType?: string;
}

export interface DiscoverSpot {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  source: string;
  crewNote: string | null;
  address: string;
  latitude: number;
  longitude: number;
  area: string;
  naverPlaceId: string | null;
  kakaoPlaceId: string | null;
  tags: string[];
  media: string[];
  mediaItems?: SpotMediaItem[];
  likesCount: number;
  savesCount: number;
  viewsCount: number;
  creatorType: string;
  creatorName: string | null;
  createdAt: string;
  placeInfo: DiscoverPlaceInfo | null;
}

export interface DiscoverPlaceInfo {
  provider: string;
  placeId: string;
  name: string;
  address: string;
  phone: string | null;
  category: string | null;
  businessHours: string | null;
  rating: number | null;
  reviewCount: number | null;
  photos: string[] | null;
  url: string | null;
  dailyHours: PlaceDailyHour[] | null;
  menuItems: PlaceMenuItem[] | null;
  facilities: string[] | null;
}

export interface PlaceDailyHour {
  day: string;
  timeSE: string;
}

export interface PlaceMenuItem {
  name: string;
  price: string;
  photo: string | null;
}

export interface SpotLinePreview {
  id: string;
  slug: string;
  title: string;
  theme: string;
  area: string;
  totalDuration: number; // minutes
  totalDistance: number; // meters
  spotCount: number;
  likesCount: number;
  coverImageUrl?: string;
}

export interface DiscoverResponse {
  currentSpot: DiscoverCurrentSpot | null;
  nextSpot: DiscoverNextSpot | null;
  nearbySpots: DiscoverSpot[];
  popularSpotLines: SpotLinePreview[];
  area: string | null;
  locationGranted: boolean;
}

export interface GeolocationState {
  coordinates: { lat: number; lng: number } | null;
  status: "idle" | "requesting" | "granted" | "denied" | "unavailable";
  error: string | null;
  accuracy: number | null;
}

// 헬스 체크 타입
export interface HealthCheckResponse {
  status: string;
  message: string;
}

// ============================================================
// Social Features 타입 (Phase 6)
// ============================================================

// 소셜 상태 (사용자별, 리소스별)
export interface SocialStatus {
  isLiked: boolean;
  isSaved: boolean;
  isVisited: boolean;
}

// 소셜 토글 API 응답
export interface SocialToggleResponse {
  liked?: boolean;
  saved?: boolean;
  visited?: boolean;
  likesCount: number;
  savesCount: number;
  visitedCount: number;
}

// ============================================================
// Checkin 타입 (GPS 기반 체크인)
// ============================================================

export interface CheckinRequest {
  latitude?: number;
  longitude?: number;
  memo?: string;
}

export interface CheckinResponse {
  id: string;
  spotId: string;
  verified: boolean;
  memo?: string;
  visitedCount: number;
  myCheckinCount: number;
  createdAt: string;
}

export interface CheckinListItem {
  id: string;
  userId: string;
  memo?: string;
  verified: boolean;
  createdAt: string;
  spotId?: string;
  spotTitle?: string;
  spotSlug?: string;
  spotThumbnail?: string;
}

// ============================================================
// Feed / City / Theme 타입 (Experience Feed - Phase 4)
// ============================================================

// Spring Boot Page 응답 매핑
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;       // current page (0-indexed)
  size: number;
  last: boolean;
  first: boolean;
}

// City 정적 데이터
export interface CityInfo {
  slug: string;
  name: string;
  description: string;
  area: string;
}

// Theme 정적 데이터
export interface ThemeInfo {
  slug: string;
  name: string;
  description: string;
  theme: SpotLineTheme;
  colorClass: string;
  iconName: string;
}

// ============================================================
// Mockup V2: SpotLine 제휴 Spot + 유저 생태계 타입
// ============================================================

// 유저 프로필
export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  bio?: string;
  joinedAt: string;
  email?: string;
  instagramId?: string; // 레거시 호환
  stats: {
    visited: number;
    liked: number;
    recommended: number;
    spotlines: number; // 참여 중인 SpotLine 수
    spotsCount: number;
    spotLinesCount: number;
    blogsCount: number;
    followers: number;
    following: number;
  };
}

// Spot 소스: SpotLine 제휴 vs 유저 추천
export type SpotSource = "spotline" | "user";

// Spot 승인 상태
export type SpotStatus = "PENDING" | "APPROVED" | "REJECTED";

// 유저 활동 타입
export type UserActivityType = "visit" | "like" | "recommend";

export interface UserSpotActivity {
  id: string;
  user: UserProfile;
  spotId: string;
  type: UserActivityType;
  createdAt: string;
  review?: string;
  photos?: string[];
  helpfulCount?: number;
}

// SpotLine 제휴 정보
export interface SpotLineAffiliation {
  spotlineId: string;
  spotlineName: string;
  spotlineColor: string; // 브랜딩 컬러
  isPartner: boolean; // 공식 파트너 여부
  partnerSince?: string;
  qrCodeId?: string;
  curatorName?: string; // SpotLine 운영 크루
}

// Mockup V2 용 Spot 타입 (지도 + 유저 활동 통합)
export interface MockupSpot {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  image: string;
  images?: string[];
  distance: number;
  walkingTime: number;
  rating: number;
  tags: string[];
  area: string;
  address: string;
  lat: number;
  lng: number;

  // 소스 구분
  source: SpotSource;

  // SpotLine 제휴 정보 (source === "spotline" 일 때)
  spotlineAffiliation?: SpotLineAffiliation;

  // 유저 활동 집계
  userStats: {
    visitCount: number;
    likeCount: number;
    recommendCount: number;
    recentVisitors: Pick<UserProfile, "id" | "nickname" | "avatar">[];
  };

  // 유저가 추천한 Spot (source === "user" 일 때)
  recommendedBy?: Pick<UserProfile, "id" | "nickname" | "avatar">;

  // 크루 정보 (source === "spotline" 일 때)
  author?: string;
}

// ============================================================
// Experience Replication 타입 (Phase 7)
// ============================================================

// 내 SpotLine (복제된 SpotLine)
export interface MySpotLine {
  id: string;
  spotLineId: string;
  spotLineSlug: string;
  title: string;
  area: string;
  spotsCount: number;
  scheduledDate: string | null;
  status: "scheduled" | "completed" | "cancelled";
  completedAt: string | null;
  parentSpotLineId: string;
  createdAt: string;
}

// 복제 요청
export interface ReplicateSpotLineRequest {
  scheduledDate: string | null;
}

// 복제 응답
export interface ReplicateSpotLineResponse {
  mySpotLine: MySpotLine;
  replicationsCount: number;
}

// SpotLine 요약 (목록 표시용)
export interface SpotLineSummary {
  id: string;
  name: string;
  description: string;
  color: string;
  curatorName: string;
  curatorAvatar: string;
  spotCount: number;
  totalLikes: number;
  totalVisits: number;
  area: string;
  coverImage: string;
}

// ============================================================
// Comment 타입 (Comment System)
// ============================================================

export type CommentTargetType = "SPOT" | "SPOTLINE" | "BLOG";

export interface CommentResponse {
  id: string;
  targetType: CommentTargetType;
  targetId: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replies: CommentResponse[];
}

export interface CreateCommentRequest {
  targetType: CommentTargetType;
  targetId: string;
  content: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// ============================================================
// SpotLine Builder 타입 (User SpotLine Experience)
// ============================================================

/** Builder에서 관리하는 개별 Spot 상태 */
export interface SpotLineBuilderSpot {
  spot: SpotDetailResponse;
  order: number;
  suggestedTime: string | null;
  stayDuration: number | null;
  transitionNote: string | null;
  walkingTimeToNext: number | null;
  distanceToNext: number | null;
}

/** Spot 검색 파라미터 */
export interface SpotSearchParams {
  keyword?: string;
  area?: string;
  category?: SpotCategory;
  page?: number;
  size?: number;
}

/** SpotLine 생성 요청 */
export interface CreateSpotLineRequest {
  title: string;
  description?: string;
  theme: string;
  area: string;
  parentSpotLineId?: string;
  creatorName?: string;
  spots: CreateSpotLineSpotRequest[];
}

export interface CreateSpotLineSpotRequest {
  spotId: string;
  order: number;
  suggestedTime?: string;
  stayDuration?: number;
  walkingTimeToNext?: number;
  distanceToNext?: number;
  transitionNote?: string;
}

/** SpotLine 수정 요청 */
export interface UpdateSpotLineRequest {
  title?: string;
  description?: string;
  theme?: string;
  area?: string;
  spots?: CreateSpotLineSpotRequest[];
}

// ============================================================
// Blog 타입 (SpotLine Blog Builder)
// ============================================================

export type BlogStatus = "DRAFT" | "PUBLISHED";
export type BlogBlockType = "INTRO" | "SPOT" | "TRANSITION" | "OUTRO";

export interface BlogResponse {
  id: string;
  slug: string;
  spotLineId: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  status: BlogStatus;
  viewsCount: number;
  likesCount: number;
  savesCount: number;
  commentsCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogDetailResponse extends BlogResponse {
  spotLine: SpotLineDetailResponse;
  blocks: BlogBlockResponse[];
}

export interface BlogBlockResponse {
  id: string;
  spotId: string | null;
  blockType: BlogBlockType;
  blockOrder: number;
  content: string | null;
  mediaItems: BlogBlockMediaResponse[];
  spotTitle: string | null;
  spotCategory: string | null;
  spotArea: string | null;
  spotAddress: string | null;
  spotMedia: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogBlockMediaResponse {
  id: string;
  mediaUrl: string;
  mediaOrder: number;
  caption: string | null;
}

export interface BlogListItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  status: BlogStatus;
  userName: string;
  userAvatarUrl: string | null;
  spotLineTitle: string;
  spotLineArea: string;
  spotCount: number;
  viewsCount: number;
  likesCount: number;
  publishedAt: string | null;
  createdAt: string;
}

export interface FollowingFeedItem {
  type: "SPOTLINE" | "BLOG";
  id: string;
  slug: string;
  title: string;
  area: string | null;
  coverImageUrl: string | null;
  likesCount: number;
  viewsCount: number;
  // SpotLine specific
  theme: string | null;
  spotCount: number | null;
  totalDuration: number | null;
  // Blog specific
  summary: string | null;
  // Creator
  userName: string;
  userAvatar: string | null;
  createdAt: string;
}

export interface CreateBlogRequest {
  spotLineId: string;
  title: string;
}

export interface UpdateBlogRequest {
  title?: string;
  summary?: string;
  coverImageUrl?: string;
}

// ============================================================
// Notification
// ============================================================

export type NotificationType = "FOLLOW" | "SPOT_LIKE" | "SPOTLINE_LIKE" | "BLOG_LIKE" | "COMMENT" | "FORK" | "SPOT_APPROVED" | "SPOT_REJECTED";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  targetType: string | null;
  targetId: string | null;
  targetSlug: string | null;
  isRead: boolean;
  createdAt: string;
  actorId: string;
  actorNickname: string;
  actorAvatar: string | null;
  message: string | null;
}

// ============================================================
// Blog Blocks
// ============================================================

export interface SaveBlogBlocksRequest {
  blocks: {
    id?: string;
    spotId?: string;
    blockType: BlogBlockType;
    blockOrder: number;
    content: string | null;
    mediaItems: {
      id?: string;
      mediaUrl: string;
      mediaOrder: number;
      caption?: string;
    }[];
  }[];
}

// ============================================================
// User Spot Creation
// ============================================================

/** Spot 생성 요청 (유저용) */
export interface CreateSpotRequest {
  title: string;
  category: SpotCategory;
  source: string;
  address: string;
  latitude: number;
  longitude: number;
  area: string;
  sido?: string;
  sigungu?: string;
  dong?: string;
  description?: string;
  tags?: string[];
  blogUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  mediaItems?: MediaItemRequest[];
}

/** Spot 생성 응답 */
export interface CreateSpotResponse {
  id: string;
  slug: string;
  title: string;
  category: SpotCategory;
  address: string;
  createdAt: string;
}
