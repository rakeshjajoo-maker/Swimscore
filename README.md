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
- [ ] Milestone 3 — Best times log
- [ ] Milestone 3 — Best times log
- [ ] Milestone 4 — Analytics & graphs
- [ ] Milestone 5 — Competition features
- [ ] Milestone 6 — Swimmer profile page

## Notes

- No authentication yet — the app assumes a single user with a simple
  swimmer switcher (top-right of the header), stored in a cookie. The data
  model is structured so multi-user auth can be added later without a
  schema rewrite.
- SQLite has no native enum or array types in Prisma, so those fields are
  stored as `String` / `Json` and constrained by the TypeScript unions in
  `lib/types.ts`.
