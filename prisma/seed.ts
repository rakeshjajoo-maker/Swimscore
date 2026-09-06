import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

type SeedSet = Omit<Prisma.SetCreateWithoutSessionInput, "equipment"> & {
  equipment?: string[];
};

async function seedSession(
  swimmerId: string,
  date: Date,
  opts: {
    sessionType?: string;
    preMood?: number;
    postMood?: number;
    attended?: boolean;
    skipReason?: string;
    sets?: SeedSet[];
  }
) {
  const session = await prisma.session.create({
    data: {
      swimmerId,
      date,
      sessionType: opts.sessionType ?? "Regular",
      preMood: opts.preMood,
      postMood: opts.postMood,
      attended: opts.attended ?? true,
      skipReason: opts.skipReason,
      sets: opts.sets ? { create: opts.sets } : undefined,
    },
    include: { sets: true },
  });

  const totalMeters = session.sets.reduce((sum, s) => sum + s.reps * s.distancePerRep, 0);
  await prisma.session.update({ where: { id: session.id }, data: { totalMeters } });
  return session;
}

async function main() {
  const swimmer = await prisma.swimmer.create({
    data: {
      name: "Jamie Rivera",
      age: 15,
      squad: "Senior Elite",
      primaryStroke: "Free",
      competitionCategory: "100m Free specialist",
      seasonGoal: "Break 55s in the 100 Free",
      techniqueScore: 68,
    },
  });

  // Trailing weeks (~3400-3800m/week) so this week's volumeScore has a real
  // baseline to compare against, plus a mostly-attended history.
  for (const weekOffset of [4, 3, 2] as const) {
    const base = weekOffset * 7;
    await seedSession(swimmer.id, daysAgo(base + 5), {
      preMood: 4,
      postMood: 4,
      sets: [
        { setType: "WarmUp", reps: 1, distancePerRep: 400, stroke: "Choice", rpe: 3 },
        { setType: "Main", reps: 10, distancePerRep: 100, stroke: "Free", intervalSeconds: 100, rpe: 7 },
        { setType: "Kick", reps: 6, distancePerRep: 50, stroke: "Free", equipment: ["Fins"], rpe: 5 },
        { setType: "CoolDown", reps: 1, distancePerRep: 200, stroke: "Choice", rpe: 2 },
      ],
    });
    await seedSession(swimmer.id, daysAgo(base + 2), {
      preMood: 3,
      postMood: 4,
      sets: [
        { setType: "WarmUp", reps: 1, distancePerRep: 300, stroke: "Choice", rpe: 3 },
        { setType: "Sprint", reps: 6, distancePerRep: 50, stroke: "Free", intervalSeconds: 60, rpe: 9 },
        { setType: "Pull", reps: 4, distancePerRep: 200, stroke: "Free", equipment: ["Buoy", "Paddles"], rpe: 6 },
      ],
    });
  }

  // This week: two solid sessions plus one skipped.
  await seedSession(swimmer.id, daysAgo(4), {
    preMood: 4,
    postMood: 4,
    sets: [
      { setType: "WarmUp", reps: 1, distancePerRep: 400, stroke: "Choice", rpe: 3 },
      { setType: "Main", reps: 10, distancePerRep: 100, stroke: "Free", intervalSeconds: 100, rpe: 7 },
      { setType: "Kick", reps: 6, distancePerRep: 50, stroke: "Free", equipment: ["Fins"], rpe: 5 },
      { setType: "CoolDown", reps: 1, distancePerRep: 200, stroke: "Choice", rpe: 2 },
    ],
  });
  await seedSession(swimmer.id, daysAgo(2), {
    preMood: 3,
    postMood: 4,
    sets: [
      { setType: "WarmUp", reps: 1, distancePerRep: 300, stroke: "Choice", rpe: 3 },
      { setType: "Sprint", reps: 8, distancePerRep: 50, stroke: "Free", intervalSeconds: 60, rpe: 9 },
      { setType: "Pull", reps: 4, distancePerRep: 200, stroke: "Free", equipment: ["Buoy", "Paddles"], rpe: 6 },
    ],
  });
  await seedSession(swimmer.id, daysAgo(1), {
    attended: false,
    skipReason: "Sick",
  });

  // A couple of BestTime entries per event, improving over the last month,
  // so timeTrendScore has real data to work with.
  await prisma.bestTime.createMany({
    data: [
      { swimmerId: swimmer.id, stroke: "Free", distance: 100, timeSeconds: 58.4, context: "TimeTrial", date: daysAgo(35) },
      { swimmerId: swimmer.id, stroke: "Free", distance: 100, timeSeconds: 57.1, context: "Meet", date: daysAgo(14), isPB: true },
      { swimmerId: swimmer.id, stroke: "Free", distance: 50, timeSeconds: 26.8, context: "TimeTrial", date: daysAgo(30) },
      { swimmerId: swimmer.id, stroke: "Free", distance: 50, timeSeconds: 26.5, context: "Practice", date: daysAgo(10), isPB: true },
    ],
  });

  await prisma.meet.create({
    data: {
      swimmerId: swimmer.id,
      name: "City Invitational",
      date: daysAgo(14),
      events: [
        {
          stroke: "Free",
          distance: 100,
          goalTimeSeconds: 58.0,
          actualTimeSeconds: 57.1,
          splits: [27.3, 29.8],
          reactionTime: 0.64,
        },
        { stroke: "Free", distance: 50, goalTimeSeconds: 27.0, actualTimeSeconds: 26.8 },
        { stroke: "Free", distance: 200, goalTimeSeconds: 130.0 },
      ],
    },
  });

  console.log(`Seeded swimmer ${swimmer.name} (${swimmer.id}) with 9 sessions across 4 weeks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
