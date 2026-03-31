import Link from "next/link";
import { CITIES } from "@/constants/cities";

interface CityNavigationProps {
  currentSlug: string;
}

export default function CityNavigation({ currentSlug }: CityNavigationProps) {
  const otherCities = CITIES.filter((c) => c.slug !== currentSlug);

  return (
    <section className="px-4 py-6">
      <h2 className="mb-3 text-lg font-bold text-gray-900">다른 도시 탐색</h2>
      <div className="flex flex-wrap gap-2">
        {otherCities.map((city) => (
          <Link
            key={city.slug}
            href={`/city/${city.slug}`}
            className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            {city.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
