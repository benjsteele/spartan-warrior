import { TIER_STYLE } from '../lib/format.js'
import { Card } from './ui.jsx'

/** Semicircular overall readiness gauge with the R/A/G breakdown. */
export function OverallGauge({ score, counts }) {
  const pct = Math.round(score * 100)
  const r = 80
  const circ = Math.PI * r
  const color = pct >= 75 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#f43f5e'
  const label = pct >= 75 ? 'On track' : pct >= 40 ? 'Building' : 'Early days'

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Overall readiness</p>
      <div className="relative mx-auto mt-2 w-full max-w-[240px]">
        <svg viewBox="0 0 200 110" className="w-full" role="img" aria-label={`Overall readiness ${pct}%`}>
          <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />
          <path
            d="M20 100 A80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${circ * score} ${circ}`}
            style={{ transition: 'stroke-dasharray 600ms ease' }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <div className="text-4xl font-black tabular-nums text-white">{pct}%</div>
          <div className="text-xs text-slate-400">{label}</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {['green', 'amber', 'red'].map((t) => (
          <div key={t} className="rounded-xl bg-slate-800/60 py-2">
            <div className="flex items-center justify-center gap-1.5 text-lg font-bold tabular-nums text-white">
              <span className={`h-2.5 w-2.5 rounded-full ${TIER_STYLE[t].dot}`} aria-hidden />
              {counts[t]}
            </div>
            <div className="text-[11px] text-slate-400">{TIER_STYLE[t].label}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">Green = 1 pt, amber = ½ pt, red = 0, out of 20 obstacles.</p>
    </Card>
  )
}
