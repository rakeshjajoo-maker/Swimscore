import { AnalyticsTabs } from "@/components/AnalyticsTabs";

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-pool-900 mb-3">Analytics</h1>
      <AnalyticsTabs />
      {children}
    </div>
  );
}
