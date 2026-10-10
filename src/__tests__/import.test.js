import { describe, expect, it } from 'vitest'
import { normaliseExercise, parseDate, parseSetNotation } from '../lib/normalize.js'
import { guessMapping, parseCsv, rowsToEntries } from '../lib/csv.js'

describe('normalise', () => {
  it('maps aliases to canonical names', () => {
    expect(normaliseExercise('Romanian Deadlift (RDL)')).toBe('Romanian Deadlift')
    expect(normaliseExercise('Single Arm Bent Over KB Row')).toBe('Single Arm KB Row')
    expect(normaliseExercise('farmers walk')).toBe("Farmer's Carry")
    expect(normaliseExercise('Deadlift (Barbell)')).toBe('Deadlift')
    expect(normaliseExercise('cable fly')).toBe('Cable Fly')
  })

  it('parses set notation', () => {
    expect(parseSetNotation('5×8 @ 16 kg')).toEqual(Array(5).fill({ reps: 8, weight: 16 }))
    expect(parseSetNotation('3x12@12kg')).toHaveLength(3)
    expect(parseSetNotation('4×7 @ 12.5 kg')[0]).toEqual({ reps: 7, weight: 12.5 })
    expect(parseSetNotation('1x5 @ 100 lb')[0].weight).toBe(45.4)
    expect(parseSetNotation('nonsense')).toBeNull()
  })

  it('parses dates', () => {
    const today = '2026-10-10'
    expect(parseDate('Fri, Oct 02', today)).toBe('2026-10-02')
    expect(parseDate('Mon, Dec 14', today)).toBe('2025-12-14')
    expect(parseDate('2026-06-15 07:30:00', today)).toBe('2026-06-15')
    expect(parseDate('04/06/2026', today)).toBe('2026-06-04') // day-first
    expect(parseDate('06/15/2026', today)).toBe('2026-06-15') // month-first fallback
    expect(parseDate('2 Oct 2026', today)).toBe('2026-10-02')
    expect(parseDate('31/02/2026', today)).toBeNull()
  })
})

describe('csv import', () => {
  it('imports the brief table format', () => {
    const csv = `Exercise,Latest Date,Best Working Sets
Deadlift,"Mon, Sep 21",1×1 @ 80 kg
Bench Press,"Fri, Sep 25",1×1 @ 45 kg`
    const { headers, rows } = parseCsv(csv)
    const mapping = guessMapping(headers)
    expect(mapping).toMatchObject({ exercise: 'Exercise', date: 'Latest Date', notation: 'Best Working Sets' })
    const { entries, errors } = rowsToEntries(rows, mapping, { today: '2026-10-10' })
    expect(errors).toEqual([])
    expect(entries.map((e) => [e.exercise, e.date])).toEqual([
      ['Deadlift', '2026-09-21'],
      ['Bench Press', '2026-09-25'],
    ])
  })

  it('groups per-set app exports into sessions and reports bad rows', () => {
    const csv = `Date,Exercise Name,Set Order,Weight,Reps
2026-06-15 07:30:00,Squat (Barbell),1,50,3
2026-06-15 07:30:00,Squat (Barbell),2,55,1
bad,Squat (Barbell),3,55,1`
    const { headers, rows } = parseCsv(csv)
    const { entries, errors } = rowsToEntries(rows, guessMapping(headers))
    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({ exercise: 'Back Squat', date: '2026-06-15' })
    expect(entries[0].sets).toEqual([
      { reps: 3, weight: 50 },
      { reps: 1, weight: 55 },
    ])
    expect(errors).toHaveLength(1)
  })
})
