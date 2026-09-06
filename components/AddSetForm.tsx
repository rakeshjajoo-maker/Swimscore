"use client";

import { useState, useTransition } from "react";
import { addSet } from "@/app/actions";
import { NumberStepper } from "@/components/NumberStepper";
import { EQUIPMENT, SET_STROKES, SET_TYPES, type Equipment } from "@/lib/types";
import { formatInterval } from "@/lib/format";

const COMMON_DISTANCES = [25, 50, 75, 100, 150, 200, 300, 400, 500, 800, 1000, 1500];

export function AddSetForm({ sessionId }: { sessionId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [setType, setSetType] = useState<(typeof SET_TYPES)[number]>("Main");
  const [stroke, setStroke] = useState<(typeof SET_STROKES)[number]>("Free");
  const [reps, setReps] = useState(4);
  const [distancePerRep, setDistancePerRep] = useState(100);
  const [intervalMin, setIntervalMin] = useState(0);
  const [intervalSec, setIntervalSec] = useState(0);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [rpe, setRpe] = useState(0);
  const [notes, setNotes] = useState("");

  const intervalSeconds = intervalMin * 60 + intervalSec;
  const preview = `${reps} × ${distancePerRep} ${stroke}${
    intervalSeconds > 0 ? ` @ ${formatInterval(intervalSeconds)}` : ""
  }`;

  function toggleEquipment(item: Equipment) {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  }

  function handleSubmit() {
    setError(null);
    const data = new FormData();
    data.set("sessionId", sessionId);
    data.set("setType", setType);
    data.set("stroke", stroke);
    data.set("reps", String(reps));
    data.set("distancePerRep", String(distancePerRep));
    data.set("intervalSeconds", String(intervalSeconds));
    data.set("rpe", String(rpe));
    data.set("notes", notes);
    equipment.forEach((e) => data.append("equipment", e));

    startTransition(async () => {
      try {
        await addSet(data);
        setNotes("");
        setEquipment([]);
      } catch {
        setError("Couldn't add that set — check the values and try again.");
      }
    });
  }

  return (
    <div className="bg-card rounded-xl border border-pool-100 shadow-sm p-4 space-y-4">
      <div>
        <label className="block text-xs font-medium text-pool-700 mb-1">Set type</label>
        <div className="flex flex-wrap gap-1.5">
          {SET_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSetType(t)}
              className={`px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                setType === t
                  ? "bg-pool-600 border-pool-600 text-white"
                  : "bg-white border-pool-200 text-pool-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumberStepper label="Reps" value={reps} onChange={setReps} min={1} step={1} />
        <div>
          <label htmlFor="distancePerRep" className="block text-xs font-medium text-pool-700 mb-1">
            Distance / rep (m)
          </label>
          <select
            id="distancePerRep"
            value={distancePerRep}
            onChange={(e) => setDistancePerRep(Number(e.target.value))}
            className="w-full rounded-lg border border-pool-200 bg-white px-3 py-2"
          >
            {COMMON_DISTANCES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-pool-700 mb-1">Stroke</label>
        <div className="flex flex-wrap gap-1.5">
          {SET_STROKES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStroke(s)}
              className={`px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                stroke === s
                  ? "bg-pool-600 border-pool-600 text-white"
                  : "bg-white border-pool-200 text-pool-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-pool-700 mb-1">
            Interval (send-off) <span className="text-pool-400">optional</span>
          </label>
          <div className="flex items-center gap-1.5">
            <NumberStepper label="min" value={intervalMin} onChange={setIntervalMin} min={0} max={30} />
            <span className="text-pool-400 font-semibold pt-5">:</span>
            <NumberStepper label="sec" value={intervalSec} onChange={setIntervalSec} min={0} max={55} step={5} />
          </div>
        </div>
        <NumberStepper
          label="RPE (1-10) optional"
          value={rpe}
          onChange={setRpe}
          min={0}
          max={10}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-pool-700 mb-1">Equipment</label>
        <div className="flex flex-wrap gap-1.5">
          {EQUIPMENT.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleEquipment(item)}
              className={`px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                equipment.includes(item)
                  ? "bg-coral-500 border-coral-500 text-white"
                  : "bg-white border-pool-200 text-pool-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="set-notes" className="block text-xs font-medium text-pool-700 mb-1">
          Notes <span className="text-pool-400">optional</span>
        </label>
        <input
          id="set-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-pool-200 px-3 py-2"
          placeholder="Descending, negative split..."
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-sm font-medium text-pool-800 truncate">{preview}</p>
        <button
          type="button"
          disabled={isPending}
          onClick={handleSubmit}
          className="shrink-0 rounded-lg bg-pool-600 hover:bg-pool-700 disabled:opacity-60 text-white font-semibold px-4 py-2 transition-colors"
        >
          {isPending ? "Adding…" : "Add set"}
        </button>
      </div>
      {error && <p className="text-sm text-coral-600">{error}</p>}
    </div>
  );
}
