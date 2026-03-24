import type { Puzzle } from './puzzles'

const BASE_URL = (import.meta.env.VITE_PUZZLES_URL as string | undefined)?.replace(/\/$/, '')

// ── Date helpers ──────────────────────────────────────────────────────────────

export function utcDateString(d = new Date()): string {
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
  ].join('-')
}

export function msUntilMidnightUTC(): number {
  const now = new Date()
  const tomorrow = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  )
  return tomorrow - now.getTime()
}

// ── Puzzle fetch ──────────────────────────────────────────────────────────────

const puzzleKey = (date: string) => `splink:puzzle:${date}`

export async function fetchPuzzles(date: string): Promise<Puzzle[]> {
  const cached = localStorage.getItem(puzzleKey(date))
  if (cached) return JSON.parse(cached) as Puzzle[]

  if (!BASE_URL) {
    throw new Error('VITE_PUZZLES_URL is not configured. See .env.example.')
  }

  const res = await fetch(`${BASE_URL}/puzzles/${date}.json`)
  if (!res.ok) throw new Error(`Could not load today's puzzle (HTTP ${res.status})`)

  const puzzles = await res.json() as Puzzle[]
  localStorage.setItem(puzzleKey(date), JSON.stringify(puzzles))
  return puzzles
}

// ── Progress persistence ──────────────────────────────────────────────────────

export interface StoredResult {
  guesses: string[]
  solved: boolean
}

export interface DailyProgress {
  date: string
  currentIdx: number
  results: StoredResult[]
  completed: boolean
}

const progressKey = (date: string) => `splink:progress:${date}`

export function loadProgress(date: string): DailyProgress | null {
  const raw = localStorage.getItem(progressKey(date))
  return raw ? (JSON.parse(raw) as DailyProgress) : null
}

export function saveProgress(p: DailyProgress): void {
  localStorage.setItem(progressKey(p.date), JSON.stringify(p))
}
