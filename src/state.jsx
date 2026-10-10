import { createContext, useContext, useMemo } from 'react'
import { seedEntries } from './data/seedLog.js'
import { evaluateAll, overallScore } from './lib/engine.js'
import { KEYS, useStoredState } from './lib/storage.js'

const DataContext = createContext(null)

export const DEFAULT_SETTINGS = {
  raceName: 'Ireland Spartan Sprint 2026',
  raceDate: '', // YYYY-MM-DD — set in Settings
  testIntervalDays: 30,
}

export function DataProvider({ children }) {
  // First visit (nothing stored yet): preload Noelle's log so the dashboard is
  // meaningful immediately. Clearing the log stores [] and won't re-seed.
  const [entries, setEntries] = useStoredState(KEYS.entries, seedEntries)
  const [storedSettings, setSettings] = useStoredState(KEYS.settings, DEFAULT_SETTINGS)
  const settings = { ...DEFAULT_SETTINGS, ...storedSettings }

  const value = useMemo(() => {
    const results = evaluateAll(entries)
    return {
      entries,
      setEntries,
      settings,
      setSettings,
      results,
      overall: overallScore(results),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, storedSettings])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => useContext(DataContext)
