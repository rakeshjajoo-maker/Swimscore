"use client";

interface Point {
  date: string; // ISO
  totalMeters: number;
}

// Light -> dark pool blue, matching the app palette (coral is reserved for
// PB/achievement moments elsewhere, not used here).
const LEVEL_COLORS = ["#f2f9fd", "#dcf0f9", "#8fcbe8", "#3a8fbf", "#1d4760"];

function levelFor(value: number, max: number): number {
  if (value <= 0 || max <= 0) return 0;
  const ratio = value / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

export function CalendarHeatmap({ data }: { data: Point[] }) {
  if (data.length === 0) return null;
  const max = Math.max(0, ...data.map((d) => d.totalMeters));

  const byKey = new Map(data.map((d) => [d.date.slice(0, 10), d.totalMeters]));

  const first = new Date(data[0].date);
  const last = new Date(data[data.length - 1].date);

  const firstMonday = new Date(first);
  const day = firstMonday.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  firstMonday.setDate(firstMonday.getDate() - diffToMonday);

  const cells: { key: string; date: Date; totalMeters: number | null }[] = [];
  const cursor = new Date(firstMonday);
  while (cursor <= last) {
    const key = cursor.toISOString().slice(0, 10);
    cells.push({ key, date: new Date(cursor), totalMeters: byKey.get(key) ?? null });
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="bg-card rounded-xl border border-pool-100 p-4 overflow-x-auto">
      <div className="flex gap-1 w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell) => (
              <div
                key={cell.key}
                title={`${cell.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}: ${
                  cell.totalMeters ?? 0
                } m`}
                className="w-3 h-3 rounded-sm"
                style={{
                  background:
                    cell.totalMeters == null
                      ? "transparent"
                      : LEVEL_COLORS[levelFor(cell.totalMeters, max)],
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-3 text-[10px] text-pool-500">
        <span>Less</span>
        {LEVEL_COLORS.map((c) => (
          <div key={c} className="w-3 h-3 rounded-sm" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
