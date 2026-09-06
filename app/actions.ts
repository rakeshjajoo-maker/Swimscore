"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentSwimmerId, SWIMMER_COOKIE } from "@/lib/currentSwimmer";

const SWIMMER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function createSwimmer(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const age = Number(formData.get("age"));
  const squad = String(formData.get("squad") || "").trim();
  const primaryStroke = String(formData.get("primaryStroke") || "");
  const competitionCategory = String(formData.get("competitionCategory") || "").trim();
  const seasonGoal = String(formData.get("seasonGoal") || "").trim() || null;

  if (!name || !squad || !competitionCategory || !Number.isFinite(age) || age <= 0) {
    throw new Error("Please fill in all required swimmer fields.");
  }

  const swimmer = await prisma.swimmer.create({
    data: { name, age, squad, primaryStroke, competitionCategory, seasonGoal },
  });

  const store = await cookies();
  store.set(SWIMMER_COOKIE, swimmer.id, {
    path: "/",
    maxAge: SWIMMER_COOKIE_MAX_AGE,
  });

  redirect("/");
}

export async function switchSwimmer(id: string) {
  const store = await cookies();
  store.set(SWIMMER_COOKIE, id, {
    path: "/",
    maxAge: SWIMMER_COOKIE_MAX_AGE,
  });
  revalidatePath("/", "layout");
}

export async function createSession(formData: FormData) {
  const swimmerId = await getCurrentSwimmerId();
  if (!swimmerId) {
    redirect("/swimmers/new");
  }

  const date = String(formData.get("date") || "");
  const sessionType = String(formData.get("sessionType") || "Regular");
  const attended = formData.get("attended") === "on";
  const skipReason = attended ? null : String(formData.get("skipReason") || "").trim() || null;
  const preMoodRaw = formData.get("preMood");
  const preMood = preMoodRaw ? Number(preMoodRaw) : null;

  if (!date) {
    throw new Error("Session date is required.");
  }

  const session = await prisma.session.create({
    data: {
      swimmerId,
      date: new Date(date),
      sessionType,
      attended,
      skipReason,
      preMood,
      totalMeters: 0,
    },
  });

  redirect(`/log/${session.id}`);
}

async function recomputeTotalMeters(sessionId: string) {
  const sets = await prisma.set.findMany({
    where: { sessionId },
    select: { reps: true, distancePerRep: true },
  });
  const totalMeters = sets.reduce((sum, s) => sum + s.reps * s.distancePerRep, 0);
  await prisma.session.update({ where: { id: sessionId }, data: { totalMeters } });
}

export async function addSet(formData: FormData) {
  const sessionId = String(formData.get("sessionId") || "");
  const setType = String(formData.get("setType") || "");
  const reps = Number(formData.get("reps"));
  const distancePerRep = Number(formData.get("distancePerRep"));
  const stroke = String(formData.get("stroke") || "");
  const intervalSecondsRaw = formData.get("intervalSeconds");
  const intervalSeconds = intervalSecondsRaw ? Number(intervalSecondsRaw) : null;
  const equipment = formData.getAll("equipment").map(String);
  const rpeRaw = formData.get("rpe");
  const rpe = rpeRaw ? Number(rpeRaw) : null;
  const notes = String(formData.get("notes") || "").trim() || null;

  if (
    !sessionId ||
    !setType ||
    !stroke ||
    !Number.isFinite(reps) ||
    reps <= 0 ||
    !Number.isFinite(distancePerRep) ||
    distancePerRep <= 0
  ) {
    throw new Error("Please provide valid set details.");
  }

  await prisma.set.create({
    data: {
      sessionId,
      setType,
      reps,
      distancePerRep,
      stroke,
      intervalSeconds: intervalSeconds && intervalSeconds > 0 ? intervalSeconds : null,
      equipment: equipment.length ? equipment : undefined,
      rpe: rpe && rpe > 0 ? rpe : null,
      notes,
    },
  });

  await recomputeTotalMeters(sessionId);
  revalidatePath(`/log/${sessionId}`);
}

export async function deleteSet(formData: FormData) {
  const id = String(formData.get("id") || "");
  const sessionId = String(formData.get("sessionId") || "");
  if (!id || !sessionId) return;

  await prisma.set.delete({ where: { id } });
  await recomputeTotalMeters(sessionId);
  revalidatePath(`/log/${sessionId}`);
}

export async function finishSession(formData: FormData) {
  const sessionId = String(formData.get("sessionId") || "");
  const postMoodRaw = formData.get("postMood");
  const postMood = postMoodRaw ? Number(postMoodRaw) : null;

  await prisma.session.update({ where: { id: sessionId }, data: { postMood } });

  revalidatePath("/");
  redirect("/");
}
