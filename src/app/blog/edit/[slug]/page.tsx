"use client";

import { use } from "react";
import BlogEditor from "@/components/blog/BlogEditor";
import AuthGuard from "@/components/common/AuthGuard";

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
