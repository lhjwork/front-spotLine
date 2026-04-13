"use client";

import { Suspense } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AuthGuard from "@/components/common/AuthGuard";
import SpotCreateForm from "@/components/spot/SpotCreateForm";

function CreateSpotContent() {
  return (
    <AuthGuard>
      <div className="flex h-dvh flex-col bg-white">
        <header className="flex h-14 shrink-0 items-center border-b border-gray-200 px-4">
          <Link href="/" className="mr-3 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-semibold text-gray-900">Spot 등록</h1>
        </header>

        <SpotCreateForm />
      </div>
    </AuthGuard>
  );
}

export default function CreateSpotPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <CreateSpotContent />
    </Suspense>
  );
}
