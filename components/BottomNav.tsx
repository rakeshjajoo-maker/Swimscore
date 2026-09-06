"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/best-times", label: "Best Times", icon: "⏱️" },
  { href: "/analytics", label: "Analytics", icon: "📊" },
  { href: "/meets", label: "Meets", icon: "🏆" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-10 bg-white border-t border-pool-100 flex justify-around pb-[env(safe-area-inset-bottom)]">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-2 text-xs font-medium ${
              active ? "text-coral-600" : "text-pool-600"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
