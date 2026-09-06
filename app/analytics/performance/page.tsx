import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSwimmerId } from "@/lib/currentSwimmer";
import { getBestTimeGroups, getTimeDropRates } from "@/lib/analytics";
import { BestTimeChart } from "@/components/BestTimeChart";
import { formatRaceTime } from "@/lib/format";

export default async function PerformanceTrendsPage() {
  const swimmerId = await getCurrentSwimmerId();
  if (!swimmerId) redirect("/swimmers/new");

  const [groups, dropRates] = await Promise.all([
    getBestTimeGroups(swimmerId),
    getTimeDropRates(swimmerId),
  ]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-pool-800 mb-2">
          Time-drop rate (avg. seconds improved per month)
        </h2>
        {dropRates.length === 0 ? (
          <p className="text-sm text-pool-600">
            Log best times for at least two dates in the same event to see a trend.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2">
            {dropRates.map((r) => (
              <li key={r.stroke} className="bg-card rounded-lg border border-pool-100 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-pool-500">
                  {r.stroke}
                </p>
                <p
                  className={`text-lg font-bold ${
                    r.secondsPerMonth == null
                      ? "text-pool-400"
                      : r.secondsPerMonth > 0
                        ? "text-coral-600"
                        : "text-pool-800"
                  }`}
                >
                  {r.secondsPerMonth == null
                    ? "Not enough data"
                    : `${r.secondsPerMonth > 0 ? "-" : "+"}${Math.abs(r.secondsPerMonth).toFixed(2)}s/mo`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-pool-800 mb-2">Per-event trends</h2>
        {groups.length === 0 ? (
          <p className="text-sm text-pool-600">No best times logged yet.</p>
        ) : (
          <div className="space-y-4">
            {groups.map((g) => {
              const best = g.times.reduce((min, t) => (t.timeSeconds < min.timeSeconds ? t : min));
              return (
                <div key={`${g.stroke}-${g.distance}`}>
                  <Link
                    href={`/best-times/${g.stroke}/${g.distance}`}
                    className="flex items-baseline justify-between mb-1"
                  >
                    <span className="text-sm font-semibold text-pool-900">
                      {g.distance}m {g.stroke}
                    </span>
                    <span className="text-sm font-bold text-coral-600">
                      {formatRaceTime(best.timeSeconds)}
                    </span>
                  </Link>
                  <BestTimeChart
                    data={g.times.map((t) => ({
                      date: t.date.toISOString(),
                      timeSeconds: t.timeSeconds,
                      isPB: t.isPB,
                      context: t.context,
                    }))}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
