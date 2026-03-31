import type { CityInfo } from "@/types";

interface CityHeroProps {
  city: CityInfo;
}

export default function CityHero({ city }: CityHeroProps) {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white px-4 pt-8 pb-4">
      <h1 className="text-2xl font-bold text-gray-900">{city.name} 탐색</h1>
      <p className="mt-1 text-sm text-gray-500">{city.description}</p>
    </section>
  );
}
