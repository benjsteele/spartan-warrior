import { EXERCISES } from '../data/exercises.js'

const squash = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const ALIAS_INDEX = new Map()
for (const ex of EXERCISES) {
  ALIAS_INDEX.set(squash(ex.name), ex.name)
  for (const a of ex.aliases ?? []) ALIAS_INDEX.set(squash(a), ex.name)
}

const titleCase = (s) =>
  s
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1))

/** Map a free-text exercise name onto the catalogue, or tidy it up if unknown. */
export function normaliseExercise(raw) {
  const key = squash(raw)
  if (!key) return ''
  if (ALIAS_INDEX.has(key)) return ALIAS_INDEX.get(key)
  // Strip a trailing equipment qualifier, e.g. "Deadlift (Barbell)"
  const withoutParens = squash(String(raw).replace(/\([^)]*\)/g, ''))
  if (ALIAS_INDEX.has(withoutParens)) return ALIAS_INDEX.get(withoutParens)
  return titleCase(String(raw))
}

/**
 * Parse set notation such as "5×8 @ 16 kg", "3x12@12kg", "1 x 1 @ 45" or
 * "8 @ 20kg" (single set). Returns an array of { reps, weight } or null.
 */
export function parseSetNotation(text, { lbs = false } = {}) {
  if (text == null) return null
  const s = String(text).trim().toLowerCase()
  const m = s.match(/^(?:(\d+)\s*[x×*]\s*)?(\d+(?:\.\d+)?)\s*(?:reps?)?\s*(?:@\s*(\d+(?:\.\d+)?)\s*(kg|kgs|lb|lbs)?)?$/)
  if (!m) return null
  const count = m[1] ? parseInt(m[1], 10) : 1
  const reps = parseFloat(m[2])
  let weight = m[3] ? parseFloat(m[3]) : 0
  const unit = m[4]
  if ((unit && unit.startsWith('lb')) || (!unit && lbs)) weight = lbToKg(weight)
  if (!count || count > 50 || !Number.isFinite(reps)) return null
  return Array.from({ length: count }, () => ({ reps, weight }))
}

export const lbToKg = (lb) => Math.round(lb * 0.45359237 * 10) / 10

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

const pad = (n) => String(n).padStart(2, '0')
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`

function valid(y, m, d) {
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

/** Today's date as YYYY-MM-DD in local time. */
export function todayISO(now = new Date()) {
  return iso(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

/**
 * Parse a date into YYYY-MM-DD. Handles ISO (with optional time),
 * day-first numeric dates (dd/mm/yyyy — the Irish/UK convention),
 * "Fri, Oct 02", "Oct 2 2026", "2 Oct 2026". Dates without a year take the
 * most recent occurrence on or before `today`.
 */
export function parseDate(raw, today = todayISO()) {
  if (raw == null) return null
  const s = String(raw).trim()
  if (!s) return null

  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) {
    const [y, mo, d] = [+m[1], +m[2], +m[3]]
    return valid(y, mo, d) ? iso(y, mo, d) : null
  }

  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/)
  if (m) {
    let [d, mo, y] = [+m[1], +m[2], +m[3]]
    if (y < 100) y += 2000
    // Fall back to month-first if day-first is impossible (e.g. 06/15/2026)
    if (!valid(y, mo, d) && valid(y, d, mo)) [d, mo] = [mo, d]
    return valid(y, mo, d) ? iso(y, mo, d) : null
  }

  const lower = s.toLowerCase().replace(/^(mon|tue|wed|thu|fri|sat|sun)[a-z]*,?\s*/, '')
  let mo, d, y
  m = lower.match(/^([a-z]{3})[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?/)
  if (m) {
    mo = MONTHS.indexOf(m[1]) + 1
    d = +m[2]
    y = m[3] ? +m[3] : null
  } else {
    m = lower.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3})[a-z]*\.?,?\s*(\d{4})?/)
    if (!m) return null
    d = +m[1]
    mo = MONTHS.indexOf(m[2]) + 1
    y = m[3] ? +m[3] : null
  }
  if (mo < 1) return null
  if (y == null) {
    y = +today.slice(0, 4)
    if (iso(y, mo, d) > today) y -= 1
  }
  return valid(y, mo, d) ? iso(y, mo, d) : null
}
