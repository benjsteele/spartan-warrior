import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TIER_STYLE, daysBetween, fmtNum, formatDate } from '../lib/format.js'
import { todayISO } from '../lib/normalize.js'
import { TierBadge } from './ui.jsx'

const STALE_DAYS = 60

/** Position of `value` on a 0–100% bar whose right edge is 120% of thrive. */
function barPos(value, obstacle) {
  const { survive, thrive } = obstacle
  if (obstacle.metric.better === 'lower') {
    // Times: map survive*1.3 (slow) → 0%, thrive*0.9 (fast) → 100%
    const slow = survive * 1.3
    const fast = thrive * 0.9
    return Math.min(100, Math.max(0, ((slow - value) / (slow - fast)) * 100))
  }
  const max = thrive * 1.2
  return Math.min(100, Math.max(0, (value / max) * 100))
}

export function ObstacleCard({ obstacle, result }) {
  const [open, setOpen] = useState(false)
  const { metric } = obstacle
  const unit = metric.unit === '/10' ? '/10' : ` ${metric.unit}`
  const age = result.lastTested ? daysBetween(result.lastTested, todayISO()) : null
  const stale = age != null && age > STALE_DAYS
  const lower = metric.better === 'lower'

  return (
    <article className="rounded-2xl bg-slate-900 ring-1 ring-white/10">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full p-4 text-left" aria-expanded={open}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold leading-tight text-white">{obstacle.name}</h3>
            <p className="mt-0.5 truncate text-xs text-slate-400">{metric.label}</p>
          </div>
          <TierBadge tier={result.tier} untested={!result.tested} />
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <span className="text-2xl font-bold tabular-nums text-white">
            {fmtNum(result.currentValue)}
            {result.tested && <span className="text-sm font-medium text-slate-400">{unit}</span>}
          </span>
          <span className="text-right text-xs text-slate-400">
            {result.tested
              ? result.tier === 'green'
                ? 'Thrive target met'
                : `${fmtNum(result.gap)}${unit} ${lower ? 'too slow' : 'to go'}`
              : 'Self-test needed'}
          </span>
        </div>

        {/* Bar with survive / thrive markers */}
        <div className="relative mt-2 h-2 rounded-full bg-slate-800">
          {result.tested && (
            <div
              className={`absolute inset-y-0 left-0 rounded-full ${TIER_STYLE[result.tier].bar}`}
              style={{ width: `${barPos(result.currentValue, obstacle)}%` }}
            />
          )}
          {[
            ['survive', 'bg-amber-200'],
            ['thrive', 'bg-emerald-200'],
          ].map(([k, c]) => (
            <span
              key={k}
              className={`absolute -top-1 h-4 w-0.5 rounded ${c}`}
              style={{ left: `${barPos(obstacle[k], obstacle)}%` }}
              aria-hidden
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
          <span>
            Survive {lower ? '≤' : '≥'} {fmtNum(obstacle.survive)}
            {unit}
          </span>
          <span>
            Thrive {lower ? '≤' : '≥'} {fmtNum(obstacle.thrive)}
            {unit}
          </span>
        </div>
        {result.lastTested && (
          <p className={`mt-2 text-[11px] ${stale ? 'text-amber-300' : 'text-slate-500'}`}>
            {stale ? '⚠ ' : ''}Last logged {formatDate(result.lastTested)}
            {stale ? ` (${age} days ago — re-test)` : ''}
          </p>
        )}
      </button>

      {open && (
        <div className="space-y-2 border-t border-white/10 px-4 pb-4 pt-3 text-sm">
          <p className="text-slate-300">
            <span className="font-medium text-slate-400">Race standard: </span>
            {obstacle.standard}
          </p>
          <p className="text-slate-300">
            <span className="font-medium text-slate-400">Train: </span>
            {obstacle.tip}
          </p>
          <p className="text-xs text-slate-500">Measured from: {obstacle.sources.map((s) => s.exercise).join(' / ')}</p>
          <div className="flex gap-3 pt-1">
            <Link to={`/progress?o=${obstacle.id}`} className="font-semibold text-red-400">
              View progress →
            </Link>
            <Link
              to={`/log?exercise=${encodeURIComponent(obstacle.sources[0].exercise)}`}
              className="font-semibold text-slate-300"
            >
              Log result
            </Link>
          </div>
        </div>
      )}
    </article>
  )
}
