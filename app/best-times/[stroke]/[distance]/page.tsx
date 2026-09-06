import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSwimmerId } from "@/lib/currentSwimmer";
import { formatDate, formatRaceTime } from "@/lib/format";
import { BestTimeChart } from "@/components/BestTimeChart";

export default async function BestTimeDetailPage({
  params,
}: {
  params: Promise<{ stroke: string; distance: string }>;
}) {
  const { stroke, distance } = await params;
  const swimmerId = await getCurrentSwimmerId();
  if (!swimmerId) {
    redirect("/swimmers/new");
  }

  const distanceNum = Number(distance);

  const times = await prisma.bestTime.findMany({
    where: { swimmerId, stroke, distance: distanceNum },
    orderBy: { date: "asc" },
  });

  if (times.length === 0) notFound();

  const best = times.reduce((min, t) => (t.timeSeconds < min.timeSeconds ? t : min));

  return (
    <div className="space-y-5">
      <Link href="/best-times" className="text-sm text-pool-600 font-medium">
        ← Back
      </Link>

      <div className="bg-pool-600 text-white rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-pool-100 text-xs uppercase tracking-wide font-semibold">
            {distanceNum}m {stroke}
          </p>
          <p className="text-2xl font-bold">{formatRaceTime(best.timeSeconds)}</p>
        </div>
        <div className="text-right text-sm text-pool-100">PB set {formatDate(best.date)}</div>
      </div>

      <BestTimeChart
        data={times.map((t) => ({
          date: t.date.toISOString(),
          timeSeconds: t.timeSeconds,
          isPB: t.isPB,
          context: t.context,
        }))}
      />

      <div>
        <h2 className="text-sm font-semibold text-pool-800 mb-2">History ({times.length})</h2>
        <ul className="space-y-2">
          {[...times].reverse().map((t) => (
            <li
              key={t.id}
              className="bg-card rounded-lg border border-pool-100 p-3 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-pool-900 text-sm">
                  {formatRaceTime(t.timeSeconds)}
                </p>
                <p className="text-xs text-pool-500">
                  {formatDate(t.date)} · {t.context}
                </p>
              </div>
              {t.isPB && (
                <span className="text-xs font-semibold text-coral-600 bg-coral-50 px-2 py-1 rounded-full">
                  PB
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
