"use client";

import OptimizedImage from "@/components/common/OptimizedImage";
import type { BlogDetailResponse } from "@/types";

interface BlogHeroProps {
  blog: BlogDetailResponse;
}

export default function BlogHero({ blog }: BlogHeroProps) {
  return (
    <div className="space-y-4">
      {blog.coverImageUrl && (
        <div className="aspect-[2/1] w-full overflow-hidden rounded-xl">
          <OptimizedImage
            src={blog.coverImageUrl}
            alt={blog.title}
            width={800}
            height={400}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="px-4">
        <h1 className="text-2xl font-bold text-gray-900">{blog.title}</h1>
        {blog.summary && (
          <p className="mt-2 text-sm text-gray-500">{blog.summary}</p>
        )}

        <div className="mt-3 flex items-center gap-3">
          {blog.userAvatarUrl && (
            <OptimizedImage
              src={blog.userAvatarUrl}
              alt={blog.userName}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">{blog.userName}</p>
            {blog.publishedAt && (
              <p className="text-xs text-gray-400">
                {new Date(blog.publishedAt).toLocaleDateString("ko-KR")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
