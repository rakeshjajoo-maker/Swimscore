import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSwimmerId } from "@/lib/currentSwimmer";
import { deleteMeetEvent, recordMeetResult } from "@/app/actions";
import type { MeetEvent } from "@/lib/types";
import { formatDate, formatRaceTime, secondsToParts } from "@/lib/format";
import { SplitsChart } from "@/components/meets/SplitsChart";
import { AddEventForm } from "@/components/meets/AddEventForm";

export default async function MeetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const swimmerId = await getCurrentSwimmerId();
  if (!swimmerId) redirect("/swimmers/new");

  const meet = await prisma.meet.findUnique({ where: { id } });
  if (!meet || meet.swimmerId !== swimmerId) notFound();

  const events = (meet.events as unknown as MeetEvent[]) ?? [];

  return (
    <div className="space-y-6">
      <Link href="/meets" className="text-sm text-pool-600 font-medium">
        ← Back
      </Link>

      <div className="bg-pool-600 text-white rounded-xl p-4">
        <p className="text-pool-100 text-xs uppercase tracking-wide font-semibold">
          {formatDate(meet.date)}
        </p>
        <p className="text-xl font-bold">{meet.name}</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-pool-800 mb-2">Add event</h2>
        <AddEventForm meetId={meet.id} />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-pool-800 mb-2">
          Events ({events.length})
        </h2>
        {events.length === 0 ? (
          <p className="text-sm text-pool-600">No events added yet.</p>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <EventCard key={index} meetId={meet.id} index={index} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EventCard({
  meetId,
  index,
  event,
}: {
  meetId: string;
  index: number;
  event: MeetEvent;
}) {
  const hasResult = event.actualTimeSeconds != null;
  const beatGoal =
    hasResult && event.goalTimeSeconds != null
      ? event.actualTimeSeconds! <= event.goalTimeSeconds
      : null;
  const delta =
    hasResult && event.goalTimeSeconds != null
      ? event.actualTimeSeconds! - event.goalTimeSeconds
      : null;

  const actualParts = secondsToParts(event.actualTimeSeconds ?? 0);
  const goalParts = secondsToParts(event.goalTimeSeconds ?? 0);

  return (
    <div className="bg-card rounded-xl border border-pool-100 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-pool-900">
          {event.distance}m {event.stroke}
        </p>
        <form action={deleteMeetEvent}>
          <input type="hidden" name="meetId" value={meetId} />
          <input type="hidden" name="index" value={index} />
          <button type="submit" className="text-pool-400 hover:text-coral-600 font-bold px-1">
            ✕
          </button>
        </form>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div>
          <p className="text-xs text-pool-500 uppercase tracking-wide">Goal</p>
          <p className="font-semibold text-pool-800">
            {event.goalTimeSeconds != null ? formatRaceTime(event.goalTimeSeconds) : "—"}
          </p>
        </div>
        {hasResult && (
          <>
            <div>
              <p className="text-xs text-pool-500 uppercase tracking-wide">Actual</p>
              <p className="font-semibold text-pool-800">
                {formatRaceTime(event.actualTimeSeconds!)}
              </p>
            </div>
            {delta != null && (
              <div>
                <p className="text-xs text-pool-500 uppercase tracking-wide">vs. Goal</p>
                <p className={`font-semibold ${beatGoal ? "text-coral-600" : "text-pool-800"}`}>
                  {delta <= 0 ? "-" : "+"}
                  {Math.abs(delta).toFixed(2)}s
                </p>
              </div>
            )}
            {event.reactionTime != null && (
              <div>
                <p className="text-xs text-pool-500 uppercase tracking-wide">Reaction</p>
                <p className="font-semibold text-pool-800">{event.reactionTime.toFixed(2)}s</p>
              </div>
            )}
          </>
        )}
      </div>

      {event.splits && event.splits.length > 0 && <SplitsChart splits={event.splits} />}

      <details className="pt-2 border-t border-pool-100">
        <summary className="text-xs font-semibold text-pool-600 cursor-pointer">
          {hasResult ? "Update result" : "Enter result"}
        </summary>
        <form action={recordMeetResult} className="space-y-3 mt-3">
          <input type="hidden" name="meetId" value={meetId} />
          <input type="hidden" name="index" value={index} />
          <div>
            <label className="block text-xs font-medium text-pool-700 mb-1">Actual time</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="minute"
                min={0}
                max={59}
                defaultValue={hasResult ? actualParts.minute : undefined}
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
                defaultValue={hasResult ? actualParts.second : undefined}
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
                defaultValue={hasResult ? actualParts.hundredth : undefined}
                placeholder="00"
                aria-label="Hundredths"
                className="w-16 rounded-lg border border-pool-200 px-2 py-2 text-center"
              />
            </div>
            {!hasResult && event.goalTimeSeconds != null && (
              <p className="text-[11px] text-pool-400 mt-1">
                Goal was {goalParts.minute}:{String(goalParts.second).padStart(2, "0")}.
                {String(goalParts.hundredth).padStart(2, "0")}
              </p>
            )}
          </div>
          <div>
            <label htmlFor={`splits-${index}`} className="block text-xs font-medium text-pool-700 mb-1">
              Splits (seconds, comma-separated) <span className="text-pool-400">optional</span>
            </label>
            <input
              id={`splits-${index}`}
              name="splits"
              defaultValue={event.splits?.join(", ")}
              placeholder="27.50, 30.90"
              className="w-full rounded-lg border border-pool-200 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor={`reaction-${index}`} className="block text-xs font-medium text-pool-700 mb-1">
              Reaction time (seconds) <span className="text-pool-400">optional</span>
            </label>
            <input
              id={`reaction-${index}`}
              name="reactionTime"
              type="number"
              step="0.01"
              min={0}
              max={2}
              defaultValue={event.reactionTime}
              placeholder="0.65"
              className="w-full rounded-lg border border-pool-200 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-coral-500 hover:bg-coral-600 text-white text-sm font-semibold py-2 transition-colors"
          >
            {hasResult ? "Update result" : "Save result"}
          </button>
        </form>
      </details>
    </div>
  );
}
