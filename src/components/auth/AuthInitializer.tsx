"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function AuthInitializer() {
  const initFromSupabase = useAuthStore((s) => s.initFromSupabase);
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    initFromSupabase();

    const supabase = createSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [initFromSupabase, setSession]);

  return null;
}
