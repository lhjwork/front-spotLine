"use client";

import { Suspense } from "react";
import Layout from "@/components/layout/Layout";
import FeedPage from "@/components/feed/FeedPage";
import FeedSkeleton from "@/components/feed/FeedSkeleton";

export default function Feed() {
  return (
    <Layout showFooter>
      <div className="max-w-4xl mx-auto">
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-xl font-bold text-gray-900">피드</h1>
          <p className="text-sm text-gray-500">인기 Spot과 Route를 탐색하세요</p>
        </div>
        <Suspense fallback={<FeedSkeleton />}>
          <FeedPage />
        </Suspense>
      </div>
    </Layout>
  );
}
