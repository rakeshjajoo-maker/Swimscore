export function formatInterval(seconds?: number | null): string | null {
  if (seconds == null || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatMeters(meters: number): string {
  return `${meters.toLocaleString()} m`;
}

export function formatSetLine(set: {
  reps: number;
  distancePerRep: number;
  stroke: string;
  intervalSeconds?: number | null;
}): string {
  const interval = formatInterval(set.intervalSeconds);
  return `${set.reps} × ${set.distancePerRep} ${set.stroke}${interval ? ` @ ${interval}` : ""}`;
}

/** Formats a race time given in total seconds as "M:SS.hh" (or "S.hh" under a minute). */
export function formatRaceTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  const secondsStr = seconds.toFixed(2).padStart(5, "0");
  return minutes > 0 ? `${minutes}:${secondsStr}` : seconds.toFixed(2);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
