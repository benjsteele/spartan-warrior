import { SELF_TESTS } from '../data/exercises.js'
import { daysBetween } from './format.js'

const addDays = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + n))
  return dt.toISOString().slice(0, 10)
}

/**
 * Monthly checkpoints: every 4 weeks counting back from race day, so the
 * last one lands a month out. Without a race date: the 1st of next month.
 */
export function nextCheckpoint(today, raceDate) {
  if (raceDate && raceDate > today) {
    let cp = raceDate
    while (addDays(cp, -28) >= today) cp = addDays(cp, -28)
    return cp === raceDate ? null : cp
  }
  const [y, m] = today.split('-').map(Number)
  return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10)
}

/** Self-tests that are due: never logged, or last logged ≥ interval days ago. */
export function dueSelfTests(entries, today, intervalDays = 30) {
  const last = {}
  for (const e of entries) {
    if (!last[e.exercise] || e.date > last[e.exercise]) last[e.exercise] = e.date
  }
  return SELF_TESTS.map((t) => {
    const lastDate = last[t.name] ?? null
    const age = lastDate ? daysBetween(lastDate, today) : null
    return { test: t, lastDate, age, due: age == null || age >= intervalDays }
  }).filter((x) => x.due)
}
