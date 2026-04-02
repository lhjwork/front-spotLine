import { createSupabaseBrowserClient } from "@/lib/supabase";

const RETURN_URL_KEY = "spotline_auth_return_url";

/** OAuth 로그인 시작 (Google/Kakao) */
export async function startOAuthLogin(
  provider: "google" | "kakao",
  returnUrl?: string
): Promise<void> {
  sessionStorage.setItem(RETURN_URL_KEY, returnUrl || window.location.href);
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

/** 로그인 후 돌아갈 URL 가져오기 (1회성) */
export function getAndClearReturnUrl(): string {
  const url = sessionStorage.getItem(RETURN_URL_KEY) || "/";
  sessionStorage.removeItem(RETURN_URL_KEY);
  return url;
}
