"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { BlogListItem } from "@/types";

interface BlogCardProps {
  blog: BlogListItem;
  showStatus?: boolean;
}

export default function BlogCard({ blog, showStatus }: BlogCardProps) {
  const href =
    blog.status === "DRAFT"
      ? `/blog/edit/${blog.slug}`
      : `/blog/${blog.slug}`;

  return (
    <Link href={href} className="block">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md">
        {blog.coverImageUrl ? (
          <div className="aspect-[2/1] w-full overflow-hidden">
            <OptimizedImage
              src={blog.coverImageUrl}
              alt={blog.title}
              width={400}
              height={200}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[2/1] w-full items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <span className="text-3xl">📝</span>
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-bold text-gray-900">
              {blog.title}
            </h3>
            {showStatus && (
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  blog.status === "PUBLISHED"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {blog.status === "PUBLISHED" ? "발행됨" : "초안"}
              </span>
            )}
          </div>

          {blog.summary && (
            <p className="mt-1 line-clamp-2 text-xs text-gray-500">
              {blog.summary}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <span>{blog.spotLineTitle}</span>
            <span>·</span>
            <span>{blog.spotLineArea}</span>
            <span>·</span>
            <span>{blog.spotCount}곳</span>
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
            <span>❤️ {blog.likesCount}</span>
            <span>👀 {blog.viewsCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
