import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../state.jsx'
import { EXERCISES, EXERCISE_BY_NAME } from '../data/exercises.js'
import { formatDate, summariseSets } from '../lib/format.js'
import { normaliseExercise, parseSetNotation, todayISO } from '../lib/normalize.js'
import { newId } from '../lib/storage.js'
import { Button, Card, Field, PageTitle, inputClass } from '../components/ui.jsx'

const OTHER = '__other__'
const LIFTS = EXERCISES.filter((e) => e.kind !== 'test')
const TESTS = EXERCISES.filter((e) => e.kind === 'test')

const emptySet = (prev) => ({ reps: prev?.reps ?? '', weight: prev?.weight ?? '' })

function EntryForm({ onSave }) {
  const [params] = useSearchParams()
  const preset = params.get('exercise')
  const presetKnown = preset && EXERCISE_BY_NAME[preset]

  const [exercise, setExercise] = useState(presetKnown ? preset : preset ? OTHER : LIFTS[0].name)
  const [custom, setCustom] = useState(presetKnown ? '' : (preset ?? ''))
  const [date, setDate] = useState(todayISO())
  const [sets, setSets] = useState([emptySet()])
  const [quick, setQuick] = useState('')
  const [flash, setFlash] = useState('')

  const meta = EXERCISE_BY_NAME[exercise]
  const kind = meta?.kind ?? 'strength'
  const isTest = kind === 'test'

  const updateSet = (i, field, value) => setSets((s) => s.map((set, j) => (j === i ? { ...set, [field]: value } : set)))

  const applyQuick = () => {
    const parsed = parseSetNotation(quick)
    if (!parsed) return setFlash('Couldn’t read that — try “5x8 @ 16”')
    setSets(parsed.map((s) => ({ reps: String(s.reps), weight: String(s.weight || '') })))
    setQuick('')
    setFlash('')
  }

  const name = exercise === OTHER ? normaliseExercise(custom) : exercise
  const cleanSets = sets
    .map((s) => ({ reps: parseFloat(s.reps), weight: isTest ? 0 : parseFloat(s.weight) || 0 }))
    .filter((s) => Number.isFinite(s.reps) && s.reps > 0)
  const canSave = name && date && cleanSets.length > 0

  const submit = (e) => {
    e.preventDefault()
    if (!canSave) return
    onSave({ id: newId(), exercise: name, date, sets: cleanSets })
    setFlash(`Saved ${name} — ${summariseSets(cleanSets, kind, meta?.unit)}`)
    setSets([emptySet(sets[sets.length - 1])])
  }

  const repsLabel = isTest ? `Result (${meta.unit})` : kind === 'carry' ? 'Distance (m)' : 'Reps'
  const weightLabel = kind === 'carry' ? 'kg / hand' : 'kg'

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          <Field label="Exercise" hint={meta?.hint}>
            <select
              className={inputClass}
              value={exercise}
              onChange={(e) => {
                setExercise(e.target.value)
                setSets([emptySet()])
              }}
            >
              <optgroup label="Gym lifts & carries">
                {LIFTS.map((e) => (
                  <option key={e.name}>{e.name}</option>
                ))}
              </optgroup>
              <optgroup label="Monthly self-tests">
                {TESTS.map((e) => (
                  <option key={e.name} value={e.name}>
                    {e.name} ({e.unit})
                  </option>
                ))}
              </optgroup>
              <option value={OTHER}>Other…</option>
            </select>
          </Field>
          <Field label="Date">
            <input
              type="date"
              className={inputClass}
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </Field>
        </div>

        {exercise === OTHER && (
          <Field label="Exercise name">
            <input
              className={inputClass}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g. Kettlebell Swing"
            />
          </Field>
        )}

        {!isTest && (
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={quick}
              onChange={(e) => setQuick(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyQuick()
                }
              }}
              placeholder="Quick fill: 5x8 @ 16"
              aria-label="Quick fill sets"
            />
            <Button type="button" variant="secondary" onClick={applyQuick} disabled={!quick.trim()}>
              Fill
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {sets.map((s, i) => (
            <div key={i} className="flex items-end gap-2">
              {!isTest && <span className="w-8 pb-3 text-center text-sm text-slate-500">{i + 1}</span>}
              <div className="flex-1">
                <Field label={i === 0 ? repsLabel : ''}>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    className={inputClass}
                    value={s.reps}
                    onChange={(e) => updateSet(i, 'reps', e.target.value)}
                    placeholder={isTest ? meta.unit : kind === 'carry' ? 'm' : 'reps'}
                  />
                </Field>
              </div>
              {!isTest && (
                <div className="flex-1">
                  <Field label={i === 0 ? weightLabel : ''}>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      className={inputClass}
                      value={s.weight}
                      onChange={(e) => updateSet(i, 'weight', e.target.value)}
                      placeholder="kg"
                    />
                  </Field>
                </div>
              )}
              {!isTest && sets.length > 1 && (
                <button
                  type="button"
                  className="mb-1 grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-800 hover:text-rose-300"
                  onClick={() => setSets((all) => all.filter((_, j) => j !== i))}
                  aria-label={`Remove set ${i + 1}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {!isTest && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSets((all) => [...all, emptySet(all[all.length - 1])])}
            >
              + Add set
            </Button>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={!canSave}>
          Save {isTest ? 'result' : 'workout'}
        </Button>
        {flash && (
          <p className="text-center text-sm text-emerald-300" role="status">
            {flash}
          </p>
        )}
      </form>
    </Card>
  )
}

export default function LogPage() {
  const { entries, setEntries } = useData()
  const [query, setQuery] = useState('')

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = entries
      .filter((e) => !q || e.exercise.toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date))
    const byDate = new Map()
    for (const e of list) {
      if (!byDate.has(e.date)) byDate.set(e.date, [])
      byDate.get(e.date).push(e)
    }
    return [...byDate.entries()]
  }, [entries, query])

  const remove = (id) => {
    if (confirm('Delete this entry?')) setEntries((all) => all.filter((e) => e.id !== id))
  }

  return (
    <div className="space-y-4">
      <PageTitle sub="Gym sessions and monthly self-tests. Saved on this device.">Log a workout</PageTitle>
      <EntryForm onSave={(entry) => setEntries((all) => [...all, entry])} />

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="font-semibold text-white">History</h2>
          <span className="text-xs text-slate-500">{entries.length} entries</span>
        </div>
        <input
          className={`${inputClass} mb-3`}
          placeholder="Filter by exercise…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {grouped.length === 0 && <p className="py-6 text-center text-slate-500">No entries yet.</p>}
        <div className="space-y-3">
          {grouped.map(([date, items]) => (
            <Card key={date} className="p-0">
              <h3 className="border-b border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {formatDate(date, { weekday: true, year: true })}
              </h3>
              <ul className="divide-y divide-white/5">
                {items.map((e) => {
                  const meta = EXERCISE_BY_NAME[e.exercise]
                  return (
                    <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{e.exercise}</p>
                        <p className="text-xs text-slate-400">{summariseSets(e.sets, meta?.kind, meta?.unit)}</p>
                      </div>
                      <button
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-rose-300"
                        onClick={() => remove(e.id)}
                        aria-label={`Delete ${e.exercise} on ${date}`}
                      >
                        ✕
                      </button>
                    </li>
                  )
                })}
              </ul>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
