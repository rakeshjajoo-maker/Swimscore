"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentSwimmerId, SWIMMER_COOKIE } from "@/lib/currentSwimmer";
import { recordBestTime } from "@/lib/bestTimes";
import type { MeetEvent } from "@/lib/types";

function toJson(events: MeetEvent[]): Prisma.InputJsonValue {
  return events as unknown as Prisma.InputJsonValue;
}

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

export async function updateTechniqueScore(formData: FormData) {
  const swimmerId = String(formData.get("swimmerId") || "");
  const raw = formData.get("techniqueScore");
  const techniqueScore = raw && String(raw).trim() !== "" ? Number(raw) : null;

  if (!swimmerId) return;
  if (techniqueScore != null && (!Number.isFinite(techniqueScore) || techniqueScore < 1 || techniqueScore > 100)) {
    throw new Error("Technique score must be between 1 and 100.");
  }

  await prisma.swimmer.update({ where: { id: swimmerId }, data: { techniqueScore } });
  revalidatePath("/");
}

export async function addBestTime(formData: FormData) {
  const swimmerId = String(formData.get("swimmerId") || "");
  const stroke = String(formData.get("stroke") || "");
  const distance = Number(formData.get("distance"));
  const context = String(formData.get("context") || "");
  const dateRaw = String(formData.get("date") || "");
  const minute = Number(formData.get("minute") || 0);
  const second = Number(formData.get("second") || 0);
  const hundredth = Number(formData.get("hundredth") || 0);
  const timeSeconds = minute * 60 + second + hundredth / 100;

  if (
    !swimmerId ||
    !stroke ||
    !context ||
    !dateRaw ||
    !Number.isFinite(distance) ||
    distance <= 0 ||
    !Number.isFinite(timeSeconds) ||
    timeSeconds <= 0
  ) {
    throw new Error("Please provide a valid stroke, distance, time, context, and date.");
  }

  const { isPB } = await recordBestTime({
    swimmerId,
    stroke,
    distance,
    timeSeconds,
    context,
    date: new Date(dateRaw),
  });

  revalidatePath("/best-times");
  redirect(isPB ? "/best-times?pb=1" : "/best-times");
}

export async function createMeet(formData: FormData) {
  const swimmerId = await getCurrentSwimmerId();
  if (!swimmerId) {
    redirect("/swimmers/new");
  }

  const name = String(formData.get("name") || "").trim();
  const dateRaw = String(formData.get("date") || "");

  if (!name || !dateRaw) {
    throw new Error("Please provide a meet name and date.");
  }

  const meet = await prisma.meet.create({
    data: { swimmerId, name, date: new Date(dateRaw), events: [] },
  });

  redirect(`/meets/${meet.id}`);
}

function timeFromParts(formData: FormData): number | undefined {
  const minute = Number(formData.get("minute") || 0);
  const second = Number(formData.get("second") || 0);
  const hundredth = Number(formData.get("hundredth") || 0);
  const seconds = minute * 60 + second + hundredth / 100;
  return seconds > 0 ? seconds : undefined;
}

export async function addMeetEvent(formData: FormData) {
  const meetId = String(formData.get("meetId") || "");
  const stroke = String(formData.get("stroke") || "");
  const distance = Number(formData.get("distance"));
  const goalTimeSeconds = timeFromParts(formData);

  if (!meetId || !stroke || !Number.isFinite(distance) || distance <= 0) {
    throw new Error("Please provide a valid stroke and distance.");
  }

  const meet = await prisma.meet.findUniqueOrThrow({ where: { id: meetId } });
  const events = (meet.events as unknown as MeetEvent[]) ?? [];
  events.push({ stroke: stroke as MeetEvent["stroke"], distance, goalTimeSeconds });

  await prisma.meet.update({ where: { id: meetId }, data: { events: toJson(events) } });
  revalidatePath(`/meets/${meetId}`);
}

export async function deleteMeetEvent(formData: FormData) {
  const meetId = String(formData.get("meetId") || "");
  const index = Number(formData.get("index"));
  if (!meetId || !Number.isFinite(index)) return;

  const meet = await prisma.meet.findUniqueOrThrow({ where: { id: meetId } });
  const events = (meet.events as unknown as MeetEvent[]) ?? [];
  events.splice(index, 1);

  await prisma.meet.update({ where: { id: meetId }, data: { events: toJson(events) } });
  revalidatePath(`/meets/${meetId}`);
}

export async function recordMeetResult(formData: FormData) {
  const meetId = String(formData.get("meetId") || "");
  const index = Number(formData.get("index"));
  const actualTimeSeconds = timeFromParts(formData);
  const splitsRaw = String(formData.get("splits") || "").trim();
  const splits = splitsRaw
    ? splitsRaw
        .split(/[,\s]+/)
        .map(Number)
        .filter((n) => Number.isFinite(n) && n > 0)
    : undefined;
  const reactionTimeRaw = formData.get("reactionTime");
  const reactionTime =
    reactionTimeRaw && String(reactionTimeRaw).trim() !== "" ? Number(reactionTimeRaw) : undefined;

  if (!meetId || !Number.isFinite(index) || !actualTimeSeconds) {
    throw new Error("Please provide a valid result time.");
  }

  const meet = await prisma.meet.findUniqueOrThrow({ where: { id: meetId } });
  const events = (meet.events as unknown as MeetEvent[]) ?? [];
  const event = events[index];
  if (!event) throw new Error("Event not found.");

  events[index] = { ...event, actualTimeSeconds, splits, reactionTime };
  await prisma.meet.update({ where: { id: meetId }, data: { events: toJson(events) } });

  await recordBestTime({
    swimmerId: meet.swimmerId,
    stroke: event.stroke,
    distance: event.distance,
    timeSeconds: actualTimeSeconds,
    context: "Meet",
    date: meet.date,
  });

  revalidatePath(`/meets/${meetId}`);
  revalidatePath("/best-times");
}

export async function updateSwimmerProfile(formData: FormData) {
  const swimmerId = String(formData.get("swimmerId") || "");
  const name = String(formData.get("name") || "").trim();
  const age = Number(formData.get("age"));
  const squad = String(formData.get("squad") || "").trim();
  const primaryStroke = String(formData.get("primaryStroke") || "");
  const competitionCategory = String(formData.get("competitionCategory") || "").trim();
  const seasonGoal = String(formData.get("seasonGoal") || "").trim() || null;

  if (!swimmerId || !name || !squad || !competitionCategory || !Number.isFinite(age) || age <= 0) {
    throw new Error("Please fill in all required swimmer fields.");
  }

  await prisma.swimmer.update({
    where: { id: swimmerId },
    data: { name, age, squad, primaryStroke, competitionCategory, seasonGoal },
  });

  revalidatePath("/profile");
  revalidatePath("/", "layout");
}
