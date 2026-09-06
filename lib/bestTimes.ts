import { prisma } from "@/lib/prisma";

/** Creates a BestTime row, computing isPB by comparing against the current best for that stroke+distance. */
export async function recordBestTime(params: {
  swimmerId: string;
  stroke: string;
  distance: number;
  timeSeconds: number;
  context: string;
  date: Date;
}) {
  const { swimmerId, stroke, distance, timeSeconds, context, date } = params;

  const currentBest = await prisma.bestTime.findFirst({
    where: { swimmerId, stroke, distance },
    orderBy: { timeSeconds: "asc" },
  });
  const isPB = !currentBest || timeSeconds < currentBest.timeSeconds;

  const bestTime = await prisma.bestTime.create({
    data: { swimmerId, stroke, distance, timeSeconds, context, date, isPB },
  });

  return { bestTime, isPB };
}
