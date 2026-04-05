"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export default function FloatingCreateButton() {
  return (
    <Link
      href="/create-spotline"
      className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-purple-700 active:scale-95 md:right-[calc(50%-256px+16px)]"
      aria-label="나만의 SpotLine 만들기"
    >
      <Plus className="h-6 w-6" />
    </Link>
  );
}
