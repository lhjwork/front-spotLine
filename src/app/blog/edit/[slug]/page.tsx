"use client";

import { use } from "react";
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

interface BlogEditPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogEditPage({ params }: BlogEditPageProps) {
  const { slug } = use(params);

  return (
    <AuthGuard>
      <BlogEditor mode="edit" editSlug={slug} />
    </AuthGuard>
  );
}
