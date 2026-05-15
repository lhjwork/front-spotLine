import { createSupabaseBrowserClient } from "@/lib/supabase";

const RETURN_URL_KEY = "spotline_auth_return_url";

/** OAuth 로그인 시작 (Instagram via Facebook / Kakao) */
export async function startOAuthLogin(
  provider: "instagram" | "kakao",
  returnUrl?: string
): Promise<void> {
  sessionStorage.setItem(RETURN_URL_KEY, returnUrl || window.location.href);
  const supabase = createSupabaseBrowserClient();

  // [BACKEND_REQUIRED] Supabase 미설정 시 로그인 불가
  if (!supabase) {
    throw new Error("Supabase가 설정되지 않아 로그인을 사용할 수 없습니다.");
  }

  // Instagram은 Supabase에서 Facebook provider를 통해 처리
  const supabaseProvider = provider === "instagram" ? "facebook" : provider;

  if (provider === "kakao") {
    // Supabase GoTrue가 account_email 스코프를 기본 추가하므로,
    // URL을 직접 받아서 account_email 스코프를 제거 후 리다이렉트
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) throw error || new Error("카카오 로그인 URL 생성 실패");

    const url = new URL(data.url);
    const scopes = url.searchParams.get("scopes") || "";
    const filteredScopes = scopes
      .split(" ")
      .filter((s) => s && s !== "account_email")
      .join(" ");
    if (filteredScopes) {
      url.searchParams.set("scopes", filteredScopes);
    } else {
      url.searchParams.delete("scopes");
    }

    window.location.href = url.toString();
    return;
  }

  await supabase.auth.signInWithOAuth({
    provider: supabaseProvider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      ...(provider === "instagram" && {
        scopes: "instagram_basic",
      }),
    },
  });
}

/** 로그인 후 돌아갈 URL 가져오기 (1회성) */
export function getAndClearReturnUrl(): string {
  const url = sessionStorage.getItem(RETURN_URL_KEY) || "/";
  sessionStorage.removeItem(RETURN_URL_KEY);
  return url;
}
