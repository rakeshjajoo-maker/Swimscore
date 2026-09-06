# SwimScore — Build Prompt for Claude Code

The original build prompt used to scaffold this project, kept here so future
milestones have the full spec without needing the source PDF.

## Prompt

I want to build a web app called **SwimScore** — a training and
progress-tracking system for competitive swimmers (not casual/recreational
swimmers). It's used by swimmers who are actively preparing for
competitions, to log their daily practices, track a computed performance
score, log personal best times, and view analytics on their progress and
consistency.

Build this as a full-stack web app. Use **Next.js (App Router) + TypeScript +
Tailwind CSS** for frontend, **Prisma + SQLite** for the database (so it runs
locally with zero setup), and **Recharts** for all graphs. Keep the
architecture simple and modular so features can be added incrementally.

Set up the project yourself (scaffold, install dependencies, initialize the
Prisma schema, set up git) — don't ask me to run setup commands manually.

## Data Model (Prisma schema)

Create these models:

### Swimmer

id, name, age, squad/group (string), primaryStroke (enum: Free/Back/Breast/Fly/IM),
competitionCategory (string, e.g. "100m Free specialist"), seasonGoal (string, optional)

### Session (one practice day)

id, swimmerId, date, sessionType (enum: Regular/Taper/MeetWarmup)
totalMeters (auto-calculated from child Sets, not manually entered)
preMood, postMood (int 1-5, optional)
attended (boolean), skipReason (string, optional, only if attended = false)

### Set (belongs to a Session — the atomic training unit)

id, sessionId, setType (enum: WarmUp/Drill/Kick/Pull/Main/Sprint/CoolDown)
reps (int), distancePerRep (int, meters), stroke (enum: Free/Back/Breast/Fly/IM/Choice)
intervalSeconds (int, optional — target send-off time)
equipment (enum array: Fins/Paddles/Snorkel/Buoy/None)
actualTimesSeconds (array of numbers, optional — one per rep, if timed)
rpe (int 1-10, optional — self-rated effort for this set)
notes (string, optional)

### BestTime (separate log, always swimmer-accessible)

id, swimmerId, stroke, distance (int, meters), timeSeconds (float)
context (enum: Practice/TimeTrial/Meet), date
isPB (boolean — computed at insert time by comparing against existing bests for that stroke+distance)

### Meet

id, swimmerId, name, date
events (JSON array: { stroke, distance, goalTimeSeconds, actualTimeSeconds, splits: number[], reactionTime: number })

### SwimScoreSnapshot (computed, stored per week for history/trend charts)

id, swimmerId, weekStartDate
volumeScore, consistencyScore, effortAlignmentScore, timeTrendScore, techniqueScore (all 0-100)
compositeScore (weighted average, 0-100)

## Core Features to Build (in this order — treat each as a milestone)

### Milestone 1 — Core Logging

- Swimmer registration/profile page (simple form, no auth needed for v1 —
  assume single-user or a basic swimmer picker/dropdown)
- "Log a Session" page: add a session, then add multiple Sets to it in a
  whiteboard-style quick-entry UI (reps × distance × stroke @ interval,
  matching how coaches write practice — e.g. "10 × 200 Free @ 3:00")
- Auto-calculate and display totalMeters for the session as sets are added
- Session history list view (chronological, most recent first), each
  showing date, type, total meters, and a one-line summary of sets

### Milestone 2 — SwimScore Calculation

