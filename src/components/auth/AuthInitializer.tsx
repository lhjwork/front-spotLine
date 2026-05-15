"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function AuthInitializer() {
  const initFromSupabase = useAuthStore((s) => s.initFromSupabase);
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    try {
      initFromSupabase();

      const supabase = createSupabaseBrowserClient();
      // [BACKEND_REQUIRED] Supabase 미설정 시 구독 스킵
      if (!supabase) return;
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    } catch (err) {
      console.warn("Auth 초기화 실패:", err);
    }
  }, [initFromSupabase, setSession]);

  return null;
}
