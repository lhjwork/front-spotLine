"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
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

function CreateSpotLineContent() {
  const searchParams = useSearchParams();
  const forkSlug = searchParams.get("fork");
  const spotSlug = searchParams.get("spot");

  const mode = forkSlug ? "fork" : "create";

  return (
    <AuthGuard>
      <div className="flex h-dvh flex-col bg-white">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center border-b border-gray-200 px-4">
          <Link href="/" className="mr-3 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-semibold text-gray-900">
            {forkSlug ? "내 버전 만들기" : "나만의 SpotLine 만들기"}
          </h1>
        </header>

        {/* Builder */}
        <SpotLineBuilder
          mode={mode}
          forkSlug={forkSlug || undefined}
          spotSlug={spotSlug || undefined}
        />
      </div>
    </AuthGuard>
  );
}

export default function CreateSpotLinePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <CreateSpotLineContent />
    </Suspense>
  );
}
