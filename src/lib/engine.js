import { OBSTACLES } from '../data/obstacles.js'

export const TIER_POINTS = { red: 0, amber: 0.5, green: 1 }

const round1 = (n) => Math.round(n * 10) / 10

/** Epley estimated one-rep max. A true single returns the weight itself. */
export function e1rm(weight, reps) {
  if (!weight || !reps) return 0
  if (reps <= 1) return weight
  return weight * (1 + reps / 30)
}

/** Value one source yields for one workout entry, or null if not applicable. */
export function sourceValue(entry, source) {
  if (entry.exercise !== source.exercise) return null
  const factor = source.factor ?? 1
  let best = null
  for (const { reps, weight } of entry.sets ?? []) {
    let v = null
    switch (source.calc) {
      case 'e1rm':
        v = reps > 0 && weight > 0 ? e1rm(weight, reps) : null
        break
      case 'weight':
        v = reps >= (source.minReps ?? 1) && weight > 0 ? weight : null
        break
      case 'carry':
        v = reps >= (source.minDistance ?? 0) && weight > 0 ? weight : null
        break
      case 'value':
        v = Number.isFinite(reps) && reps > 0 ? reps : null
        break
      default:
        v = null
    }
    if (v != null && (best == null || v > best)) best = v
  }
  return best == null ? null : best * factor
}

const isBetter = (a, b, better) => (better === 'lower' ? a < b : a > b)

/** Best value for an obstacle per session date, sorted oldest → newest. */
export function obstacleTimeline(obstacle, entries) {
  const byDate = new Map()
  const better = obstacle.metric.better
  for (const entry of entries) {
    for (const source of obstacle.sources) {
      const v = sourceValue(entry, source)
      if (v == null) continue
      const prev = byDate.get(entry.date)
      if (prev == null || isBetter(v, prev, better)) byDate.set(entry.date, v)
    }
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value: round1(value) }))
}

export function tierFor(value, obstacle) {
  if (value == null) return 'red'
  const { survive, thrive } = obstacle
  const meets = (target) => (obstacle.metric.better === 'lower' ? value <= target : value >= target)
  if (meets(thrive)) return 'green'
  if (meets(survive)) return 'amber'
  return 'red'
}

/**
 * Evaluate one obstacle → ReadinessResult.
 * currentValue is the best result ever logged (null if untested);
 * benchmark is the thrive target; gap is how far short of it (0 when met).
 */
export function evaluateObstacle(obstacle, entries) {
  const timeline = obstacleTimeline(obstacle, entries)
  const better = obstacle.metric.better
  let current = null
  let lastTested = null
  for (const p of timeline) {
    if (current == null || isBetter(p.value, current, better)) current = p.value
    lastTested = p.date
  }
  const tier = tierFor(current, obstacle)
  const shortBy = (target) =>
    current == null ? null : round1(Math.max(0, better === 'lower' ? current - target : target - current))
  return {
    obstacleId: obstacle.id,
    tier,
    currentValue: current,
    benchmark: obstacle.thrive,
    survive: obstacle.survive,
    gap: shortBy(obstacle.thrive),
    gapToSurvive: shortBy(obstacle.survive),
    lastTested,
    tested: current != null,
  }
}

export function evaluateAll(entries, obstacles = OBSTACLES) {
  return obstacles.map((o) => evaluateObstacle(o, entries))
}

/** Overall readiness = Σ tier points / number of obstacles (0–1). */
export function overallScore(results) {
  if (!results.length) return 0
  const total = results.reduce((sum, r) => sum + TIER_POINTS[r.tier], 0)
  return total / results.length
}

export function tierCounts(results) {
  const counts = { red: 0, amber: 0, green: 0 }
  for (const r of results) counts[r.tier]++
  return counts
}
