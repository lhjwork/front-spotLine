import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import SavesList from "@/components/social/SavesList";

export const metadata: Metadata = {
  title: "내 저장 | Spotline",
  description: "저장한 Spot과 Route를 확인하세요",
};

export default function SavesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center border-b border-gray-200 bg-white px-4 py-3">
        <Link href="/feed" className="mr-3 rounded-full p-1 hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">내 저장</h1>
      </header>

      <SavesList />
    </main>
  );
}
