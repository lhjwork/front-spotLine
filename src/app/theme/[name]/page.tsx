import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Layout from "@/components/layout/Layout";
import ThemeHero from "@/components/theme/ThemeHero";
import ThemeRoutes from "@/components/theme/ThemeRoutes";
import ThemeNavigation from "@/components/theme/ThemeNavigation";
import { THEMES, findThemeBySlug } from "@/constants/themes";
import { fetchFeedRoutes } from "@/lib/api";

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

  return {
    title: `${theme.name} 추천 코스 | Spotline`,
    description: theme.description,
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
  const routesResult = await fetchFeedRoutes(undefined, theme.theme, 0, 10)
    .catch(() => emptyPage as Awaited<ReturnType<typeof fetchFeedRoutes>>);

  return (
    <Layout showFooter>
      <div className="max-w-4xl mx-auto">
        <ThemeHero theme={theme} />
        <ThemeRoutes routes={routesResult.content} />
        <ThemeNavigation currentSlug={theme.slug} />
      </div>
    </Layout>
  );
}
