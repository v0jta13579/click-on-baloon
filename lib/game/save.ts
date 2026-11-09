"use client"

import { useMemo, useSyncExternalStore } from "react"

const STORAGE_KEY = "balonky-save-v1"

export type SaveData = { best: number; unlocked: number }

const DEFAULT_SAVE: SaveData = { best: 0, unlocked: 1 }

const listeners = new Set<() => void>()
let memoryFallback = ""

function readRaw(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? ""
  } catch {
    return memoryFallback
  }
}

function parse(raw: string): SaveData {
  if (!raw) return DEFAULT_SAVE
  try {
    const data = JSON.parse(raw) as Partial<SaveData>
    return {
      best: Number.isFinite(data.best) ? Math.max(0, Number(data.best)) : 0,
      unlocked: Number.isFinite(data.unlocked) ? Math.max(1, Number(data.unlocked)) : 1,
    }
  } catch {
    return DEFAULT_SAVE
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  window.addEventListener("storage", callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener("storage", callback)
  }
}

export function updateSave(partial: Partial<SaveData>) {
  const next = JSON.stringify({ ...parse(readRaw()), ...partial })
  try {
    window.localStorage.setItem(STORAGE_KEY, next)
  } catch {
    memoryFallback = next
  }
  listeners.forEach((listener) => listener())
}

export function useSave(): SaveData {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "")
  return useMemo(() => parse(raw), [raw])
}
