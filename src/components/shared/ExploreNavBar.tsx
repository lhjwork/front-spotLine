"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CITIES } from "@/constants/cities";
import { THEMES } from "@/constants/themes";

interface ExploreNavBarProps {
  activeTab?: "discover" | "feed";
}

const TABS = [
  { key: "discover" as const, label: "발견", href: "/" },
  { key: "feed" as const, label: "피드", href: "/feed" },
];

export default function ExploreNavBar({ activeTab }: ExploreNavBarProps) {
  const pathname = usePathname();
  const current = activeTab ?? (pathname === "/feed" ? "feed" : "discover");

  return (
    <nav className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-3 pb-2">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              current === tab.key
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
        {CITIES.slice(0, 4).map((city) => (
          <Link
            key={city.slug}
            href={`/city/${city.slug}`}
            className="shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
          >
            {city.name}
          </Link>
        ))}
        {THEMES.slice(0, 4).map((theme) => (
          <Link
            key={theme.slug}
            href={`/theme/${theme.slug}`}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium hover:opacity-80",
              theme.colorClass
            )}
          >
            {theme.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
