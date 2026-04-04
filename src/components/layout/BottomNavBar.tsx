"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, LayoutGrid, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Compass, label: "발견", href: "/", match: (p: string) => p === "/" },
  { icon: LayoutGrid, label: "피드", href: "/feed", match: (p: string) => p.startsWith("/feed") },
  { icon: Bookmark, label: "저장", href: "/saves", match: (p: string) => p.startsWith("/saves") },
  { icon: User, label: "마이", href: "/profile/me", match: (p: string) => p.startsWith("/profile") },
] as const;

const HIDDEN_PREFIXES = ["/spot/", "/spotline/", "/qr/"];

export default function BottomNavBar() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-1 text-xs transition-colors",
                active ? "text-blue-600" : "text-gray-400"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
