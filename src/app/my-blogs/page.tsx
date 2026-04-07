"use client";

import { PenLine } from "lucide-react";
import Link from "next/link";
import AuthGuard from "@/components/common/AuthGuard";
import MyBlogsList from "@/components/blog/MyBlogsList";

export default function MyBlogsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white px-4 py-4">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <h1 className="text-lg font-bold">내 블로그</h1>
            <Link
              href="/create-spotline"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <PenLine className="h-4 w-4" />
              새 글 쓰기
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-2xl">
          <MyBlogsList />
        </div>
      </div>
    </AuthGuard>
  );
}
