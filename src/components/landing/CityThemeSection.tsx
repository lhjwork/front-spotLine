import Link from "next/link";
import { CITIES } from "@/constants/cities";
import { THEMES } from "@/constants/themes";
import { cn } from "@/lib/utils";

export default function CityThemeSection() {
  return (
    <section className="bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-xl font-bold text-gray-900">어디로 떠나볼까요?</h2>

        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-500">도시</h3>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/feed?area=${city.slug}`}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-blue-50 hover:text-blue-600"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-500">테마</h3>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((theme) => (
              <Link
                key={theme.slug}
                href={`/feed?theme=${theme.slug}`}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80",
                  theme.colorClass
                )}
              >
                {theme.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
