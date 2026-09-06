import { prisma } from "@/lib/prisma";
import { addDays, ensureWeeklySnapshot, getWeekStart, EXPECTED_RPE_RANGE } from "@/lib/scoring";
import { SET_TYPES, type SetType } from "@/lib/types";

function weekStartsBack(weeks: number, from: Date = new Date()): Date[] {
  const currentWeekStart = getWeekStart(from);
  const starts: Date[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    starts.push(addDays(currentWeekStart, -7 * i));
  }
  return starts;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface WeeklyVolumePoint {
  weekStart: Date;
  totalMeters: number;
}

/** Total meters logged per week, most recent `weeks` weeks (oldest first). */
export async function getWeeklyVolume(
  swimmerId: string,
  weeks = 12
): Promise<WeeklyVolumePoint[]> {
  const starts = weekStartsBack(weeks);
  const rangeStart = starts[0];
  const rangeEnd = addDays(starts[starts.length - 1], 7);

  const sessions = await prisma.session.findMany({
    where: { swimmerId, date: { gte: rangeStart, lt: rangeEnd } },
    select: { date: true, totalMeters: true },
  });

  const byWeek = new Map<string, number>();
  for (const s of sessions) {
    const key = dayKey(getWeekStart(s.date));
    byWeek.set(key, (byWeek.get(key) ?? 0) + s.totalMeters);
  }

  return starts.map((weekStart) => ({
    weekStart,
    totalMeters: byWeek.get(dayKey(weekStart)) ?? 0,
  }));
}

export interface DailyVolumePoint {
  date: Date;
  totalMeters: number;
}

/** Total meters logged per calendar day, for the trailing `days` days (oldest first). */
export async function getDailyVolume(
  swimmerId: string,
  days = 84
): Promise<DailyVolumePoint[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rangeStart = addDays(today, -(days - 1));

  const sessions = await prisma.session.findMany({
    where: { swimmerId, date: { gte: rangeStart, lt: addDays(today, 1) } },
    select: { date: true, totalMeters: true },
  });

  const byDay = new Map<string, number>();
  for (const s of sessions) {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    const key = dayKey(d);
    byDay.set(key, (byDay.get(key) ?? 0) + s.totalMeters);
  }

  const result: DailyVolumePoint[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(rangeStart, i);
    result.push({ date, totalMeters: byDay.get(dayKey(date)) ?? 0 });
  }
  return result;
}

export interface WeeklyAttendancePoint {
  weekStart: Date;
  attendanceRate: number | null; // 0-100, null when no sessions were logged that week
}

/** Attended / expected sessions per week, most recent `weeks` weeks (oldest first). */
export async function getWeeklyAttendance(
  swimmerId: string,
  weeks = 12
): Promise<WeeklyAttendancePoint[]> {
  const starts = weekStartsBack(weeks);
  const rangeStart = starts[0];
  const rangeEnd = addDays(starts[starts.length - 1], 7);

  const sessions = await prisma.session.findMany({
    where: { swimmerId, date: { gte: rangeStart, lt: rangeEnd } },
    select: { date: true, attended: true },
  });

  const byWeek = new Map<string, { attended: number; total: number }>();
  for (const s of sessions) {
    const key = dayKey(getWeekStart(s.date));
    const bucket = byWeek.get(key) ?? { attended: 0, total: 0 };
    bucket.total += 1;
    if (s.attended) bucket.attended += 1;
    byWeek.set(key, bucket);
  }

  return starts.map((weekStart) => {
    const bucket = byWeek.get(dayKey(weekStart));
    return {
      weekStart,
      attendanceRate: bucket && bucket.total > 0 ? (bucket.attended / bucket.total) * 100 : null,
    };
  });
}

export interface BestTimeGroup {
  stroke: string;
  distance: number;
  times: { id: string; date: Date; timeSeconds: number; isPB: boolean; context: string }[];
}

/** All BestTime entries, grouped by stroke+distance, each sorted oldest first. */
export async function getBestTimeGroups(swimmerId: string): Promise<BestTimeGroup[]> {
  const rows = await prisma.bestTime.findMany({
    where: { swimmerId },
    orderBy: { date: "asc" },
  });

  const groups = new Map<string, BestTimeGroup>();
  for (const r of rows) {
    const key = `${r.stroke}-${r.distance}`;
    const group = groups.get(key) ?? { stroke: r.stroke, distance: r.distance, times: [] };
    group.times.push({ id: r.id, date: r.date, timeSeconds: r.timeSeconds, isPB: r.isPB, context: r.context });
    groups.set(key, group);
  }

  return [...groups.values()].sort(
    (a, b) => a.stroke.localeCompare(b.stroke) || a.distance - b.distance
  );
}

export interface StrokeTimeDrop {
  stroke: string;
  secondsPerMonth: number | null; // null when not enough data
}

const MS_PER_MONTH = 30 * 24 * 60 * 60 * 1000;

/** Average seconds improved per month, per stroke (across that stroke's events). */
export async function getTimeDropRates(swimmerId: string): Promise<StrokeTimeDrop[]> {
  const groups = await getBestTimeGroups(swimmerId);

  const byStroke = new Map<string, number[]>();
  for (const group of groups) {
    if (group.times.length < 2) continue;
    const first = group.times[0];
    const last = group.times[group.times.length - 1];
    const monthsElapsed = (last.date.getTime() - first.date.getTime()) / MS_PER_MONTH;
    if (monthsElapsed <= 0) continue;
    const secondsPerMonth = (first.timeSeconds - last.timeSeconds) / monthsElapsed;
    const list = byStroke.get(group.stroke) ?? [];
    list.push(secondsPerMonth);
    byStroke.set(group.stroke, list);
  }

  const strokes = [...new Set(groups.map((g) => g.stroke))].sort();
  return strokes.map((stroke) => {
    const rates = byStroke.get(stroke);
    return {
      stroke,
      secondsPerMonth: rates && rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : null,
    };
  });
}

export interface RpeDistributionPoint {
  setType: SetType;
  actualAvg: number | null;
  count: number;
  expectedMin: number;
  expectedMax: number;
}

/** Average actual RPE per set type (all-time), alongside the expected band. */
export async function getRpeDistribution(swimmerId: string): Promise<RpeDistributionPoint[]> {
  const sets = await prisma.set.findMany({
    where: { session: { swimmerId }, rpe: { not: null } },
    select: { setType: true, rpe: true },
  });

  const bySetType = new Map<string, number[]>();
  for (const s of sets) {
    if (s.rpe == null) continue;
    const list = bySetType.get(s.setType) ?? [];
    list.push(s.rpe);
    bySetType.set(s.setType, list);
  }

  return SET_TYPES.map((setType) => {
    const values = bySetType.get(setType);
    const [expectedMin, expectedMax] = EXPECTED_RPE_RANGE[setType];
    return {
      setType,
      actualAvg: values && values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null,
      count: values?.length ?? 0,
      expectedMin,
      expectedMax,
    };
  });
}

export interface WeeklyMoodPoint {
  weekStart: Date;
  avgPreMood: number | null;
  avgPostMood: number | null;
}

/** Average pre/post session mood per week, most recent `weeks` weeks (oldest first). */
export async function getMoodTrend(swimmerId: string, weeks = 12): Promise<WeeklyMoodPoint[]> {
  const starts = weekStartsBack(weeks);
  const rangeStart = starts[0];
  const rangeEnd = addDays(starts[starts.length - 1], 7);

  const sessions = await prisma.session.findMany({
    where: { swimmerId, date: { gte: rangeStart, lt: rangeEnd } },
    select: { date: true, preMood: true, postMood: true },
  });

  const byWeek = new Map<string, { pre: number[]; post: number[] }>();
  for (const s of sessions) {
    const key = dayKey(getWeekStart(s.date));
    const bucket = byWeek.get(key) ?? { pre: [], post: [] };
    if (s.preMood != null) bucket.pre.push(s.preMood);
    if (s.postMood != null) bucket.post.push(s.postMood);
    byWeek.set(key, bucket);
  }

  const avg = (nums: number[]) =>
    nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : null;

  return starts.map((weekStart) => {
    const bucket = byWeek.get(dayKey(weekStart));
    return {
      weekStart,
      avgPreMood: bucket ? avg(bucket.pre) : null,
      avgPostMood: bucket ? avg(bucket.post) : null,
    };
  });
}

/** Ensures and returns SwimScoreSnapshot history for the last `weeks` weeks (oldest first). */
export async function getScoreHistory(swimmerId: string, weeks = 12) {
  const starts = weekStartsBack(weeks);
  const snapshots = [];
  for (const weekStart of starts) {
    snapshots.push(await ensureWeeklySnapshot(swimmerId, weekStart));
  }
  return snapshots;
}
