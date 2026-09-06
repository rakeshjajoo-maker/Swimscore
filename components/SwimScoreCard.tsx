import { updateTechniqueScore } from "@/app/actions";
import type { WeeklyScoreBreakdown } from "@/lib/scoring";

const SUB_SCORES: { key: keyof WeeklyScoreBreakdown; label: string }[] = [
  { key: "volumeScore", label: "Volume" },
  { key: "consistencyScore", label: "Consistency" },
  { key: "effortAlignmentScore", label: "Effort" },
  { key: "timeTrendScore", label: "Time trend" },
  { key: "techniqueScore", label: "Technique" },
];

export function SwimScoreCard({
  swimmerId,
  breakdown,
  techniqueScore,
}: {
  swimmerId: string;
  breakdown: WeeklyScoreBreakdown;
  techniqueScore: number | null;
}) {
  return (
    <section className="bg-card rounded-xl border border-pool-100 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-pool-500">
            This week&apos;s SwimScore
          </p>
          <p className="text-5xl font-bold text-coral-600 leading-tight">
            {Math.round(breakdown.compositeScore)}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-5 gap-2 mt-4">
        {SUB_SCORES.map(({ key, label }) => (
          <div key={key} className="text-center">
            <dt className="text-[10px] uppercase tracking-wide text-pool-500 truncate">
              {label}
            </dt>
            <dd className="text-lg font-semibold text-pool-800">
              {Math.round(breakdown[key] as number)}
            </dd>
          </div>
        ))}
      </dl>

      <form
        action={updateTechniqueScore}
        className="flex items-center gap-2 mt-4 pt-4 border-t border-pool-100"
      >
        <input type="hidden" name="swimmerId" value={swimmerId} />
        <label htmlFor="techniqueScore" className="text-xs text-pool-600 flex-1">
          Technique score (self/coach rated, 1-100)
        </label>
        <input
          id="techniqueScore"
          name="techniqueScore"
          type="number"
          min={1}
          max={100}
          defaultValue={techniqueScore ?? undefined}
          placeholder="50"
          className="w-16 rounded-lg border border-pool-200 px-2 py-1 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-pool-600 hover:bg-pool-700 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
        >
          Update
        </button>
      </form>
    </section>
  );
}
