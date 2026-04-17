"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import AuthGuard from "@/components/common/AuthGuard";

const SpotLineBuilder = dynamic(
  () => import("@/components/spotline-builder/SpotLineBuilder"),
  {
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    ),
  }
);

interface EditSpotLinePageProps {
  params: Promise<{ slug: string }>;
}

export default function EditSpotLinePage({ params }: EditSpotLinePageProps) {
  const { slug } = use(params);

  return (
    <AuthGuard message="로그인하고 코스를 수정해보세요">
      <div className="flex h-dvh flex-col bg-white">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center border-b border-gray-200 px-4">
          <Link
            href={`/spotline/${slug}`}
            className="mr-3 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-semibold text-gray-900">
            SpotLine 수정
          </h1>
        </header>

        {/* Builder */}
        <SpotLineBuilder mode="edit" editSlug={slug} />
      </div>
    </AuthGuard>
  );
}
