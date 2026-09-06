import { redirect } from "next/navigation";
import { getCurrentSwimmerId } from "@/lib/currentSwimmer";
import { getScoreHistory } from "@/lib/analytics";
import { CompositeScoreLineChart } from "@/components/analytics/CompositeScoreLineChart";
import { ScoreRadarChart } from "@/components/analytics/ScoreRadarChart";

export default async function CompositeScorePage() {
  const swimmerId = await getCurrentSwimmerId();
  if (!swimmerId) redirect("/swimmers/new");

  const history = await getScoreHistory(swimmerId, 12);
  const current = history[history.length - 1];

  const radarData = current
    ? [
        { subject: "Volume", score: current.volumeScore },
        { subject: "Consistency", score: current.consistencyScore },
        { subject: "Effort", score: current.effortAlignmentScore },
        { subject: "Time trend", score: current.timeTrendScore },
        { subject: "Technique", score: current.techniqueScore },
      ]
    : [];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-pool-800 mb-2">Composite SwimScore over time</h2>
        <CompositeScoreLineChart
          data={history.map((s) => ({
            weekStart: s.weekStartDate.toISOString(),
            compositeScore: s.compositeScore,
          }))}
        />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-pool-800 mb-2">This week&apos;s breakdown</h2>
        <ScoreRadarChart data={radarData} />
      </section>
    </div>
  );
}
