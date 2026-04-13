"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Plus, MapPin, Route } from "lucide-react";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  { href: "/create-spot", icon: MapPin, label: "Spot 등록" },
  { href: "/create-spotline", icon: Route, label: "SpotLine 만들기" },
];

export default function FloatingCreateButton() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="fixed bottom-20 right-4 z-30 md:right-[calc(50%-256px+16px)]">
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 w-48 rounded-xl bg-white py-2 shadow-lg ring-1 ring-gray-200">
          {MENU_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Icon className="h-4 w-4 text-gray-500" />
              {label}
            </Link>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-all hover:scale-105 hover:bg-purple-700 active:scale-95",
          isOpen && "rotate-45"
        )}
        aria-label="새로 만들기"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
