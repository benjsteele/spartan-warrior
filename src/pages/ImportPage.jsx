import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../state.jsx'
import { EXERCISE_BY_NAME } from '../data/exercises.js'
import { FIELDS, guessMapping, parseCsv, rowsToEntries } from '../lib/csv.js'
import { formatDate, summariseSets } from '../lib/format.js'
import { mergeEntries } from '../lib/storage.js'
import { Button, Card, Field, PageTitle, inputClass } from '../components/ui.jsx'

const SAMPLE = `Exercise,Latest Date,Best Working Sets
Single Arm Bent Over KB Row,"Fri, Oct 02",5×8 @ 16 kg
Deadlift,"Mon, Sep 21",1×1 @ 80 kg
Dead Hang,2026-10-04,1×55
5 km Run,2026-10-05,1×41`

export default function ImportPage() {
  const { entries, setEntries } = useData()
  const [text, setText] = useState('')
  const [mapping, setMapping] = useState({})
  const [lbs, setLbs] = useState(false)
  const [result, setResult] = useState(null)

  const parsed = useMemo(() => (text.trim() ? parseCsv(text) : null), [text])

  const loadText = (t) => {
    setText(t)
    setResult(null)
    const p = t.trim() ? parseCsv(t) : null
    setMapping(p ? guessMapping(p.headers) : {})
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (file) loadText(await file.text())
    e.target.value = ''
  }

  const ready = parsed && mapping.exercise && mapping.date && (mapping.notation || mapping.reps)
  const preview = useMemo(
    () => (ready ? rowsToEntries(parsed.rows, mapping, { lbs }) : null),
    [ready, parsed, mapping, lbs],
  )

  const doImport = () => {
    const { merged, added, skipped } = mergeEntries(entries, preview.entries)
    setEntries(merged)
    setResult({ added, skipped, errors: preview.errors.length })
    setText('')
    setMapping({})
  }

  return (
    <div className="space-y-4">
      <PageTitle sub="Paste a CSV export from your workout app, or pick a file.">Import log</PageTitle>

      <Card className="space-y-3">
        <textarea
          className={`${inputClass} min-h-40 font-mono text-sm`}
          value={text}
          onChange={(e) => loadText(e.target.value)}
          placeholder="Exercise,Date,Reps,Weight&#10;Deadlift,21/09/2026,1,80"
          spellCheck={false}
        />
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-100 ring-1 ring-white/10 hover:bg-slate-700">
            Choose CSV file
            <input type="file" accept=".csv,.tsv,.txt,text/csv" className="sr-only" onChange={onFile} />
          </label>
          <Button variant="ghost" onClick={() => loadText(SAMPLE)}>
            Paste example
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          Works with one row per set (Strong / Hevy style: date, exercise, weight, reps) or one row per exercise with a
          sets column like <code className="text-slate-300">5×8 @ 16 kg</code>. Dates like{' '}
          <code className="text-slate-300">Fri, Oct 02</code>, <code className="text-slate-300">2026-10-02</code> or{' '}
          <code className="text-slate-300">02/10/2026</code> (day first). For self-tests put the result in the reps
          column.
        </p>
      </Card>

      {result && (
        <Card className="ring-emerald-500/40" role="status">
          <p className="font-semibold text-emerald-300">
            Imported {result.added} entr{result.added === 1 ? 'y' : 'ies'}
          </p>
          <p className="text-sm text-slate-400">
            {result.skipped > 0 && `${result.skipped} duplicate(s) skipped. `}
            {result.errors > 0 && `${result.errors} row(s) couldn’t be read. `}
            <Link to="/" className="font-semibold text-red-400">
              See readiness →
            </Link>
          </p>
        </Card>
      )}

      {parsed && (
        <Card className="space-y-3">
          <h2 className="font-semibold text-white">Map columns</h2>
          <p className="text-sm text-slate-400">
            Found {parsed.rows.length} row(s) and {parsed.headers.length} column(s). Use either a sets-text column, or
            reps (+ weight, + number of sets).
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <Field key={f.key} label={`${f.label}${f.required ? ' *' : ''}`}>
                <select
                  className={inputClass}
                  value={mapping[f.key] ?? ''}
                  onChange={(e) => setMapping((m) => ({ ...m, [f.key]: e.target.value || undefined }))}
                >
                  <option value="">— none —</option>
                  {parsed.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </Field>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={lbs}
              onChange={(e) => setLbs(e.target.checked)}
              className="h-4 w-4 accent-red-600"
            />
            Weights are in lb (convert to kg)
          </label>
        </Card>
      )}

      {preview && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Preview</h2>
            <span className="text-xs text-slate-400">{preview.entries.length} session entries</span>
          </div>
          <ul className="divide-y divide-white/5 text-sm">
            {preview.entries.slice(0, 12).map((e) => {
              const meta = EXERCISE_BY_NAME[e.exercise]
              return (
                <li key={e.id} className="flex justify-between gap-3 py-2">
                  <span className="min-w-0">
                    <span className="block truncate text-white">
                      {e.exercise}
                      {!meta && <span className="ml-1 text-xs text-slate-500">(not scored)</span>}
                    </span>
                    <span className="text-xs text-slate-400">{summariseSets(e.sets, meta?.kind, meta?.unit)}</span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">{formatDate(e.date, { year: true })}</span>
                </li>
              )
            })}
          </ul>
          {preview.entries.length > 12 && (
            <p className="text-xs text-slate-500">…and {preview.entries.length - 12} more</p>
          )}
          {preview.errors.length > 0 && (
            <details className="rounded-xl bg-rose-950/40 p-3 text-sm text-rose-200 ring-1 ring-rose-500/30">
              <summary className="cursor-pointer">{preview.errors.length} row(s) will be skipped</summary>
              <ul className="mt-2 space-y-1 text-xs">
                {preview.errors.slice(0, 20).map((err, i) => (
                  <li key={i}>
                    Line {err.line}: {err.message}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <Button className="w-full" onClick={doImport} disabled={!preview.entries.length}>
            Import {preview.entries.length} entries
          </Button>
        </Card>
      )}
    </div>
  )
}
