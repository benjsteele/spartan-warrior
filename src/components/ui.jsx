import { TIER_STYLE } from '../lib/format.js'

export function Card({ className = '', children, ...rest }) {
  return (
    <section className={`rounded-2xl bg-slate-900 ring-1 ring-white/10 p-4 ${className}`} {...rest}>
      {children}
    </section>
  )
}

export function TierBadge({ tier, untested = false }) {
  const t = TIER_STYLE[tier]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${t.badge}`}>
      <span aria-hidden>{t.icon}</span>
      {untested ? 'Untested' : t.short}
    </span>
  )
}

export function Button({ variant = 'primary', className = '', ...rest }) {
  const styles = {
    primary: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700',
    secondary: 'bg-slate-800 text-slate-100 ring-1 ring-white/10 hover:bg-slate-700',
    danger: 'bg-rose-950 text-rose-200 ring-1 ring-rose-500/40 hover:bg-rose-900',
    ghost: 'text-slate-300 hover:bg-slate-800',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-40 disabled:pointer-events-none ${styles[variant]} ${className}`}
      {...rest}
    />
  )
}

export const inputClass =
  'w-full rounded-xl bg-slate-800 px-3 py-2.5 text-base text-slate-100 ring-1 ring-white/10 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500'

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

export function PageTitle({ children, sub }) {
  return (
    <header className="mb-4">
      <h1 className="text-xl font-bold text-white">{children}</h1>
      {sub && <p className="mt-0.5 text-sm text-slate-400">{sub}</p>}
    </header>
  )
}
