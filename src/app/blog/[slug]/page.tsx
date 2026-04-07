import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogBySlug } from "@/lib/api";
import JsonLd from "@/components/seo/JsonLd";
import { generateBlogJsonLd } from "@/lib/seo/blogJsonld";
import BlogHero from "@/components/blog/BlogHero";
import BlogSpotLineOverview from "@/components/blog/BlogSpotLineOverview";
import BlogSpotBlock from "@/components/blog/BlogSpotBlock";
import BlogTransitionBlock from "@/components/blog/BlogTransitionBlock";
import CommentSection from "@/components/comment/CommentSection";
import ViewTracker from "@/components/common/ViewTracker";
import SocialHydrator from "@/components/social/SocialHydrator";
import BlogSocialBar from "@/components/blog/BlogSocialBar";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return { title: "블로그를 찾을 수 없습니다" };
  }

  const description = blog.summary || `${blog.title} - ${blog.userName}의 SpotLine 블로그`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.kr";

  return {
    title: `${blog.title} | Spotline 블로그`,
    description,
    alternates: {
      canonical: `${siteUrl}/blog/${slug}`,
    },
    openGraph: {
      title: `${blog.title} | Spotline`,
      description,
      type: "article",
      ...(blog.coverImageUrl ? { images: [blog.coverImageUrl] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description,
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || blog.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white pb-20">
      <JsonLd data={generateBlogJsonLd(blog)} />
      <ViewTracker type="blog" id={blog.id} />
      <SocialHydrator
        type="blog"
        id={blog.id}
        likesCount={blog.likesCount}
        savesCount={blog.savesCount}
      />

      <div className="mx-auto max-w-2xl">
        {/* Hero */}
        <BlogHero blog={blog} />

        {/* Social actions */}
        <BlogSocialBar blogId={blog.id} />

        {/* SpotLine overview */}
        <div className="mt-6 px-4">
          <BlogSpotLineOverview spotLine={blog.spotLine} />
        </div>

        {/* Blog blocks */}
        <div className="mt-6 space-y-6 px-4">
          {blog.blocks.map((block) => {
            if (block.blockType === "TRANSITION") {
              return (
                <BlogTransitionBlock
                  key={block.id}
                  content={block.content}
                />
              );
            }

            return (
              <BlogSpotBlock key={block.id} block={block} />
            );
          })}
        </div>

        {/* Comments */}
        <div className="mt-8 px-4">
          <CommentSection targetType="BLOG" targetId={blog.id} commentsCount={blog.commentsCount ?? 0} />
        </div>
      </div>
    </main>
  );
}
