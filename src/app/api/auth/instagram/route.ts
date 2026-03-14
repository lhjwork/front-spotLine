import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const clientId = process.env.INSTAGRAM_APP_ID;
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3003";

  if (!clientId) {
    return NextResponse.json(
      { success: false, error: "Instagram App ID가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  // CSRF 방지용 state 토큰
  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("instagram_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10분
    path: "/",
  });

  const redirectUri = `${baseUrl}/api/auth/instagram/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "instagram_basic,pages_show_list",
    response_type: "code",
    state,
  });

  const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
