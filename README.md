# Spartan Readiness Tracker

A mobile-first web app that turns a workout log into a per-obstacle readiness score for a
**Spartan Sprint (5 km, 20 obstacles)**, using female standards. Built with React + Vite + Tailwind,
hosted on GitHub Pages, and with no backend: all data lives in the browser's `localStorage`.

## Features

- **Readiness dashboard** shows 20 obstacle cards with a red/amber/green status, current value vs survive/thrive
  benchmarks, the gap to target and stale-data warnings. An overall gauge shows Σ tier points ÷ 20.
- **Log** gym sessions (sets × reps × kg, or quick-fill `5x8 @ 16`) and monthly self-tests
  (dead hang, pull-ups, rope climb, rig rungs, wall climb, spear, burpees, bucket carry, 5 km, 30-min run).
- **CSV import** works from a pasted CSV or a file, with column mapping auto-detected for common app exports (one row per set)
  or summary tables (`5×8 @ 16 kg`), lb → kg conversion, duplicate skipping and per-row error reporting.
- **Progress chart** plots each obstacle's metric over time with survive/thrive reference lines.
- **Race countdown** and 4-weekly self-test checkpoints, with reminders for self-tests that are due.
- **Backup / restore** (JSON) and CSV export from Settings.

Noelle's training log is preloaded on first visit (Settings → *Load Noelle's log* re-adds it).

## How scoring works

Benchmarks and the exercise → obstacle mapping live in [`src/data/obstacles.js`](src/data/obstacles.js).
Each obstacle reads one metric from one or more logged exercises:

| calc | meaning |
| --- | --- |
| `e1rm` | estimated 1-rep max (Epley) |
| `weight` | heaviest weight lifted for ≥ `minReps` |
| `carry` | heaviest per-hand load carried ≥ `minDistance` m |
| `value` | a self-test result |

Meeting **thrive** is green (1 pt), meeting **survive** is amber (½ pt), and anything else, including untested, is red (0).
Strength-based thresholds are *proxies* for the obstacle; tune them in that file.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173/spartan-warrior/
npm test         # vitest: engine, CSV import, date/set parsing
npm run build
```

## Deploy to GitHub Pages

1. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main` (or run the workflow manually). `.github/workflows/deploy.yml` tests, builds and deploys `dist/`.
3. The site appears at `https://<user>.github.io/<repo>/`.

The GitHub Pages specifics are handled as follows:

- `vite.config.js` sets `base` to `/<repo-name>/`, taken from `GITHUB_REPOSITORY` in Actions (fallback `spartan-warrior`),
  so assets load if the repo is renamed.
- `HashRouter` keeps routes after `#`, so refreshing a deep link never 404s.
