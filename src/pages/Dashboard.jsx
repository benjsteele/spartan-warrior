import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../state.jsx'
import { CATEGORIES, OBSTACLES } from '../data/obstacles.js'
import { tierCounts } from '../lib/engine.js'
import { formatDate } from '../lib/format.js'
import { todayISO } from '../lib/normalize.js'
import { dueSelfTests } from '../lib/schedule.js'
import { CountdownCard } from '../components/Countdown.jsx'
import { OverallGauge } from '../components/Gauge.jsx'
import { ObstacleCard } from '../components/ObstacleCard.jsx'
import { Card } from '../components/ui.jsx'

const FILTERS = [
  ['all', 'All'],
  ['red', 'Not ready'],
  ['amber', 'Developing'],
  ['green', 'Ready'],
  ...Object.entries(CATEGORIES),
]

export default function Dashboard() {
  const { entries, results, overall, settings } = useData()
  const [filter, setFilter] = useState('all')
  const due = dueSelfTests(entries, todayISO(), settings.testIntervalDays)

  const rows = OBSTACLES.map((o, i) => ({ obstacle: o, result: results[i] })).filter(({ obstacle, result }) =>
    filter === 'all'
      ? true
      : ['red', 'amber', 'green'].includes(filter)
        ? result.tier === filter
        : obstacle.category === filter,
  )

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <OverallGauge score={overall} counts={tierCounts(results)} />
        <CountdownCard />
      </div>

      {due.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Self-tests due</h2>
            <span className="text-xs text-slate-400">every {settings.testIntervalDays} days</span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Grip, climbing and running obstacles can only be scored from a self-test. Untested obstacles count as red.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {due.map(({ test, lastDate }) => (
              <li key={test.name}>
                <Link
                  to={`/log?exercise=${encodeURIComponent(test.name)}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1.5 text-sm text-slate-200 ring-1 ring-white/10 hover:ring-red-500/60"
                >
                  {test.name}
                  <span className="text-xs text-slate-500">{lastDate ? formatDate(lastDate) : 'never'}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div>
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Filter obstacles">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${
                filter === key ? 'bg-red-600 text-white ring-red-600' : 'bg-slate-900 text-slate-300 ring-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-slate-500">No obstacles in this view.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ obstacle, result }) => (
              <ObstacleCard key={obstacle.id} obstacle={obstacle} result={result} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
