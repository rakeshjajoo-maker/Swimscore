import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentSwimmerId } from "@/lib/currentSwimmer";
import { formatDate, formatMeters, formatSetLine } from "@/lib/format";
import { ensureWeeklySnapshot, getWeekStart } from "@/lib/scoring";
import { SwimScoreCard } from "@/components/SwimScoreCard";

export default async function HomePage() {
  const swimmers = await prisma.swimmer.findMany({ orderBy: { createdAt: "asc" } });

  if (swimmers.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-pool-700 mb-4">No swimmers yet.</p>
        <Link
          href="/swimmers/new"
          className="inline-block rounded-lg bg-coral-500 hover:bg-coral-600 text-white font-semibold px-5 py-2.5 transition-colors"
        >
          Create a swimmer profile
        </Link>
      </div>
    );
  }

  const currentId = (await getCurrentSwimmerId()) ?? swimmers[0].id;
  const swimmer = swimmers.find((s) => s.id === currentId) ?? swimmers[0];

  const [sessions, snapshot] = await Promise.all([
    prisma.session.findMany({
      where: { swimmerId: swimmer.id },
      orderBy: { date: "desc" },
      include: { sets: true },
      take: 30,
    }),
    ensureWeeklySnapshot(swimmer.id, getWeekStart(new Date())),
  ]);

  return (
    <div className="space-y-6">
      <section className="bg-pool-600 text-white rounded-xl p-5">
        <p className="text-pool-100 text-sm">Welcome back,</p>
        <h1 className="text-2xl font-bold mb-4">{swimmer.name}</h1>
        <Link
          href="/log"
          className="inline-block rounded-lg bg-coral-500 hover:bg-coral-600 text-white font-semibold px-5 py-2.5 transition-colors"
        >
          + Log a session
        </Link>
      </section>

      <SwimScoreCard
        swimmerId={swimmer.id}
        breakdown={snapshot}
        techniqueScore={swimmer.techniqueScore}
      />

      <section>
        <h2 className="text-lg font-semibold text-pool-900 mb-3">Session history</h2>
        {sessions.length === 0 ? (
          <p className="text-pool-600 text-sm">
            No sessions logged yet. Add your first one above.
          </p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((session) => (
              <li key={session.id}>
                <Link
                  href={`/sessions/${session.id}`}
                  className="block bg-card rounded-lg border border-pool-100 p-3 hover:border-pool-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-pool-900 text-sm">
                      {formatDate(session.date)}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-pool-500">
                      {session.sessionType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-sm text-pool-700 truncate flex-1">
                      {session.sets.length > 0
                        ? session.sets.map((s) => formatSetLine(s)).join(", ")
                        : session.attended
                          ? "No sets logged"
                          : `Skipped${session.skipReason ? `: ${session.skipReason}` : ""}`}
                    </p>
                    <span className="text-sm font-semibold text-coral-600 shrink-0">
                      {formatMeters(session.totalMeters)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
