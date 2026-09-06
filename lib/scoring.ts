import { prisma } from "@/lib/prisma";
import type { SetType } from "@/lib/types";

// Weighted average weights for compositeScore. Keep as named constants (not
// magic numbers) so they're easy to retune later; they must sum to 1.
export const SCORE_WEIGHTS = {
  volume: 0.25,
  consistency: 0.25,
  effortAlignment: 0.2,
  timeTrend: 0.15,
  technique: 0.15,
} as const;

// Expected RPE band per set type, used by effortAlignmentScore. WarmUp/CoolDown
// should be easy; Main/Sprint should be hard.
export const EXPECTED_RPE_RANGE: Record<SetType, [number, number]> = {
  WarmUp: [1, 4],
  Drill: [2, 5],
  Kick: [3, 6],
  Pull: [3, 6],
  Main: [6, 9],
  Sprint: [8, 10],
  CoolDown: [1, 3],
};

const NEUTRAL_SCORE = 50;
const TIME_TREND_WINDOW_WEEKS = 8;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Monday 00:00:00 (local time) of the week containing `date`. */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diffToMonday);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function average(nums: number[]): number {
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

function volumeScore(thisWeekMeters: number, trailing4WeekAvgMeters: number): number {
  if (trailing4WeekAvgMeters <= 0) {
    return thisWeekMeters > 0 ? 100 : 0;
  }
  const ratio = thisWeekMeters / trailing4WeekAvgMeters;
  return clamp(ratio * 100, 0, 100);
}

function consistencyScore(attendedCount: number, expectedCount: number): number {
  if (expectedCount <= 0) return 0;
  return clamp((attendedCount / expectedCount) * 100, 0, 100);
}

function effortAlignmentScore(
  rated: { setType: string; rpe: number | null }[]
): number {
  const scored = rated
    .filter((s): s is { setType: string; rpe: number } => s.rpe != null)
    .map((s) => {
      const range = EXPECTED_RPE_RANGE[s.setType as SetType];
      if (!range) return null;
      const [min, max] = range;
      if (s.rpe >= min && s.rpe <= max) return 100;
      const distance = s.rpe < min ? min - s.rpe : s.rpe - max;
      return clamp(100 - distance * 20, 0, 100);
    })
    .filter((n): n is number => n != null);

  if (scored.length === 0) return NEUTRAL_SCORE;
  return average(scored);
}

function timeTrendScore(
  bestTimes: { stroke: string; distance: number; timeSeconds: number; date: Date }[]
): number {
  const groups = new Map<string, { timeSeconds: number; date: Date }[]>();
  for (const t of bestTimes) {
    const key = `${t.stroke}-${t.distance}`;
    const list = groups.get(key) ?? [];
    list.push(t);
    groups.set(key, list);
  }

  const groupScores: number[] = [];
  for (const times of groups.values()) {
    if (times.length < 2) continue;
    const sorted = [...times].sort((a, b) => a.date.getTime() - b.date.getTime());
    const first = sorted[0].timeSeconds;
    const last = sorted[sorted.length - 1].timeSeconds;
    if (first <= 0) continue;
    const pctImprovement = (first - last) / first; // positive = got faster
    // +/-5% change maps to the ends of the 0-100 scale, centered on 50.
    groupScores.push(clamp(NEUTRAL_SCORE + pctImprovement * 1000, 0, 100));
  }

  if (groupScores.length === 0) return NEUTRAL_SCORE;
  return average(groupScores);
}

export interface WeeklyScoreBreakdown {
  weekStartDate: Date;
  volumeScore: number;
  consistencyScore: number;
  effortAlignmentScore: number;
  timeTrendScore: number;
  techniqueScore: number;
  compositeScore: number;
}

/** Computes (and does not persist) the SwimScore breakdown for one week. */
export async function computeWeeklyScore(
  swimmerId: string,
  weekStart: Date
): Promise<WeeklyScoreBreakdown> {
  const weekEnd = addDays(weekStart, 7);
  const trailingStart = addDays(weekStart, -28);

  const [swimmer, thisWeekSessions, trailingSessions, bestTimes] = await Promise.all([
    prisma.swimmer.findUniqueOrThrow({ where: { id: swimmerId } }),
    prisma.session.findMany({
      where: { swimmerId, date: { gte: weekStart, lt: weekEnd } },
      include: { sets: { select: { setType: true, rpe: true } } },
    }),
    prisma.session.findMany({
      where: { swimmerId, date: { gte: trailingStart, lt: weekStart } },
      select: { totalMeters: true, sessionType: true },
    }),
    prisma.bestTime.findMany({
      where: {
        swimmerId,
        date: { gte: addDays(weekStart, -TIME_TREND_WINDOW_WEEKS * 7), lt: weekEnd },
      },
      select: { stroke: true, distance: true, timeSeconds: true, date: true },
    }),
  ]);

  // Taper Mode: a swimmer tapering before a meet is *supposed* to cut volume,
  // so Taper sessions are excluded from both sides of the volumeScore ratio -
  // they don't count as "this week's meters" and they don't drag down the
  // trailing baseline other weeks get compared against.
  const hasTaperSessionThisWeek = thisWeekSessions.some((s) => s.sessionType === "Taper");
  const thisWeekMeters = thisWeekSessions
    .filter((s) => s.sessionType !== "Taper")
    .reduce((sum, s) => sum + s.totalMeters, 0);
  const trailing4WeekAvgMeters =
    trailingSessions
      .filter((s) => s.sessionType !== "Taper")
      .reduce((sum, s) => sum + s.totalMeters, 0) / 4;

  const attendedCount = thisWeekSessions.filter((s) => s.attended).length;
  const expectedCount = thisWeekSessions.length;

  const allSets = thisWeekSessions.flatMap((s) => s.sets);

  const vScore = hasTaperSessionThisWeek ? 100 : volumeScore(thisWeekMeters, trailing4WeekAvgMeters);
  const cScore = consistencyScore(attendedCount, expectedCount);
  const eScore = effortAlignmentScore(allSets);
  const tScore = timeTrendScore(bestTimes);
  const techScore = swimmer.techniqueScore ?? NEUTRAL_SCORE;

  const compositeScore =
    vScore * SCORE_WEIGHTS.volume +
    cScore * SCORE_WEIGHTS.consistency +
    eScore * SCORE_WEIGHTS.effortAlignment +
    tScore * SCORE_WEIGHTS.timeTrend +
    techScore * SCORE_WEIGHTS.technique;

  return {
    weekStartDate: weekStart,
    volumeScore: vScore,
    consistencyScore: cScore,
    effortAlignmentScore: eScore,
    timeTrendScore: tScore,
    techniqueScore: techScore,
    compositeScore,
  };
}

/** Computes and upserts the SwimScoreSnapshot for one week, returning it. */
export async function ensureWeeklySnapshot(swimmerId: string, weekStart: Date) {
  const breakdown = await computeWeeklyScore(swimmerId, weekStart);

  return prisma.swimScoreSnapshot.upsert({
    where: { swimmerId_weekStartDate: { swimmerId, weekStartDate: weekStart } },
    create: { swimmerId, ...breakdown },
    update: { ...breakdown },
  });
}
