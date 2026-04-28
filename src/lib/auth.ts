import { createSupabaseBrowserClient } from "@/lib/supabase";

const RETURN_URL_KEY = "spotline_auth_return_url";

/** OAuth 로그인 시작 (Instagram via Facebook / Kakao) */
export async function startOAuthLogin(
  provider: "instagram" | "kakao",
  returnUrl?: string
): Promise<void> {
  sessionStorage.setItem(RETURN_URL_KEY, returnUrl || window.location.href);
  const supabase = createSupabaseBrowserClient();

  // Instagram은 Supabase에서 Facebook provider를 통해 처리
  const supabaseProvider = provider === "instagram" ? "facebook" : provider;

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
