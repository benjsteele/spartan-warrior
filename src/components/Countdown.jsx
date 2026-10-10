import { Link } from 'react-router-dom'
import { useData } from '../state.jsx'
import { daysBetween, formatDate } from '../lib/format.js'
import { todayISO } from '../lib/normalize.js'
import { nextCheckpoint } from '../lib/schedule.js'
import { Card } from './ui.jsx'

export function useCountdown() {
  const { settings } = useData()
  const today = todayISO()
  const days = settings.raceDate ? daysBetween(today, settings.raceDate) : null
  return { today, days, settings }
}

export function CountdownChip() {
  const { days } = useCountdown()
  if (days == null) {
    return (
      <Link
        to="/settings"
        className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10"
      >
        Set race date
      </Link>
    )
  }
  const text = days > 0 ? `${days} day${days === 1 ? '' : 's'}` : days === 0 ? 'Race day!' : 'Race done'
  return (
    <span className="rounded-full bg-red-600/15 px-3 py-1 text-xs font-bold text-red-300 ring-1 ring-red-500/40">
      {text}
    </span>
  )
}

export function CountdownCard() {
  const { today, days, settings } = useCountdown()
  const checkpoint = nextCheckpoint(today, settings.raceDate)
  const weeks = days != null && days > 0 ? Math.floor(days / 7) : null

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{settings.raceName || 'Race'}</p>
        {days == null ? (
          <div className="mt-2">
            <p className="text-slate-300">No race date set yet.</p>
            <Link to="/settings" className="mt-2 inline-block text-sm font-semibold text-red-400">
              Set race date →
            </Link>
          </div>
        ) : days > 0 ? (
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-5xl font-black tabular-nums text-white">{days}</span>
            <span className="text-slate-400">
              day{days === 1 ? '' : 's'} to go{weeks ? ` · ${weeks} wk` : ''}
            </span>
          </div>
        ) : days === 0 ? (
          <p className="mt-1 text-3xl font-black text-white">Race day. Aroo! 🛡️</p>
        ) : (
          <div className="mt-1">
            <p className="text-lg font-bold text-white">Race was {formatDate(settings.raceDate, { year: true })}</p>
            <Link to="/settings" className="text-sm font-semibold text-red-400">
              Set your next race →
            </Link>
          </div>
        )}
        {settings.raceDate && (
          <p className="mt-1 text-sm text-slate-500">{formatDate(settings.raceDate, { weekday: true, year: true })}</p>
        )}
      </div>
      {checkpoint && (
        <p className="mt-3 rounded-xl bg-slate-800/70 px-3 py-2 text-sm text-slate-300">
          Next self-test checkpoint: <strong className="text-white">{formatDate(checkpoint, { weekday: true })}</strong>
        </p>
      )}
    </Card>
  )
}
