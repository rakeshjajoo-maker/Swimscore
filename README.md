# SwimScore

A training and progress-tracking system for competitive swimmers. Swimmers log
daily practices, track a computed weekly performance score, log personal best
times, and view analytics on their progress and consistency.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS**, **Prisma +
SQLite**, and **Recharts**.

## Getting started

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db and applies the schema
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project status

Built milestone by milestone, per the build prompt in `docs/build-prompt.md`.

- [x] **Milestone 1 — Core Logging**: swimmer profile creation, "Log a
      Session" whiteboard-style set entry with live auto-calculated total
      meters, and chronological session history.
- [x] **Milestone 2 — SwimScore calculation**: weekly `SwimScoreSnapshot`
      computed from volume, consistency, effort alignment, time trend, and
      a manually-rated technique score, with configurable weights
      (`lib/scoring.ts`). This week's composite score is shown prominently
      on the home page.
- [x] **Milestone 3 — Best times log**: a dedicated "My Best Times" page
      with a quick-entry form (stroke/distance dropdowns, min:sec.hundredths
      time entry), automatic PB detection on insert, a "My Bests" summary
      grid, and a per-event detail page with a Recharts line chart of every
      time ever logged for that stroke+distance.
- [x] **Milestone 4 — Analytics & graphs**: a dedicated `/analytics` section
      with four tabs — Volume & Consistency (weekly bar chart, a
      GitHub-style calendar heatmap, attendance line chart), Performance
      Trends (per-event BestTime line charts and a seconds-improved-per-month
      summary per stroke), Effort & Mood (actual vs. expected RPE band per
      set type, pre/post mood trend), and Composite SwimScore (score over
      time, a radar chart of the five sub-scores). `lib/analytics.ts` holds
      the aggregation queries; historical `SwimScoreSnapshot` rows are
      backfilled on demand when the SwimScore tab is viewed.
- [x] **Milestone 5 — Competition features**: a `/meets` section — create a
      meet, add events with goal times, enter post-meet results (actual
      time, comma-separated splits, reaction time) with a goal-vs-actual
      comparison and a split breakdown chart per event. A result also
      records a `BestTime` (context `Meet`) through the same PB-detection
      helper Best Times uses, so a great meet swim shows up there too.
      Added "Taper Mode": a session with `sessionType: "Taper"` is excluded
      from both sides of `volumeScore`'s ratio (its own meters, and the
      trailing 4-week baseline), so intentionally cutting volume before a
      meet no longer tanks the score.
- [x] **Milestone 6 — Swimmer profile page**: a `/profile` page — the
      swimmer's "identity card" per the brief. Quick-glance stat cards
      (this week's composite SwimScore, personal-best count, all-time
      meters logged, current logging streak), an editable details form
      (name, age, squad, primary stroke, competition category, season
      goal), and a compact personal-bests table reusing the same
      `getCurrentBests` helper the Best Times page uses (refactored that
      page to share it instead of duplicating the grouping logic).

All six milestones from the build prompt are now built.

## Notes

- No authentication yet — the app assumes a single user with a simple
  swimmer switcher (top-right of the header), stored in a cookie. The data
  model is structured so multi-user auth can be added later without a
  schema rewrite.
- SQLite has no native enum or array types in Prisma, so those fields are
  stored as `String` / `Json` and constrained by the TypeScript unions in
  `lib/types.ts`.
- A bottom nav bar (Home / Best Times / Analytics / Meets) was added
  starting in Milestone 3 as the simplest scalable place to hang links to
  future sections (Profile next).
- `Meet.events` is a single Json array field rather than a child table, so
  adding/editing/deleting one event means reading the array, mutating it,
  and writing the whole array back - fine at meet-sized (a few events)
  scale.
- Recharts line charts use `type="linear"` rather than `"monotone"`: with
  sparse weekly data that jumps sharply (e.g. an inactive week next to a
  heavy training week), monotone's cubic smoothing can visually overshoot
  and make a correctly-connected line look disjointed.
- Two profile stats needed a judgment call since the spec didn't pin them
  down exactly: "meters logged this season" is shown as all-time, since
  there's no season concept in the data model yet; and "logging streak"
  counts consecutive days with an *attended* session (a logged-but-skipped
  day breaks it), with today itself not breaking an ongoing streak until
  the day is over without anything logged.
