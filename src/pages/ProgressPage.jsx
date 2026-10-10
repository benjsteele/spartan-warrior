import { useSearchParams } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useData } from '../state.jsx'
import { CATEGORIES, OBSTACLES } from '../data/obstacles.js'
import { obstacleTimeline } from '../lib/engine.js'
import { fmtNum, formatDate } from '../lib/format.js'
import { Card, Field, PageTitle, TierBadge, inputClass } from '../components/ui.jsx'

const SURVIVE = '#f59e0b'
const THRIVE = '#10b981'

function ChartTooltip({ active, payload, unit }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-lg bg-slate-800 px-3 py-2 text-xs shadow-lg ring-1 ring-white/10">
      <p className="text-slate-400">{formatDate(p.date, { weekday: true, year: true })}</p>
      <p className="text-sm font-semibold text-white">
        {fmtNum(p.value)} {unit}
      </p>
    </div>
  )
}

export default function ProgressPage() {
  const { entries, results } = useData()
  const [params, setParams] = useSearchParams()
  const id = params.get('o') ?? OBSTACLES[0].id
  const idx = Math.max(
    0,
    OBSTACLES.findIndex((o) => o.id === id),
  )
  const obstacle = OBSTACLES[idx]
  const result = results[idx]
  const unit = obstacle.metric.unit
  const data = obstacleTimeline(obstacle, entries)

  const values = [...data.map((d) => d.value), obstacle.survive, obstacle.thrive]
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const pad = (hi - lo) * 0.15 || 1
  const domain = [Math.max(0, Math.floor(lo - pad)), Math.ceil(hi + pad)]

  return (
    <div className="space-y-4">
      <PageTitle sub="Logged results against the survive and thrive benchmarks.">Progress</PageTitle>

      <Field label="Obstacle">
        <select
          className={inputClass}
          value={obstacle.id}
          onChange={(e) => setParams({ o: e.target.value }, { replace: true })}
        >
          {Object.entries(CATEGORIES).map(([cat, label]) => (
            <optgroup key={cat} label={label}>
              {OBSTACLES.filter((o) => o.category === cat).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>

      <Card>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-white">{obstacle.metric.label}</h2>
            <p className="text-xs text-slate-400">
              {unit} · {obstacle.metric.better === 'lower' ? 'lower is better' : 'higher is better'}
            </p>
          </div>
          <TierBadge tier={result.tier} untested={!result.tested} />
        </div>

        {data.length === 0 ? (
          <div className="grid h-56 place-items-center rounded-xl bg-slate-800/40 text-center text-sm text-slate-400">
            <p>
              No results yet for this obstacle.
              <br />
              Log {obstacle.sources.map((s) => s.exercise).join(' or ')} to start tracking.
            </p>
          </div>
        ) : (
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 16, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => formatDate(d)}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                  minTickGap={16}
                />
                <YAxis
                  domain={domain}
                  reversed={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: '#475569' }} />
                <ReferenceLine
                  y={obstacle.survive}
                  stroke={SURVIVE}
                  strokeDasharray="5 4"
                  label={{
                    value: `Survive ${fmtNum(obstacle.survive)}`,
                    fill: SURVIVE,
                    fontSize: 11,
                    position: 'insideTopLeft',
                  }}
                />
                <ReferenceLine
                  y={obstacle.thrive}
                  stroke={THRIVE}
                  strokeDasharray="5 4"
                  label={{
                    value: `Thrive ${fmtNum(obstacle.thrive)}`,
                    fill: THRIVE,
                    fontSize: 11,
                    position: 'insideTopLeft',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f8fafc"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#f8fafc', stroke: '#0f172a', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {data.length > 0 && (
        <Card className="p-0">
          <table className="w-full text-sm">
            <caption className="sr-only">Results for {obstacle.name}</caption>
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 text-right font-medium">{obstacle.metric.label}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[...data].reverse().map((d) => (
                <tr key={d.date}>
                  <td className="px-4 py-2 text-slate-300">{formatDate(d.date, { weekday: true, year: true })}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-white">
                    {fmtNum(d.value)} {unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Card className="text-sm text-slate-300">
        <p>
          <span className="font-medium text-slate-400">Race standard: </span>
          {obstacle.standard}
        </p>
        <p className="mt-2">
          <span className="font-medium text-slate-400">Train: </span>
          {obstacle.tip}
        </p>
      </Card>
    </div>
  )
}
