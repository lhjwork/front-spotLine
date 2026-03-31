import Link from "next/link";
import { THEMES } from "@/constants/themes";

interface ThemeNavigationProps {
  currentSlug: string;
}

export default function ThemeNavigation({ currentSlug }: ThemeNavigationProps) {
  const otherThemes = THEMES.filter((t) => t.slug !== currentSlug);

  return (
    <section className="px-4 py-6">
      <h2 className="mb-3 text-lg font-bold text-gray-900">다른 테마</h2>
      <div className="flex flex-wrap gap-2">
        {otherThemes.map((theme) => (
          <Link
            key={theme.slug}
            href={`/theme/${theme.slug}`}
            className={`rounded-full px-4 py-2 text-sm font-medium ${theme.colorClass} hover:opacity-80`}
          >
            {theme.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
