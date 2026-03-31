import type { InstagramUser, UserProfile } from "@/types";

const RETURN_URL_KEY = "spotline_auth_return_url";

/** Instagram OAuth 로그인 시작 */
export function startInstagramLogin(returnUrl?: string): void {
  if (returnUrl) {
    sessionStorage.setItem(RETURN_URL_KEY, returnUrl);
  } else {
    sessionStorage.setItem(RETURN_URL_KEY, window.location.href);
  }
  window.location.href = "/api/auth/instagram";
}

/** 로그인 후 돌아갈 URL 가져오기 (1회성) */
export function getAndClearReturnUrl(): string {
  const url = sessionStorage.getItem(RETURN_URL_KEY) || "/";
  sessionStorage.removeItem(RETURN_URL_KEY);
  return url;
}

/** InstagramUser → UserProfile 변환 */
export function createUserProfileFromInstagram(igUser: InstagramUser): UserProfile {
  return {
    id: igUser.instagramId,
    nickname: igUser.username,
    avatar: igUser.profilePicture,
    instagramId: igUser.instagramId,
    joinedAt: new Date().toISOString(),
    stats: { visited: 0, liked: 0, recommended: 0, spotlines: 0, followers: 0, following: 0 },
  };
}
