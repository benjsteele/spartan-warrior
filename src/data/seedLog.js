import { normaliseExercise, parseSetNotation } from '../lib/normalize.js'

// Noelle's training log (best working sets per exercise), as exported from
// her phone app in Oct 2026.
export const NOELLE_LOG = [
  ['Single Arm Bent Over KB Row', '2026-10-02', '5×8 @ 16 kg'],
  ['Bench Press', '2026-09-25', '1×1 @ 45 kg'],
  ['Deadlift', '2026-09-21', '1×1 @ 80 kg'],
  ['Bent Over Row', '2026-07-10', '3×12 @ 12 kg'],
  ["Farmer's Carry", '2026-07-10', '3×90 @ 16 kg'],
  ['Dumbbell Bench Press', '2026-07-03', '4×7 @ 12.5 kg'],
  ['Glute Bridge', '2026-06-29', '5×10 @ 45 kg'],
  ['Front Rack Reverse Lunge', '2026-06-22', '4×8 @ 15 kg'],
  ['Sumo Deadlift', '2026-06-18', '2×5 @ 55 kg'],
  ['Back Squat', '2026-06-15', '2×1 @ 55 kg'],
  ['Skull Crusher', '2026-06-12', '5×10 @ 8 kg'],
  ['Romanian Deadlift (RDL)', '2026-06-08', '5×8 @ 25 kg'],
  ['Rear Foot Elevated Split Squat', '2026-06-04', '2×6 @ 12 kg'],
]

export function seedEntries() {
  return NOELLE_LOG.map(([exercise, date, notation], i) => ({
    id: `seed-${i}`,
    exercise: normaliseExercise(exercise),
    date,
    sets: parseSetNotation(notation),
  }))
}
