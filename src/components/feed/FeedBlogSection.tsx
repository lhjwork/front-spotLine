import Link from "next/link";
import BlogCard from "@/components/blog/BlogCard";
import type { BlogListItem } from "@/types";

interface FeedBlogSectionProps {
  blogs: BlogListItem[];
}

export default function FeedBlogSection({ blogs }: FeedBlogSectionProps) {
  if (blogs.length === 0) return null;

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">인기 블로그</h2>
        <Link
          href="/blogs"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          더보기
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </section>
  );
}
