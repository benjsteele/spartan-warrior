import { useEffect, useState } from 'react'

// All persistence is browser localStorage — GitHub Pages has no backend.
const PREFIX = 'spartan-readiness:'

export const KEYS = {
  entries: 'entries',
  settings: 'settings',
}

export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Storage full or blocked (private mode) — keep working in memory.
  }
}

/** useState that mirrors to localStorage and syncs across tabs. */
export function useStoredState(key, initial) {
  const [value, setValue] = useState(() => read(key, typeof initial === 'function' ? initial() : initial))

  useEffect(() => {
    write(key, value)
  }, [key, value])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === PREFIX + key) setValue(read(key, value))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, value])

  return [value, setValue]
}

export const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

export const entryKey = (entry) => `${entry.exercise}|${entry.date}|${JSON.stringify(entry.sets)}`

/** Merge new entries into existing, skipping exact duplicates. */
export function mergeEntries(existing, incoming) {
  const seen = new Set(existing.map(entryKey))
  const added = []
  for (const e of incoming) {
    const k = entryKey(e)
    if (seen.has(k)) continue
    seen.add(k)
    added.push(e)
  }
  return { merged: [...existing, ...added], added: added.length, skipped: incoming.length - added.length }
}
