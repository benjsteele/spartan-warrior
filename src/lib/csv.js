import Papa from 'papaparse'
import { normaliseExercise, parseDate, parseSetNotation, lbToKg, todayISO } from './normalize.js'
import { newId } from './storage.js'

export const FIELDS = [
  { key: 'exercise', label: 'Exercise', required: true },
  { key: 'date', label: 'Date', required: true },
  { key: 'notation', label: 'Sets text (e.g. "5×8 @ 16 kg")' },
  { key: 'sets', label: 'Number of sets' },
  { key: 'reps', label: 'Reps / distance / test value' },
  { key: 'weight', label: 'Weight' },
]

// Header names used by common workout apps (Strong, Hevy, FitNotes, …)
const HEADER_HINTS = {
  exercise: ['exercise', 'exercise name', 'exercise_title', 'movement', 'lift', 'name'],
  date: ['date', 'latest date', 'start_time', 'workout date', 'day', 'time'],
  notation: ['best working sets', 'working sets', 'best set', 'sets x reps', 'set summary', 'summary'],
  sets: ['sets', 'set count', 'no of sets', 'number of sets'],
  reps: ['reps', 'repetitions', 'rep', 'distance', 'value', 'distance_m', 'seconds', 'duration'],
  weight: ['weight', 'weight kg', 'weight_kg', 'load', 'kg', 'weight (kg)', 'weight lbs', 'weight_lbs', 'lbs'],
}

const squash = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

export function parseCsv(text) {
  const res = Papa.parse(String(text).trim(), {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  })
  // Tab-separated text pasted from a spreadsheet is auto-detected by PapaParse.
  return { headers: res.meta.fields ?? [], rows: res.data, errors: res.errors }
}

export function guessMapping(headers) {
  const mapping = {}
  const used = new Set()
  for (const field of Object.keys(HEADER_HINTS)) {
    const hints = HEADER_HINTS[field].map(squash)
    const match =
      headers.find((h) => !used.has(h) && hints.includes(squash(h))) ??
      headers.find((h) => !used.has(h) && hints.some((hint) => squash(h).startsWith(hint)))
    if (match) {
      mapping[field] = match
      used.add(match)
    }
  }
  return mapping
}

const num = (v) => {
  if (v == null || v === '') return null
  const n = parseFloat(
    String(v)
      .replace(',', '.')
      .replace(/[^0-9.\-]/g, ''),
  )
  return Number.isFinite(n) ? n : null
}

/**
 * Convert CSV rows into WorkoutEntry objects using a column mapping.
 * Rows for the same exercise + date are merged into one entry (so per-set
 * exports from phone apps become a single session).
 */
export function rowsToEntries(rows, mapping, { lbs = false, today = todayISO() } = {}) {
  const errors = []
  const groups = new Map()

  rows.forEach((row, i) => {
    const line = i + 2 // +1 for header, +1 for 1-based
    const exercise = normaliseExercise(row[mapping.exercise])
    if (!exercise) return errors.push({ line, message: 'Missing exercise' })
    const date = parseDate(row[mapping.date], today)
    if (!date) return errors.push({ line, message: `Unrecognised date "${row[mapping.date] ?? ''}"` })

    let sets = null
    if (mapping.notation && row[mapping.notation]) {
      sets = parseSetNotation(row[mapping.notation], { lbs })
      if (!sets) return errors.push({ line, message: `Could not read sets "${row[mapping.notation]}"` })
    } else {
      const reps = num(row[mapping.reps])
      let weight = num(row[mapping.weight]) ?? 0
      if (lbs) weight = lbToKg(weight)
      const count = Math.max(1, Math.round(num(row[mapping.sets]) ?? 1))
      if (reps == null) return errors.push({ line, message: 'Missing reps / value' })
      sets = Array.from({ length: Math.min(count, 50) }, () => ({ reps, weight }))
    }

    const key = `${exercise}|${date}`
    if (!groups.has(key)) groups.set(key, { id: newId(), exercise, date, sets: [] })
    groups.get(key).sets.push(...sets)
  })

  return { entries: [...groups.values()], errors }
}

export function entriesToCsv(entries) {
  const rows = []
  for (const e of entries) {
    for (const s of e.sets) rows.push({ date: e.date, exercise: e.exercise, reps: s.reps, weight: s.weight })
  }
  return Papa.unparse(rows, { columns: ['date', 'exercise', 'reps', 'weight'] })
}
