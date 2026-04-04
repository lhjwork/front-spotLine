import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Layout from "@/components/layout/Layout";
import Breadcrumb from "@/components/seo/Breadcrumb";
import ThemeHero from "@/components/theme/ThemeHero";
import ThemeSpotLines from "@/components/theme/ThemeSpotLines";
import ThemeNavigation from "@/components/theme/ThemeNavigation";
import { THEMES, findThemeBySlug } from "@/constants/themes";
import { fetchFeedSpotLines } from "@/lib/api";

export const revalidate = 3600;

interface ThemePageProps {
  params: Promise<{ name: string }>;
}

export async function generateStaticParams() {
  return THEMES.map((t) => ({ name: t.slug }));
}

export async function generateMetadata({ params }: ThemePageProps): Promise<Metadata> {
  const { name } = await params;
  const theme = findThemeBySlug(name);
  if (!theme) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spotline.kr";

  return {
    title: `${theme.name} 추천 코스 | Spotline`,
    description: theme.description,
    alternates: {
      canonical: `${siteUrl}/theme/${name}`,
    },
    openGraph: {
      title: `${theme.name} 코스 | Spotline`,
      description: theme.description,
    },
  };
}

export default async function ThemePage({ params }: ThemePageProps) {
  const { name } = await params;
  const theme = findThemeBySlug(name);
  if (!theme) notFound();

  const emptyPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0, last: true, first: true };
  const spotLinesResult = await fetchFeedSpotLines(undefined, theme.theme, 0, 10)
    .catch(() => emptyPage as Awaited<ReturnType<typeof fetchFeedSpotLines>>);

  return (
    <Layout showFooter>
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={[{ name: theme.name }]} />
        <ThemeHero theme={theme} />
        <ThemeSpotLines spotLines={spotLinesResult.content} />
        <ThemeNavigation currentSlug={theme.slug} />
      </div>
    </Layout>
  );
}
