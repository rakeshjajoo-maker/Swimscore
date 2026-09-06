import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSwimmerId } from "@/lib/currentSwimmer";
import { updateSwimmerProfile } from "@/app/actions";
import { ensureWeeklySnapshot, getWeekStart } from "@/lib/scoring";
import { getCurrentBests, getTotalMetersAllTime, getLoggingStreak } from "@/lib/analytics";
import { STROKES } from "@/lib/types";
import { formatDate, formatMeters, formatRaceTime } from "@/lib/format";

export default async function ProfilePage() {
  const swimmerId = await getCurrentSwimmerId();
  if (!swimmerId) redirect("/swimmers/new");

  const swimmer = await prisma.swimmer.findUnique({ where: { id: swimmerId } });
  if (!swimmer) redirect("/swimmers/new");

  const [snapshot, bests, totalMeters, streak] = await Promise.all([
    ensureWeeklySnapshot(swimmerId, getWeekStart(new Date())),
    getCurrentBests(swimmerId),
    getTotalMetersAllTime(swimmerId),
    getLoggingStreak(swimmerId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pool-900 mb-1">Profile</h1>
        <p className="text-pool-700 text-sm">
          Everything about {swimmer.name} in one place.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="SwimScore" value={Math.round(snapshot.compositeScore)} />
        <StatCard label="Personal bests" value={bests.length} />
        <StatCard label="Meters logged" value={formatMeters(totalMeters)} />
        <StatCard
          label="Logging streak"
          value={`${streak} day${streak === 1 ? "" : "s"}`}
          accent={streak > 0}
        />
      </div>

      <section>
        <h2 className="text-sm font-semibold text-pool-800 mb-2">Details</h2>
        <form
          action={updateSwimmerProfile}
          className="bg-card rounded-xl border border-pool-100 shadow-sm p-5 space-y-4"
        >
          <input type="hidden" name="swimmerId" value={swimmer.id} />

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-pool-800 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={swimmer.name}
              className="w-full rounded-lg border border-pool-200 px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-pool-800 mb-1">
                Age
              </label>
              <input
                id="age"
                name="age"
                type="number"
                inputMode="numeric"
                min={5}
                max={99}
                required
                defaultValue={swimmer.age}
                className="w-full rounded-lg border border-pool-200 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="squad" className="block text-sm font-medium text-pool-800 mb-1">
                Squad / group
              </label>
              <input
                id="squad"
                name="squad"
                required
                defaultValue={swimmer.squad}
                className="w-full rounded-lg border border-pool-200 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="primaryStroke"
              className="block text-sm font-medium text-pool-800 mb-1"
            >
              Primary stroke
            </label>
            <select
              id="primaryStroke"
              name="primaryStroke"
              defaultValue={swimmer.primaryStroke}
              className="w-full rounded-lg border border-pool-200 px-3 py-2 bg-white"
            >
              {STROKES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="competitionCategory"
              className="block text-sm font-medium text-pool-800 mb-1"
            >
              Competition category
            </label>
            <input
              id="competitionCategory"
              name="competitionCategory"
              required
              defaultValue={swimmer.competitionCategory}
              className="w-full rounded-lg border border-pool-200 px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="seasonGoal"
              className="block text-sm font-medium text-pool-800 mb-1"
            >
              Season goal <span className="text-pool-400">(optional)</span>
            </label>
            <input
              id="seasonGoal"
              name="seasonGoal"
              defaultValue={swimmer.seasonGoal ?? ""}
              className="w-full rounded-lg border border-pool-200 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-coral-500 hover:bg-coral-600 text-white font-semibold py-2.5 transition-colors"
          >
            Save changes
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-pool-800 mb-2">Personal bests</h2>
        {bests.length === 0 ? (
          <p className="text-sm text-pool-600">
            No best times logged yet.{" "}
            <Link href="/best-times" className="text-pool-600 font-medium underline">
              Add one
            </Link>
            .
          </p>
        ) : (
          <div className="bg-card rounded-xl border border-pool-100 divide-y divide-pool-100 overflow-hidden">
            {bests.map((b) => (
              <Link
                key={`${b.stroke}-${b.distance}`}
                href={`/best-times/${b.stroke}/${b.distance}`}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-pool-50 transition-colors"
              >
                <span className="text-sm font-medium text-pool-800">
                  {b.distance}m {b.stroke}
                </span>
                <span className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-coral-600">
                    {formatRaceTime(b.timeSeconds)}
                  </span>
                  <span className="text-xs text-pool-500">{formatDate(b.date)}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="bg-card rounded-xl border border-pool-100 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-pool-500">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-coral-600" : "text-pool-900"}`}>
        {value}
      </p>
    </div>
  );
}
