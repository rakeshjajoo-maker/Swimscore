"use client";

import { useRef, useState, useTransition } from "react";
import { addMeetEvent } from "@/app/actions";
import { STROKES, EVENT_DISTANCES } from "@/lib/types";

export function AddEventForm({ meetId }: { meetId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setError(null);
    startTransition(async () => {
      try {
        await addMeetEvent(data);
        form.reset();
      } catch {
        setError("Couldn't add that event — check the values and try again.");
      }
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-card rounded-xl border border-pool-100 shadow-sm p-4 space-y-3"
    >
      <input type="hidden" name="meetId" value={meetId} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="stroke" className="block text-xs font-medium text-pool-700 mb-1">
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
          <label htmlFor="distance" className="block text-xs font-medium text-pool-700 mb-1">
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
        <label className="block text-xs font-medium text-pool-700 mb-1">
          Goal time <span className="text-pool-400">optional</span>
        </label>
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
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-pool-600 hover:bg-pool-700 disabled:opacity-60 text-white font-semibold py-2 transition-colors"
      >
        {isPending ? "Adding…" : "Add event"}
      </button>
      {error && <p className="text-sm text-coral-600">{error}</p>}
    </form>
  );
}