- Add RPE input (1-10 slider or number input) per set
- Build a scoring function that computes weekly SwimScoreSnapshot from:
  - volumeScore: total meters that week vs swimmer's own trailing 4-week average
  - consistencyScore: sessions attended / sessions expected that week
  - effortAlignmentScore: how closely RPE matched expected intensity per set
    type (e.g. WarmUp/CoolDown expected low RPE, Main/Sprint expected high RPE)
  - timeTrendScore: recent BestTime improvements vs stagnation, per stroke
  - techniqueScore: leave as a manual input for now (1-100, swimmer or coach
    self-rated) — can be a placeholder field until a technique-rating UI is
    built later
  - compositeScore: weighted average of the above (make weights configurable
    constants, not hardcoded magic numbers, so they're easy to tune later)
- Display today's/this week's composite SwimScore prominently on a
  dashboard/home page

### Milestone 3 — Best Times Log (separate, always accessible)

- A dedicated "My Best Times" page, separate from session logging
- Quick-entry form: stroke, distance, time, context (Practice/TimeTrial/Meet), date
- On insert, automatically check if this beats the current PB for that
  stroke+distance combination; if so, flag it and update the "current PB" view
- "My Bests" summary view: one card per stroke+distance combination showing
  current PB and date achieved
- Tap into any event card → full chronological history of every time ever
  logged for that specific stroke+distance, rendered as a line chart (time
  on Y-axis, descending = improvement, date on X-axis)

### Milestone 4 — Analytics & Graphs Section

Build a dedicated "Analytics" page with four tabs:

- **Volume & Consistency**: bar chart of meters per week/month; a calendar
  heatmap (GitHub-contributions style) showing daily training volume
  intensity by color; attendance rate over time as a line chart
- **Performance Trends**: per-event line graphs pulling from BestTime
  history; a time-drop-rate summary (average seconds improved per month,
  per stroke)
- **Effort & Mood**: RPE distribution histogram (actual RPE per set type vs
  the expected RPE band); mood trend line chart (preMood and postMood
  plotted over weeks)
- **Composite SwimScore**: line chart of compositeScore over time; a
  radar/spider chart showing the current breakdown of the five sub-scores
  (volume, consistency, effort alignment, time trend, technique) side by side

### Milestone 5 — Competition Features

- Meet entry form: create a Meet, add events with goal times
- Post-meet results entry: actual time, splits per event, reaction time
- Meet results view: goal vs actual comparison, split breakdown chart
- "Taper Mode" flag on Session: when a session's sessionType = Taper,
  exclude it from the normal volumeScore expectation curve (since tapering
  intentionally reduces volume) so the score doesn't unfairly penalize the
  swimmer in the two weeks before a meet

### Milestone 6 — Swimmer Profile Page

- A dedicated "Profile" page the swimmer can open any time, separate from
  the dashboard/analytics
- Shows: name, age, squad/group, primary stroke, competition category, season goal
- Editable fields (simple form, update in place)
- Quick-glance summary cards at the top of the profile: current composite
  SwimScore, current PB count, total meters logged this season, current
  logging streak (days in a row)
- A "Personal Bests" mini-table (compact version of the Best Times summary
  from Milestone 3) so the swimmer can see their key numbers without
  leaving the profile
- This page should feel like the swimmer's "identity card" in the app —
  everything about who they are and where they stand, in one scroll, no
  digging required

## Design Notes

This is for serious young competitive athletes (teens) — keep the UI clean,
fast to use after a tiring practice, mobile-first (most logging will happen
on a phone right after getting out of the pool).

Logging a full session should take under a minute — minimize typing, favor
number steppers/dropdowns over free text wherever possible.

**Color scheme**: light blue as the primary/base color (backgrounds,
headers, primary buttons — evokes pool water, keeps it calm and legible)
paired with **coral/orange** as the accent color (used for CTAs, score
highlights, PB flags, streak indicators — gives energy and contrast without
turning into another generic blue SaaS look). Use a near-white or very light
grey for card backgrounds so the light blue doesn't wash everything out.
Reserve coral specifically for "achievement" moments — new PB, score
improvement, streak milestone — so it carries meaning rather than being
decorative.

Don't build authentication/multi-user support yet — assume single swimmer or
a simple swimmer-switcher dropdown for now; structure the data model so
multi-user auth can be added later without a schema rewrite.

## Working Style Instructions (Claude Code specific)

- Work through the milestones one at a time, in order. After finishing each
  milestone: run the dev server, verify it builds without errors, seed some
  sample data so I can actually see it working, then stop and summarize
  what you built before moving to the next milestone.
- Commit to git after each milestone is verified working, with a clear
  commit message (e.g. "Milestone 1: core session logging").
- If you hit a design decision I haven't specified (exact field validation
  rules, exact chart library config, etc.), make a reasonable choice
  yourself and note what you decided — don't stop to ask unless it's a
  genuinely ambiguous product decision.
- Don't attempt all six milestones in a single pass.
