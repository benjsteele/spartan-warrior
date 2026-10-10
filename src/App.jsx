import { lazy, Suspense } from 'react'
import { HashRouter, NavLink, Route, Routes, Navigate } from 'react-router-dom'
import { DataProvider } from './state.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LogPage from './pages/LogPage.jsx'
import ImportPage from './pages/ImportPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import { CountdownChip } from './components/Countdown.jsx'

// Recharts is the heaviest dependency; only load it when the chart is opened.
const ProgressPage = lazy(() => import('./pages/ProgressPage.jsx'))

const NAV = [
  {
    to: '/',
    label: 'Readiness',
    icon: 'M3 12l2-2 7-7 7 7 2 2M5 10v10h4v-6h6v6h4V10',
  },
  { to: '/log', label: 'Log', icon: 'M12 5v14M5 12h14' },
  { to: '/progress', label: 'Progress', icon: 'M3 17l6-6 4 4 8-8M15 7h6v6' },
  {
    to: '/import',
    label: 'Import',
    icon: 'M12 3v12m0 0l-4-4m4 4l4-4M4 17v3h16v-3',
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM4 12h2m12 0h2M12 4v2m0 12v2M6.3 6.3l1.4 1.4m8.6 8.6l1.4 1.4m0-11.4l-1.4 1.4m-8.6 8.6l-1.4 1.4',
  },
]

function Icon({ d }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  )
}

function Shell() {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/90 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-600 font-black text-white">Σ</span>
            <span className="text-sm font-bold leading-tight sm:text-base">Spartan Readiness</span>
          </div>
          <nav className="hidden gap-1 md:flex" aria-label="Main">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <CountdownChip />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-4 md:pb-10">
        <Suspense fallback={<p className="py-10 text-center text-slate-500">Loading…</p>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/log" element={<LogPage />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Bottom tab bar — thumb-reachable on phones */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-slate-950/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Main"
      >
        <div className="grid grid-cols-5">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${isActive ? 'text-red-400' : 'text-slate-400'}`
              }
            >
              <Icon d={n.icon} />
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <DataProvider>
      {/* HashRouter: GitHub Pages has no SPA fallback, so routes live after the # */}
      <HashRouter>
        <Shell />
      </HashRouter>
    </DataProvider>
  )
}
