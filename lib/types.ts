export const STROKES = ["Free", "Back", "Breast", "Fly", "IM"] as const;
export type Stroke = (typeof STROKES)[number];

export const SET_STROKES = ["Free", "Back", "Breast", "Fly", "IM", "Choice"] as const;
export type SetStroke = (typeof SET_STROKES)[number];

export const SESSION_TYPES = ["Regular", "Taper", "MeetWarmup"] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

export const SET_TYPES = [
  "WarmUp",
  "Drill",
  "Kick",
  "Pull",
  "Main",
  "Sprint",
  "CoolDown",
] as const;
export type SetType = (typeof SET_TYPES)[number];

export const EQUIPMENT = ["Fins", "Paddles", "Snorkel", "Buoy", "None"] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const BEST_TIME_CONTEXTS = ["Practice", "TimeTrial", "Meet"] as const;
export type BestTimeContext = (typeof BEST_TIME_CONTEXTS)[number];

export interface MeetEvent {
  stroke: Stroke;
  distance: number;
  goalTimeSeconds?: number;
  actualTimeSeconds?: number;
  splits?: number[];
  reactionTime?: number;
}
