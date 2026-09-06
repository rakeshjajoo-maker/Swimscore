import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
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
    },
  });

  const session1 = await prisma.session.create({
    data: {
      swimmerId: swimmer.id,
      date: daysAgo(4),
      sessionType: "Regular",
      preMood: 4,
      postMood: 4,
      attended: true,
      sets: {
        create: [
          { setType: "WarmUp", reps: 1, distancePerRep: 400, stroke: "Choice", rpe: 3 },
          {
            setType: "Main",
            reps: 10,
            distancePerRep: 100,
            stroke: "Free",
            intervalSeconds: 100,
            rpe: 7,
            equipment: ["None"],
          },
          { setType: "Kick", reps: 6, distancePerRep: 50, stroke: "Free", equipment: ["Fins"], rpe: 5 },
          { setType: "CoolDown", reps: 1, distancePerRep: 200, stroke: "Choice", rpe: 2 },
        ],
      },
    },
    include: { sets: true },
  });
  await prisma.session.update({
    where: { id: session1.id },
    data: {
      totalMeters: session1.sets.reduce((sum, s) => sum + s.reps * s.distancePerRep, 0),
    },
  });

  const session2 = await prisma.session.create({
    data: {
      swimmerId: swimmer.id,
      date: daysAgo(2),
      sessionType: "Regular",
      preMood: 3,
      postMood: 4,
      attended: true,
      sets: {
        create: [
          { setType: "WarmUp", reps: 1, distancePerRep: 300, stroke: "Choice", rpe: 3 },
          {
            setType: "Sprint",
            reps: 8,
            distancePerRep: 50,
            stroke: "Free",
            intervalSeconds: 60,
            rpe: 9,
            equipment: ["None"],
          },
          { setType: "Pull", reps: 4, distancePerRep: 200, stroke: "Free", equipment: ["Buoy", "Paddles"], rpe: 6 },
        ],
      },
    },
    include: { sets: true },
  });
  await prisma.session.update({
    where: { id: session2.id },
    data: {
      totalMeters: session2.sets.reduce((sum, s) => sum + s.reps * s.distancePerRep, 0),
    },
  });

  await prisma.session.create({
    data: {
      swimmerId: swimmer.id,
      date: daysAgo(1),
      sessionType: "Regular",
      attended: false,
      skipReason: "Sick",
      totalMeters: 0,
    },
  });

  console.log(`Seeded swimmer ${swimmer.name} (${swimmer.id}) with 3 sessions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
