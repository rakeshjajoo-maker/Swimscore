import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatMeters, formatSetLine } from "@/lib/format";

const MOOD_LABELS: Record<number, string> = {
  1: "Drained",
  2: "Tired",
  3: "Okay",
  4: "Good",
  5: "Great",
};

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await prisma.session.findUnique({
    where: { id },
    include: { sets: { orderBy: { createdAt: "asc" } } },
  });

  if (!session) notFound();

  return (
    <div className="space-y-5">
      <Link href="/" className="text-sm text-pool-600 font-medium">
        ← Back
      </Link>

      <div className="bg-pool-600 text-white rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-pool-100 text-xs uppercase tracking-wide font-semibold">
            {session.sessionType}
          </p>
          <p className="font-semibold">{formatDate(session.date)}</p>
        </div>
        <div className="text-right">
          <p className="text-pool-100 text-xs uppercase tracking-wide font-semibold">
            Total
          </p>
          <p className="text-2xl font-bold">{formatMeters(session.totalMeters)}</p>
        </div>
      </div>

      {!session.attended && (
        <div className="rounded-lg bg-coral-50 border border-coral-100 text-coral-700 text-sm p-3">
          Skipped{session.skipReason ? `: ${session.skipReason}` : ""}
        </div>
      )}

      {(session.preMood || session.postMood) && (
        <div className="flex gap-4 text-sm text-pool-700">
          {session.preMood && (
            <p>
              Pre-mood: <span className="font-semibold">{MOOD_LABELS[session.preMood]}</span>
            </p>
          )}
          {session.postMood && (
            <p>
              Post-mood: <span className="font-semibold">{MOOD_LABELS[session.postMood]}</span>
            </p>
          )}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-pool-800 mb-2">
          Sets ({session.sets.length})
        </h2>
        {session.sets.length === 0 ? (
          <p className="text-sm text-pool-600">No sets were logged for this session.</p>
        ) : (
          <ul className="space-y-2">
            {session.sets.map((set) => (
              <li key={set.id} className="bg-card rounded-lg border border-pool-100 p-3">
                <p className="font-medium text-pool-900 text-sm">{formatSetLine(set)}</p>
                <p className="text-xs text-pool-500">
                  {set.setType}
                  {set.rpe ? ` · RPE ${set.rpe}` : ""}
                  {set.notes ? ` · ${set.notes}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
