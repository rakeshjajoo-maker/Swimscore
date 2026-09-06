import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSwimmerId } from "@/lib/currentSwimmer";
import { addBestTime } from "@/app/actions";
import { getCurrentBests } from "@/lib/analytics";
import { STROKES, EVENT_DISTANCES, BEST_TIME_CONTEXTS } from "@/lib/types";
import { formatDate, formatRaceTime } from "@/lib/format";

export default async function BestTimesPage({
  searchParams,
}: {
  searchParams: Promise<{ pb?: string }>;
}) {
  const swimmerId = await getCurrentSwimmerId();
  if (!swimmerId) {
    redirect("/swimmers/new");
  }

  const { pb } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);

  const cards = await getCurrentBests(swimmerId);

  return (
    <div className="space-y-6">
      {pb === "1" && (
        <div className="rounded-lg bg-coral-50 border border-coral-100 text-coral-700 font-semibold text-sm p-3 text-center">
          🎉 New personal best!
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-pool-900 mb-1">My Best Times</h1>
        <p className="text-pool-700 text-sm mb-4">
          Log a time and we&apos;ll flag it if it&apos;s a new PB.
        </p>

        <form
          action={addBestTime}
          className="bg-card rounded-xl border border-pool-100 shadow-sm p-5 space-y-4"
        >
          <input type="hidden" name="swimmerId" value={swimmerId} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="stroke" className="block text-sm font-medium text-pool-800 mb-1">
                Stroke
              </label>
              <select
                id="stroke"
                name="stroke"
                defaultValue="Free"
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
              <label htmlFor="distance" className="block text-sm font-medium text-pool-800 mb-1">
                Distance
              </label>
              <select
                id="distance"
                name="distance"
                defaultValue={100}
                className="w-full rounded-lg border border-pool-200 px-3 py-2 bg-white"
              >
                {EVENT_DISTANCES.map((d) => (
                  <option key={d} value={d}>
                    {d} m
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-pool-800 mb-1">Time</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="minute"
                min={0}
                max={59}
                placeholder="0"
                aria-label="Minutes"
                className="w-16 rounded-lg border border-pool-200 px-2 py-2 text-center"
              />
              <span className="text-pool-400 font-semibold">:</span>
              <input
                type="number"
                name="second"
                min={0}
                max={59}
                placeholder="00"
                aria-label="Seconds"
                className="w-16 rounded-lg border border-pool-200 px-2 py-2 text-center"
              />
              <span className="text-pool-400 font-semibold">.</span>
              <input
                type="number"
                name="hundredth"
                min={0}
                max={99}
                placeholder="00"
                aria-label="Hundredths"
                className="w-16 rounded-lg border border-pool-200 px-2 py-2 text-center"
              />
            </div>
            <p className="text-xs text-pool-500 mt-1">min : sec . hundredths</p>
          </div>

          <div>
            <label htmlFor="context" className="block text-sm font-medium text-pool-800 mb-1">
              Context
            </label>
            <select
              id="context"
              name="context"
              defaultValue="Practice"
              className="w-full rounded-lg border border-pool-200 px-3 py-2 bg-white"
            >
              {BEST_TIME_CONTEXTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-pool-800 mb-1">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={today}
              className="w-full rounded-lg border border-pool-200 px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-coral-500 hover:bg-coral-600 text-white font-semibold py-2.5 transition-colors"
          >
            Log time
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-pool-900 mb-3">My Bests</h2>
        {cards.length === 0 ? (
          <p className="text-sm text-pool-600">No times logged yet. Add your first one above.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {cards.map((bt) => (
              <Link
                key={`${bt.stroke}-${bt.distance}`}
                href={`/best-times/${bt.stroke}/${bt.distance}`}
                className="bg-card rounded-lg border border-pool-100 p-3 hover:border-pool-300 transition-colors"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-pool-500">
                  {bt.distance}m {bt.stroke}
                </p>
                <p className="text-2xl font-bold text-coral-600">
                  {formatRaceTime(bt.timeSeconds)}
                </p>
                <p className="text-xs text-pool-500">{formatDate(bt.date)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
