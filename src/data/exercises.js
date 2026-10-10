// Canonical exercise catalogue.
//
// kind:
//   'strength' – sets are { reps, weight } with weight in kg
//   'carry'    – sets are { reps, weight } where reps = metres carried and
//                weight = kg per hand
//   'test'     – a monthly self-test; the measured value is stored in
//                set.reps (unit given below) and weight is 0
//
// aliases are matched after normalisation (lower-case, punctuation stripped).

export const EXERCISES = [
  // Gym lifts from Noelle's plan
  { name: 'Deadlift', kind: 'strength', aliases: ['conventional deadlift', 'barbell deadlift', 'dl'] },
  { name: 'Sumo Deadlift', kind: 'strength', aliases: ['sumo dl', 'barbell sumo deadlift'] },
  {
    name: 'Romanian Deadlift',
    kind: 'strength',
    aliases: [
      'rdl',
      'romanian deadlift rdl',
      'barbell rdl',
      'dumbbell rdl',
      'romanian deadlift barbell',
      'romanian deadlift dumbbell',
    ],
  },
  { name: 'Back Squat', kind: 'strength', aliases: ['squat', 'barbell squat', 'barbell back squat', 'squat barbell'] },
  { name: 'Bench Press', kind: 'strength', aliases: ['barbell bench press', 'bench', 'bench press barbell'] },
  { name: 'Dumbbell Bench Press', kind: 'strength', aliases: ['db bench press', 'db bench', 'bench press dumbbell'] },
  {
    name: 'Single Arm KB Row',
    kind: 'strength',
    aliases: [
      'single arm bent over kb row',
      'single arm kettlebell row',
      'one arm kb row',
      'single arm row',
      'kb row',
      'single arm dumbbell row',
      'one arm dumbbell row',
    ],
  },
  {
    name: 'Bent Over Row',
    kind: 'strength',
    aliases: ['barbell row', 'bent over row barbell', 'bent over barbell row'],
  },
  { name: 'Glute Bridge', kind: 'strength', aliases: ['barbell glute bridge', 'hip thrust', 'barbell hip thrust'] },
  {
    name: 'Front Rack Reverse Lunge',
    kind: 'strength',
    aliases: ['front rack lunge', 'reverse lunge', 'front rack reverse lunges'],
  },
  {
    name: 'Rear Foot Elevated Split Squat',
    kind: 'strength',
    aliases: ['rfess', 'bulgarian split squat', 'rear foot elevated split squats'],
  },
  {
    name: 'Skull Crusher',
    kind: 'strength',
    aliases: ['skull crushers', 'lying triceps extension', 'ez bar skull crusher'],
  },
  {
    name: "Farmer's Carry",
    kind: 'carry',
    aliases: ['farmers carry', 'farmer carry', 'farmers walk', 'farmer walk', "farmer's walk"],
  },

  // Monthly self-tests (value stored in set.reps)
  {
    name: 'Dead Hang',
    kind: 'test',
    unit: 's',
    better: 'higher',
    hint: 'Seconds hanging from a bar, overhand grip',
    aliases: ['dead hang test', 'bar hang', 'hang'],
  },
  {
    name: 'Pull-Up',
    kind: 'test',
    unit: 'reps',
    better: 'higher',
    hint: 'Strict pull-ups, full hang to chin over bar',
    aliases: ['pull up', 'pullup', 'pull ups', 'pullups', 'chin up', 'chin ups'],
  },
  {
    name: 'Rope Climb',
    kind: 'test',
    unit: 'm',
    better: 'higher',
    hint: 'Highest point reached on a rope (4.8 m = full climb)',
    aliases: ['rope climb test'],
  },
  {
    name: 'Rig Rungs',
    kind: 'test',
    unit: 'rungs',
    better: 'higher',
    hint: 'Rings / rungs travelled on a rig or monkey bars without dropping',
    aliases: ['monkey bars', 'multi rig', 'rig traverse'],
  },
  {
    name: 'Wall Climb',
    kind: 'test',
    unit: 'm',
    better: 'higher',
    hint: 'Tallest wall cleared unassisted (6 ft ≈ 1.8 m, 8 ft ≈ 2.4 m)',
    aliases: ['wall', 'wall test'],
  },
  {
    name: 'Spear Throw',
    kind: 'test',
    unit: 'hits/10',
    better: 'higher',
    hint: 'Hits out of 10 throws at a hay-bale target, ~6 m',
    aliases: ['spear', 'spear throw test'],
  },
  {
    name: 'Burpee Test',
    kind: 'test',
    unit: 'reps',
    better: 'higher',
    hint: 'Spartan burpees (chest to floor + jump) in 3 minutes',
    aliases: ['burpees', 'burpee', '3 min burpees'],
  },
  {
    name: 'Bucket Carry',
    kind: 'test',
    unit: 'kg',
    better: 'higher',
    hint: 'Heaviest bucket / front-hugged load carried 100 m without setting down',
    aliases: ['bucket brigade'],
  },
  {
    name: '5 km Run',
    kind: 'test',
    unit: 'min',
    better: 'lower',
    hint: '5 km time, ideally on trail / hills',
    aliases: ['5k run', '5km run', '5k', '5 km', 'parkrun'],
  },
  {
    name: '30-min Run',
    kind: 'test',
    unit: 'km',
    better: 'higher',
    hint: 'Distance covered in 30 minutes of continuous running',
    aliases: ['30 min run', '30 minute run', 'cooper test'],
  },
]

export const EXERCISE_BY_NAME = Object.fromEntries(EXERCISES.map((e) => [e.name, e]))

export const SELF_TESTS = EXERCISES.filter((e) => e.kind === 'test')
