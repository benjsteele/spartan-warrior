import { useState } from 'react'
import { useData, DEFAULT_SETTINGS } from '../state.jsx'
import { seedEntries } from '../data/seedLog.js'
import { entriesToCsv } from '../lib/csv.js'
import { mergeEntries } from '../lib/storage.js'
import { todayISO } from '../lib/normalize.js'
import { Button, Card, Field, PageTitle, inputClass } from '../components/ui.jsx'

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function SettingsPage() {
  const { entries, setEntries, settings, setSettings } = useData()
  const [msg, setMsg] = useState('')

  const update = (patch) => setSettings((s) => ({ ...DEFAULT_SETTINGS, ...s, ...patch }))

  const restore = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (!Array.isArray(data.entries)) throw new Error('No entries array')
      setEntries(data.entries)
      if (data.settings) update(data.settings)
      setMsg(`Restored ${data.entries.length} entries.`)
    } catch (err) {
      setMsg(`Couldn’t restore backup: ${err.message}`)
    }
  }

  return (
    <div className="space-y-4">
      <PageTitle sub="Everything is stored in this browser only — back up regularly.">Settings</PageTitle>

      <Card className="space-y-3">
        <h2 className="font-semibold text-white">Race</h2>
        <Field label="Race name">
          <input
            className={inputClass}
            value={settings.raceName}
            onChange={(e) => update({ raceName: e.target.value })}
          />
        </Field>
        <Field label="Race date" hint="Drives the countdown and the 4-weekly self-test checkpoints.">
          <input
            type="date"
            className={inputClass}
            value={settings.raceDate}
            onChange={(e) => update({ raceDate: e.target.value })}
          />
        </Field>
        <Field label="Self-test reminder interval (days)">
          <input
            type="number"
            inputMode="numeric"
            min="7"
            max="90"
            className={inputClass}
            value={settings.testIntervalDays}
            onChange={(e) => update({ testIntervalDays: Math.max(7, parseInt(e.target.value, 10) || 30) })}
          />
        </Field>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-semibold text-white">Data</h2>
        <p className="text-sm text-slate-400">{entries.length} entries stored on this device.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="secondary"
            onClick={() =>
              download(
                `spartan-readiness-${todayISO()}.json`,
                JSON.stringify({ entries, settings }, null, 2),
                'application/json',
              )
            }
          >
            Back up (JSON)
          </Button>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-100 ring-1 ring-white/10 hover:bg-slate-700">
            Restore backup
            <input type="file" accept="application/json,.json" className="sr-only" onChange={restore} />
          </label>
          <Button
            variant="secondary"
            onClick={() => download(`spartan-log-${todayISO()}.csv`, entriesToCsv(entries), 'text/csv')}
          >
            Export log (CSV)
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const { merged, added } = mergeEntries(entries, seedEntries())
              setEntries(merged)
              setMsg(added ? `Added ${added} entries from Noelle’s log.` : 'Noelle’s log is already loaded.')
            }}
          >
            Load Noelle’s log
          </Button>
        </div>
        <Button
          variant="danger"
          className="w-full"
          onClick={() => {
            if (confirm('Delete ALL logged workouts on this device? This cannot be undone.')) {
              setEntries([])
              setMsg('All entries deleted.')
            }
          }}
        >
          Delete all entries
        </Button>
        {msg && (
          <p className="text-sm text-slate-300" role="status">
            {msg}
          </p>
        )}
      </Card>

      <Card className="space-y-2 text-sm text-slate-400">
        <h2 className="font-semibold text-white">How scoring works</h2>
        <p>
          Each of the 20 obstacles has a survive and a thrive benchmark (female standards). Meeting thrive is{' '}
          <span className="text-emerald-300">green (1 pt)</span>, meeting survive is{' '}
          <span className="text-amber-300">amber (½ pt)</span>, otherwise <span className="text-rose-300">red (0)</span>
          . Overall readiness = points ÷ 20.
        </p>
        <p>
          Strength-based obstacles use your best gym numbers as proxies (estimated 1RM via the Epley formula, or best
          working weight for the stated reps). Grip, climbing, skill and running obstacles need a monthly self-test —
          untested counts as red.
        </p>
      </Card>
    </div>
  )
}
