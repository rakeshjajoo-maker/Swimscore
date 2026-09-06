import { redirect } from "next/navigation";
import { getCurrentSwimmerId } from "@/lib/currentSwimmer";
import { getRpeDistribution, getMoodTrend } from "@/lib/analytics";
import { RpeBandChart } from "@/components/analytics/RpeBandChart";
import { MoodTrendChart } from "@/components/analytics/MoodTrendChart";

export default async function EffortMoodPage() {
  const swimmerId = await getCurrentSwimmerId();
  if (!swimmerId) redirect("/swimmers/new");

  const [rpeDistribution, moodTrend] = await Promise.all([
    getRpeDistribution(swimmerId),
    getMoodTrend(swimmerId, 12),
  ]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-pool-800 mb-2">
          RPE by set type vs. expected effort
        </h2>
        <RpeBandChart data={rpeDistribution} />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-pool-800 mb-2">Mood trend</h2>
        <MoodTrendChart
          data={moodTrend.map((p) => ({
            weekStart: p.weekStart.toISOString(),
            avgPreMood: p.avgPreMood,
            avgPostMood: p.avgPostMood,
          }))}
        />
      </section>
    </div>
  );
}
