import { Heart, Plane, Footprints, Sparkles, UtensilsCrossed, Coffee, Palette } from "lucide-react";
import type { ThemeInfo } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart, Plane, Footprints, Sparkles, UtensilsCrossed, Coffee, Palette,
};

interface ThemeHeroProps {
  theme: ThemeInfo;
}

export default function ThemeHero({ theme }: ThemeHeroProps) {
  const Icon = iconMap[theme.iconName];

  return (
    <section className="px-4 pt-8 pb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${theme.colorClass}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{theme.name} 코스</h1>
          <p className="mt-0.5 text-sm text-gray-500">{theme.description}</p>
        </div>
      </div>
    </section>
  );
}
