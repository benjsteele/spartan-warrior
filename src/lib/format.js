const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const toUTC = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Whole days from a → b (both YYYY-MM-DD). */
export const daysBetween = (a, b) => Math.round((toUTC(b) - toUTC(a)) / 86400000)

export function formatDate(iso, { weekday = false, year = false } = {}) {
  if (!iso) return '—'
  const dt = new Date(toUTC(iso))
  const s = `${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()]}`
  return `${weekday ? DAYS[dt.getUTCDay()] + ' ' : ''}${s}${year ? ' ' + dt.getUTCFullYear() : ''}`
}

export const fmtNum = (n) => (n == null ? '—' : Number.isInteger(n) ? String(n) : n.toFixed(1))

/** Compress sets into "5×8 @ 16 kg" style, grouping identical consecutive sets. */
export function summariseSets(sets, kind = 'strength', unit = '') {
  if (!sets?.length) return ''
  if (kind === 'test') return `${fmtNum(Math.max(...sets.map((s) => s.reps)))} ${unit}`.trim()
  const groups = []
  for (const s of sets) {
    const last = groups[groups.length - 1]
    if (last && last.reps === s.reps && last.weight === s.weight) last.n++
    else groups.push({ ...s, n: 1 })
  }
  const repUnit = kind === 'carry' ? ' m' : ''
  return groups
    .map((g) => `${g.n}×${fmtNum(g.reps)}${repUnit}${g.weight ? ` @ ${fmtNum(g.weight)} kg` : ''}`)
    .join(', ')
}

export const TIER_STYLE = {
  green: {
    label: 'Race Ready',
    short: 'Ready',
    icon: '✓',
    badge: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/40',
    bar: 'bg-emerald-500',
    dot: 'bg-emerald-400',
  },
  amber: {
    label: 'Developing',
    short: 'Developing',
    icon: '◐',
    badge: 'bg-amber-500/15 text-amber-300 ring-amber-500/40',
    bar: 'bg-amber-400',
    dot: 'bg-amber-400',
  },
  red: {
    label: 'Not Ready',
    short: 'Not ready',
    icon: '✕',
    badge: 'bg-rose-500/15 text-rose-300 ring-rose-500/40',
    bar: 'bg-rose-500',
    dot: 'bg-rose-400',
  },
}
