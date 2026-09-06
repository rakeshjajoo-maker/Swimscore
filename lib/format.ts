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

/** Splits a total-seconds race time back into minute/second/hundredth parts, for pre-filling time-entry forms. */
export function secondsToParts(totalSeconds: number): { minute: number; second: number; hundredth: number } {
  const minute = Math.floor(totalSeconds / 60);
  const remainder = totalSeconds - minute * 60;
  const second = Math.floor(remainder);
  const hundredth = Math.round((remainder - second) * 100);
  return { minute, second, hundredth };
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
