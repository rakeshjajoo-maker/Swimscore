import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteSet, finishSession } from "@/app/actions";
import { AddSetForm } from "@/components/AddSetForm";
import { formatDate, formatMeters, formatSetLine } from "@/lib/format";

export default async function SessionSetsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { sets: { orderBy: { createdAt: "asc" } } },
  });

  if (!session) notFound();

  return (
    <div className="space-y-5">
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

      <AddSetForm sessionId={session.id} />

      {session.sets.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-pool-800 mb-2">
            Sets in this session ({session.sets.length})
          </h2>
          <ul className="space-y-2">
            {session.sets.map((set) => (
              <li
                key={set.id}
                className="bg-card rounded-lg border border-pool-100 p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-pool-900 text-sm truncate">
                    {formatSetLine(set)}
                  </p>
                  <p className="text-xs text-pool-500">
                    {set.setType}
                    {set.rpe ? ` · RPE ${set.rpe}` : ""}
                    {set.notes ? ` · ${set.notes}` : ""}
                  </p>
                </div>
                <form action={deleteSet}>
                  <input type="hidden" name="id" value={set.id} />
                  <input type="hidden" name="sessionId" value={session.id} />
                  <button
                    type="submit"
                    aria-label="Delete set"
                    className="shrink-0 text-pool-400 hover:text-coral-600 font-bold px-2 py-1"
                  >
                    ✕
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form
        action={finishSession}
        className="bg-card rounded-xl border border-pool-100 shadow-sm p-4 space-y-3"
      >
        <input type="hidden" name="sessionId" value={session.id} />
        <div>
          <label htmlFor="postMood" className="block text-sm font-medium text-pool-800 mb-1">
            Post-session mood <span className="text-pool-400">(optional)</span>
          </label>
          <select
            id="postMood"
            name="postMood"
            defaultValue=""
            className="w-full rounded-lg border border-pool-200 px-3 py-2 bg-white"
          >
            <option value="">Not set</option>
            <option value="1">1 — Drained</option>
            <option value="2">2 — Tired</option>
            <option value="3">3 — Okay</option>
            <option value="4">4 — Good</option>
            <option value="5">5 — Great</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-coral-500 hover:bg-coral-600 text-white font-semibold py-2.5 transition-colors"
        >
          Finish session
        </button>
      </form>
    </div>
  );
}
