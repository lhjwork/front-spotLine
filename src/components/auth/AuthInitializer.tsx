"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthInitializer() {
  const initFromStorage = useAuthStore((s) => s.initFromStorage);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  return null;
}
