import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface InstagramAccountResponse {
  instagram_business_account?: { id: string };
  id: string;
}

interface InstagramProfileResponse {
  id: string;
  username: string;
  profile_picture_url?: string;
  account_type?: string;
}

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3003";

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // 사용자가 권한 거부
    if (error) {
      return NextResponse.redirect(
        `${baseUrl}/auth/callback?error=${encodeURIComponent("로그인이 취소되었습니다.")}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${baseUrl}/auth/callback?error=${encodeURIComponent("잘못된 요청입니다.")}`
      );
    }

    // CSRF state 검증
    const cookieStore = await cookies();
    const savedState = cookieStore.get("instagram_oauth_state")?.value;
    cookieStore.delete("instagram_oauth_state");

    if (state !== savedState) {
      return NextResponse.redirect(
        `${baseUrl}/auth/callback?error=${encodeURIComponent("보안 검증에 실패했습니다. 다시 시도해주세요.")}`
      );
    }

    const clientId = process.env.INSTAGRAM_APP_ID!;
    const clientSecret = process.env.INSTAGRAM_APP_SECRET!;
    const redirectUri = `${baseUrl}/api/auth/instagram/callback`;

    // 1. code → short-lived token 교환
    const tokenRes = await fetch("https://graph.facebook.com/v21.0/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.json().catch(() => null);
      console.error("Token exchange failed:", errData);
      return NextResponse.redirect(
        `${baseUrl}/auth/callback?error=${encodeURIComponent("인증 토큰 교환에 실패했습니다.")}`
      );
    }

    const tokenData: FacebookTokenResponse = await tokenRes.json();

    // 2. short-lived → long-lived token 교환
    const longTokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: clientId,
          client_secret: clientSecret,
          fb_exchange_token: tokenData.access_token,
        })
    );

    let accessToken = tokenData.access_token;
    let expiresIn = tokenData.expires_in || 3600;

    if (longTokenRes.ok) {
      const longTokenData: FacebookTokenResponse = await longTokenRes.json();
      accessToken = longTokenData.access_token;
      expiresIn = longTokenData.expires_in || 5184000; // 60일
    }

    // 3. Facebook 페이지에서 Instagram 비즈니스 계정 ID 가져오기
    // 먼저 Instagram 직접 조회 시도
    let instagramProfile: InstagramProfileResponse | null = null;

    // Facebook User의 Instagram 계정 조회
    const pagesRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
    );

    if (pagesRes.ok) {
      const pagesData = await pagesRes.json();
      const pages = pagesData.data as InstagramAccountResponse[];
      const igAccount = pages?.find((p) => p.instagram_business_account);

      if (igAccount?.instagram_business_account) {
        const igId = igAccount.instagram_business_account.id;
        const profileRes = await fetch(
          `https://graph.instagram.com/v21.0/${igId}?fields=id,username,profile_picture_url,account_type&access_token=${accessToken}`
        );
        if (profileRes.ok) {
          instagramProfile = await profileRes.json();
        }
      }
    }

    // Instagram 비즈니스 계정이 없는 경우 Facebook 프로필로 폴백
    if (!instagramProfile) {
      const fbProfileRes = await fetch(
        `https://graph.facebook.com/v21.0/me?fields=id,name,picture.type(large)&access_token=${accessToken}`
      );

      if (!fbProfileRes.ok) {
        return NextResponse.redirect(
          `${baseUrl}/auth/callback?error=${encodeURIComponent("프로필 정보를 가져올 수 없습니다.")}`
        );
      }

      const fbProfile = await fbProfileRes.json();
      instagramProfile = {
        id: fbProfile.id,
        username: fbProfile.name || `user_${fbProfile.id}`,
        profile_picture_url: fbProfile.picture?.data?.url,
        account_type: "PERSONAL",
      };
    }

    // 4. 응답 데이터 구성 + base64 인코딩
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const authData = {
      success: true,
      user: {
        instagramId: instagramProfile.id,
        username: instagramProfile.username,
        profilePicture: instagramProfile.profile_picture_url || "",
        accountType: instagramProfile.account_type || "PERSONAL",
      },
      expiresAt,
    };

    const encoded = Buffer.from(JSON.stringify(authData)).toString("base64url");

    return NextResponse.redirect(`${baseUrl}/auth/callback?data=${encoded}`);
  } catch (error) {
    console.error("Instagram OAuth callback error:", error);
    return NextResponse.redirect(
      `${baseUrl}/auth/callback?error=${encodeURIComponent("로그인 처리 중 오류가 발생했습니다.")}`
    );
  }
}
