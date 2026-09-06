"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/analytics", label: "Volume" },
  { href: "/analytics/performance", label: "Performance" },
  { href: "/analytics/effort", label: "Effort & Mood" },
  { href: "/analytics/score", label: "SwimScore" },
];

export function AnalyticsTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 overflow-x-auto -mx-4 px-4 pb-1 mb-4 border-b border-pool-100">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 px-3 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
              active
                ? "text-coral-600 border-coral-500"
                : "text-pool-600 border-transparent hover:text-pool-800"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
