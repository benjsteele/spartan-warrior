import { describe, expect, it } from 'vitest'
import { OBSTACLES } from '../data/obstacles.js'
import { EXERCISE_BY_NAME } from '../data/exercises.js'
import { seedEntries } from '../data/seedLog.js'
import { e1rm, evaluateAll, evaluateObstacle, overallScore, tierCounts } from '../lib/engine.js'

const byId = (id) => OBSTACLES.find((o) => o.id === id)

describe('benchmarks', () => {
  it('defines exactly 20 obstacles with unique ids', () => {
    expect(OBSTACLES).toHaveLength(20)
    expect(new Set(OBSTACLES.map((o) => o.id)).size).toBe(20)
  })

  it('only references catalogued exercises and orders survive/thrive correctly', () => {
    for (const o of OBSTACLES) {
      for (const s of o.sources) expect(EXERCISE_BY_NAME[s.exercise], `${o.id} → ${s.exercise}`).toBeDefined()
      if (o.metric.better === 'lower') expect(o.thrive).toBeLessThan(o.survive)
      else expect(o.thrive).toBeGreaterThan(o.survive)
    }
  })
})

describe('engine', () => {
  it('e1rm returns the weight for a single and Epley otherwise', () => {
    expect(e1rm(80, 1)).toBe(80)
    expect(e1rm(55, 5)).toBeCloseTo(64.17, 1)
  })

  it('marks untested obstacles red with no value', () => {
    const r = evaluateObstacle(byId('rope-climb'), [])
    expect(r).toMatchObject({ tier: 'red', tested: false, currentValue: null })
  })

  it('handles lower-is-better run times', () => {
    const run = (min) => [{ id: 'x', exercise: '5 km Run', date: '2026-09-01', sets: [{ reps: min, weight: 0 }] }]
    expect(evaluateObstacle(byId('5km-trail-run'), run(50)).tier).toBe('red')
    expect(evaluateObstacle(byId('5km-trail-run'), run(42)).tier).toBe('amber')
    const green = evaluateObstacle(byId('5km-trail-run'), run(36))
    expect(green.tier).toBe('green')
    expect(green.gap).toBe(0)
  })

  it("scores Noelle's seed log", () => {
    const results = evaluateAll(seedEntries())
    const tier = (id) => results.find((r) => r.obstacleId === id).tier
    expect(tier('atlas-carry')).toBe('green') // 80 kg deadlift
    expect(tier('farmers-carry')).toBe('amber') // 16 kg/hand
    expect(tier('bucket-brigade')).toBe('green') // 16×1.6 = 25.6
    expect(tier('sandbag-carry')).toBe('amber') // 55 kg squat
    expect(tier('over-under-through')).toBe('green') // 45 kg bench
    expect(tier('hercules-hoist')).toBe('amber') // 16 kg row ×8
    expect(tier('rope-climb')).toBe('red') // untested
    const counts = tierCounts(results)
    expect(counts.green + counts.amber + counts.red).toBe(20)
    expect(overallScore(results)).toBeCloseTo((counts.green + counts.amber * 0.5) / 20)
  })
})
