# Spartan Readiness Tracker: Handoff

This document is the project brief, what has been built, and what is still open. Read it first if you are picking this project up.

**Live site:** https://benjsteele.github.io/spartan-warrior/
**Repo:** https://github.com/benjsteele/spartan-warrior
**Deploys from:** `main` (GitHub Actions, `.github/workflows/deploy.yml`)

---

## 1. Goal

A web app that takes a workout log (manual entry or CSV import) and produces a per-obstacle readiness score with clear pass/fail benchmarks. It tells the user whether she is on track for a Spartan Sprint (5 km, 20 obstacles) in 2026.

- **User:** Noelle. She follows a gym plan, logs workouts in a phone app, and needs lightweight, objective checkpoints.
- **Event:** 2026 Ireland Spartan Sprint, 5 km / 20 obstacles. The race date is not yet known and must be entered in Settings.
- **Hosting:** GitHub Pages. No backend. All data persists in the browser's `localStorage`.
- **Priority:** mobile first. Noelle will use it on her phone at the gym.

## 2. Source data: Noelle's training log

Loaded automatically on first visit (or via Settings → *Load Noelle's log*). Defined in `src/data/seedLog.js`.

| Exercise | Latest date | Best working sets |
|---|---|---|
| Single Arm Bent Over KB Row | 2 Oct 2026 | 5×8 @ 16 kg |
| Bench Press | 25 Sep 2026 | 1×1 @ 45 kg |
| Deadlift | 21 Sep 2026 | 1×1 @ 80 kg |
| Bent Over Row | 10 Jul 2026 | 3×12 @ 12 kg |
| Farmer's Carry | 10 Jul 2026 | 3×90 @ 16 kg |
| Dumbbell Bench Press | 3 Jul 2026 | 4×7 @ 12.5 kg |
| Glute Bridge | 29 Jun 2026 | 5×10 @ 45 kg |
| Front Rack Reverse Lunge | 22 Jun 2026 | 4×8 @ 15 kg |
| Sumo Deadlift | 18 Jun 2026 | 2×5 @ 55 kg |
| Back Squat | 15 Jun 2026 | 2×1 @ 55 kg |
| Skull Crusher | 12 Jun 2026 | 5×10 @ 8 kg |
| Romanian Deadlift (RDL) | 8 Jun 2026 | 5×8 @ 25 kg |
| Rear Foot Elevated Split Squat | 4 Jun 2026 | 2×6 @ 12 kg |

## 3. Obstacle benchmarks (female standards)

All 20 obstacles are defined in `src/data/obstacles.js`. Each has a **survive** threshold (amber) and a **thrive** threshold (green).

**Loaded carries:** Atlas Carry, Bucket Brigade, Sandbag Carry, Farmer's Carry, Hercules Hoist, Plate Drag.
**Grip and upper body:** Multi-Rig, Monkey Bars, Twister, Inverted Wall, Over-Under-Through, A-Frame Cargo.
**Walls and climbing:** Rope Climb (4.8 m J-hook), Walls (6–8 ft), Slip Wall.
**Skill and penalty:** Spear Throw, Barbed Wire Crawl, Burpee Penalty.
**Run and endurance:** 5 km Trail Run (under 45 min), 30-min Distance (survive over 5 km, thrive over 7 km).

## 4. Scoring

- **Red (0 pts):** not ready. Below the survive benchmark, or untested.
- **Amber (0.5 pts):** developing. Meets survive but not thrive.
- **Green (1 pt):** race ready. Meets or exceeds thrive.
- **Overall score:** sum of tier points ÷ 20. Shown as a percentage.

Noelle's current score from the seed log is **33%** (3 green, 7 amber, 10 red). The 10 reds are obstacles the gym log cannot measure (grip, climbing, spear, burpees, running). They need monthly self-tests.

### How each obstacle reads the log

Defined per obstacle in `src/data/obstacles.js` under `sources`. The `calc` field picks the method:

| `calc` | Meaning |
|---|---|
| `e1rm` | Estimated one-rep max, Epley formula: `w × (1 + reps/30)` |
| `weight` | Heaviest weight lifted for at least `minReps` reps |
| `carry` | Heaviest per-hand load carried at least `minDistance` metres |
| `value` | A monthly self-test result (stored in the `reps` field) |

Strength-based thresholds are **proxies**. They estimate the strength an obstacle needs; they don't measure the obstacle. Where a proxy is used, the card says what it is measured from.

## 5. Technical decisions

| Area | Choice | Why |
|---|---|---|
| Frontend | React 19 + Vite 8 + Tailwind 4 | Fast builds, small output |
| Persistence | `localStorage` (`src/lib/storage.js`) | GitHub Pages has no backend |
| Charts | Recharts, lazy-loaded | Heaviest dependency, so only fetched on the Progress page |
| CSV | PapaParse | Handles quoted fields and auto-detects delimiters |
| Routing | `HashRouter` | Refreshing a deep link on Pages never 404s |
| Base path | `/${repo}/` from `GITHUB_REPOSITORY` in `vite.config.js` | Assets load under the project-page URL, and survive a rename |
| Deploy | `actions/upload-pages-artifact` + `actions/deploy-pages` | Official Pages flow, no `gh-pages` branch to manage |
| Node | 22 in CI | Vite 8 needs Node 20.19 or newer |

### Data model

```ts
interface WorkoutEntry {
  id: string;
  exercise: string;   // normalised to the catalogue name
  date: string;       // YYYY-MM-DD
  sets: { reps: number; weight: number }[];
  // Self-tests: the measured value is in reps; weight is 0.
}
interface ReadinessResult {
  obstacleId: string;
  tier: 'red' | 'amber' | 'green';
  currentValue: number | null;  // best ever logged; null if untested
  benchmark: number;            // thrive target
  survive: number;
  gap: number | null;           // shortfall to thrive
  gapToSurvive: number | null;
  lastTested: string | null;
  tested: boolean;
}
```

Self-test exercises are defined in `src/data/exercises.js` with `kind: 'test'`, a unit, and a `better` direction (`higher` or `lower`).

## 6. Code map

```
src/
  App.jsx                 HashRouter, nav shell, lazy-loads Progress
  state.jsx               DataProvider: entries + settings, derived results
  main.jsx, index.css
  data/
    exercises.js          catalogue, aliases, self-test definitions
    obstacles.js          20 obstacles: benchmarks, sources, tips
    seedLog.js            Noelle's log
  lib/
    engine.js             tier logic, e1RM, timelines, overall score
    normalize.js          exercise-name matching, set notation, date parsing
    csv.js                CSV parse, column guessing, rows → entries
    schedule.js           due self-tests, 4-weekly checkpoints
    format.js             dates, set summaries, tier styling
    storage.js            localStorage hook, merge + de-dupe
  components/
    Countdown.jsx, Gauge.jsx, ObstacleCard.jsx, ui.jsx
  pages/
    Dashboard.jsx, LogPage.jsx, ImportPage.jsx, ProgressPage.jsx, SettingsPage.jsx
  __tests__/
    engine.test.js        benchmarks, tier logic, seed-log expectations
    import.test.js        name/date/set parsing, CSV import
```

## 7. Status

**Done**
- [x] Scaffold (React, Vite, Tailwind, Vitest)
- [x] `base` path and HashRouter
- [x] Benchmark model and 20 obstacles
- [x] Workout and self-test entry with localStorage persistence
- [x] CSV importer with column mapping, dedupe and error reporting
- [x] Readiness engine and dashboard (RAG cards, overall gauge, filters)
- [x] Progress chart with survive and thrive lines, plus a data table
- [x] Race countdown, 4-weekly checkpoints, due self-test reminders
- [x] JSON backup and restore, CSV export
- [x] GitHub Actions deploy, live at the URL above
- [x] Tests: 11 passing (`npm test`)
- [x] Checked at phone width (390 px) under the Pages base path

**Open**
- [ ] **Race date** is not set. Noelle needs to enter it in Settings. The countdown and checkpoints depend on it.
- [ ] **Benchmarks need review.** The brief listed about 13 standards for 20 obstacles. The rest, and all proxy mappings, are estimates. Confirm them with Noelle's coach or the official Spartan female standards before relying on them.
- [ ] **Self-test habit.** Ten obstacles can only be scored from self-tests. Until she logs them, her score stays low.
- [ ] **Data lives in one browser.** No sync between devices. Back up regularly from Settings.
- [ ] **Chart bundle size.** The Progress chunk is about 360 kB (105 kB gzipped). Acceptable, but worth watching.
- [ ] **Node 20 deprecation warning** in the deploy log (`actions/deploy-pages@v4` runs on Node 24). Harmless for now. Bump the action when a newer major is released.

## 8. Running it

```bash
npm install
npm run dev        # http://localhost:5173/spartan-warrior/
npm test           # vitest
npm run build      # output in dist/
npm run preview    # serves dist/ at http://localhost:4173/spartan-warrior/
```

**Deploy:** push to `main`. The workflow runs tests, builds, and publishes. Repo setting required once: Settings → Pages → Source: **GitHub Actions**.

**Formatting:** Prettier config in `.prettierrc.json` (no semicolons, single quotes, width 120).

## 9. Changing the benchmarks

Edit `src/data/obstacles.js`. Each entry looks like this:

```js
{
  id: 'atlas-carry',
  name: 'Atlas Carry',
  category: 'carry',
  metric: { label: 'Deadlift e1RM', unit: 'kg', better: 'higher' },
  sources: [{ exercise: 'Deadlift', calc: 'e1rm' }],
  survive: 60,
  thrive: 80,
  tip: '…',
}
```

- For run times, set `better: 'lower'` and make `thrive < survive`.
- To add a source exercise, add it to `src/data/exercises.js` first. `engine.test.js` checks that every source resolves.
- After changing thresholds, update the expectations in `src/__tests__/engine.test.js` if they assert specific tiers.

## 10. Known limitations

- Exercise-name matching is alias-based. Unrecognised names are kept as typed and shown as "not scored".
- Day-first dates are assumed for ambiguous numeric dates (for example `04/06/2026` is 4 June). A month-first date is accepted only when day-first is impossible.
- Dates without a year take the most recent past occurrence.
- Imported CSV rows are grouped by exercise and date into one session. Two sessions of the same lift on the same day merge.
- Restoring a backup replaces all current entries. There is no merge option.
