"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import AuthGuard from "@/components/common/AuthGuard";

const BlogEditor = dynamic(() => import("@/components/blog/BlogEditor"), {
  loading: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  ),
});

function BlogNewContent() {
  const searchParams = useSearchParams();
  const spotLineId = searchParams.get("spotLineId");

  if (!spotLineId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">SpotLine을 선택해주세요</p>
      </div>
    );
  }

  return <BlogEditor mode="new" spotLineId={spotLineId} />;
}

export default function BlogNewPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        }
      >
        <BlogNewContent />
      </Suspense>
    </AuthGuard>
  );
}
