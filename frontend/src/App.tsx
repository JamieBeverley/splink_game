import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import type { Puzzle } from './puzzles'
import {
  localDateString,
  msUntilMidnightLocal,
  fetchPuzzles,
  loadProgress,
  saveProgress,
} from './daily'

function SpLinkIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0" y="19" width="16" height="10" rx="5" fill="currentColor" opacity="0.45"/>
      <rect x="32" y="19" width="16" height="10" rx="5" fill="currentColor" opacity="0.45"/>
      <polygon points="24,12 33,24 24,36 15,24" fill="currentColor"/>
    </svg>
  )
}

function useCountdown() {
  const [ms, setMs] = useState(msUntilMidnightLocal)
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilMidnightLocal()), 1000)
    return () => clearInterval(id)
  }, [])
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1_000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const PUZZLES_PER_GAME = 4
const MAX_GUESSES = 3

interface PuzzleResult {
  puzzle: Puzzle
  guesses: string[]
  solved: boolean
}

type Phase = 'loading' | 'error' | 'playing' | 'reveal' | 'done'

export default function App() {
  const [date, setDate]         = useState('')
  const [puzzles, setPuzzles]   = useState<Puzzle[]>([])
  const [results, setResults]   = useState<PuzzleResult[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [input, setInput]       = useState('')
  const [phase, setPhase]       = useState<Phase>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [flash, setFlash]       = useState<'correct' | 'wrong' | null>(null)
  const [shaking, setShaking]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const countdown = useCountdown()

  // ── Load today's puzzle ─────────────────────────────────────────────────────

  const loadDaily = useCallback(async () => {
    setPhase('loading')
    setErrorMsg('')
    const today = localDateString()
    setDate(today)
    try {
      const fetched = await fetchPuzzles(today)
      const saved   = loadProgress(today)

      setPuzzles(fetched)
      setInput('')
      setFlash(null)

      if (saved?.completed) {
        setResults(fetched.map((p, i) => ({
          puzzle:  p,
          guesses: saved.results[i]?.guesses ?? [],
          solved:  saved.results[i]?.solved  ?? false,
        })))
        setCurrentIdx(fetched.length - 1)
        setPhase('done')
      } else if (saved) {
        setResults(fetched.map((p, i) => ({
          puzzle:  p,
          guesses: saved.results[i]?.guesses ?? [],
          solved:  saved.results[i]?.solved  ?? false,
        })))
        setCurrentIdx(saved.currentIdx)
        setPhase('playing')
      } else {
        setResults(fetched.map(p => ({ puzzle: p, guesses: [], solved: false })))
        setCurrentIdx(0)
        setPhase('playing')
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
      setPhase('error')
    }
  }, [])

  useEffect(() => { loadDaily() }, [loadDaily])

  // ── Persist progress ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!date || phase === 'loading' || phase === 'error' || results.length === 0) return
    saveProgress({
      date,
      currentIdx,
      results: results.map(r => ({ guesses: r.guesses, solved: r.solved })),
      completed: phase === 'done',
    })
  }, [date, currentIdx, results, phase])

  // ── Focus input ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (phase === 'playing') inputRef.current?.focus()
  }, [phase, currentIdx])

  // ── Derived state ───────────────────────────────────────────────────────────

  const current       = puzzles[currentIdx]
  const currentResult = results[currentIdx]
  const totalScore    = results.reduce((sum, r) =>
    r.solved ? sum + (MAX_GUESSES + 1 - r.guesses.length) : sum, 0)
  const maxScore = PUZZLES_PER_GAME * MAX_GUESSES

  // ── Game logic ──────────────────────────────────────────────────────────────

  const advance = useCallback(() => {
    const next = currentIdx + 1
    if (next >= puzzles.length) {
      setPhase('done')
    } else {
      setCurrentIdx(next)
      setInput('')
      setPhase('playing')
    }
  }, [currentIdx, puzzles.length])

  const submitGuess = useCallback(() => {
    if (phase !== 'playing' || !current || !currentResult) return
    const guess = input.trim().toUpperCase()
    if (!guess) return

    const isCorrect    = current.answers.includes(guess)
    const newGuesses   = [...currentResult.guesses, guess]
    const outOfGuesses = !isCorrect && newGuesses.length >= MAX_GUESSES

    setResults(prev => prev.map((r, i) =>
      i === currentIdx ? { ...r, guesses: newGuesses, solved: isCorrect } : r
    ))
    setInput('')

    if (isCorrect) {
      setFlash('correct')
      setPhase('reveal')
      setTimeout(() => { setFlash(null); advance() }, 900)
    } else if (outOfGuesses) {
      setFlash('wrong')
      setPhase('reveal')
      setTimeout(() => { setFlash(null); advance() }, 1400)
    } else {
      setShaking(true)
      setTimeout(() => setShaking(false), 450)
    }
  }, [phase, current, currentResult, input, currentIdx, advance])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submitGuess()
  }

  // ── Loading screen ──────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="game">
        <header className="game-header">
          <SpLinkIcon size={44} />
          <h1 className="game-title">SPLINK</h1>
        </header>
        <div className="status-screen">
          <div className="spinner" />
          <p>Loading today's puzzle…</p>
        </div>
      </div>
    )
  }

  // ── Error screen ────────────────────────────────────────────────────────────

  if (phase === 'error') {
    return (
      <div className="game">
        <header className="game-header">
          <SpLinkIcon size={44} />
          <h1 className="game-title">SPLINK</h1>
        </header>
        <div className="status-screen">
          <p className="error-msg">Failed to load today's puzzle</p>
          <p className="error-detail">{errorMsg}</p>
          <button className="play-again" onClick={loadDaily}>Try again</button>
        </div>
      </div>
    )
  }

  if (!current || !currentResult) return null

  // ── Done screen ─────────────────────────────────────────────────────────────

  if (phase === 'done') {
    const grade =
      totalScore >= 13 ? 'Excellent!' :
      totalScore >= 10 ? 'Great job'  :
      totalScore >= 7  ? 'Not bad'    :
      totalScore >= 4  ? 'Keep at it' : 'Better luck next time'

    return (
      <div className="game">
        <header className="game-header">
          <SpLinkIcon size={44} />
          <h1 className="game-title">SPLINK</h1>
        </header>
        <div className="done-screen">
          <div className="done-grade">{grade}</div>
          <div className="done-score">
            {totalScore}<span className="done-max"> / {maxScore}</span>
          </div>
          <div className="done-breakdown">
            {results.map((r, i) => (
              <div key={i} className={`done-row ${r.solved ? 'row-solved' : 'row-failed'}`}>
                <span className="done-compound">
                  {r.puzzle.word1}
                  <span className="done-sep">·</span>
                  <span className="done-answer">{r.puzzle.answers.join(' / ')}</span>
                  <span className="done-sep">·</span>
                  {r.puzzle.word2}
                </span>
                <span className="done-dots">
                  {Array.from({ length: MAX_GUESSES }).map((_, gi) => {
                    const isLastGuess = gi === r.guesses.length - 1
                    if (r.solved && isLastGuess) return <span key={gi} className="dot dot-correct" />
                    if (gi < r.guesses.length)   return <span key={gi} className="dot dot-miss" />
                    return <span key={gi} className="dot dot-empty" />
                  })}
                </span>
              </div>
            ))}
          </div>
          <div className="next-puzzle">
            <span className="next-label">Next puzzle in</span>
            <span className="countdown">{countdown}</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Playing / Reveal screen ─────────────────────────────────────────────────

  const guesses  = currentResult.guesses
  const solved   = currentResult.solved
  const revealed = phase === 'reveal'
  const showHint = phase === 'playing' && guesses.length >= MAX_GUESSES - 1

  return (
    <div className="game">
      <header className="game-header">
        <SpLinkIcon size={44} />
        <h1 className="game-title">SPLINK</h1>
        <p className="game-subtitle">Find the word that links both compound words together</p>
      </header>

      <div className="progress-bar">
        {Array.from({ length: PUZZLES_PER_GAME }).map((_, i) => (
          <div
            key={i}
            className={`progress-pip ${i < currentIdx ? 'pip-done' : i === currentIdx ? 'pip-active' : ''}`}
          />
        ))}
      </div>

      <div className={`puzzle-area ${flash === 'correct' ? 'flash-correct' : flash === 'wrong' ? 'flash-wrong' : ''}`}>
        <div className="puzzle-display">
          <span className="clue-word">{current.word1}</span>
          <span className="connector">+</span>
          {revealed ? (
            <span className={`answer-reveal ${solved ? 'answer-correct' : 'answer-wrong'}`}>
              {solved ? guesses[guesses.length - 1] : current.answers.join(' / ')}
            </span>
          ) : (
            <span className="blank-word">{'_'.repeat(current.answers[0].length)}</span>
          )}
          <span className="connector">+</span>
          <span className="clue-word">{current.word2}</span>
        </div>

        {showHint && !revealed && (
          <div className="hint">
            Hint: starts with <strong>{current.answers[0][0]}</strong>
            {current.answers[0].length >= 5 && <>, {current.answers[0].length} letters</>}
          </div>
        )}

        <div className="guess-history">
          {guesses.map((g, i) => {
            const isCorrectGuess = solved && i === guesses.length - 1
            return (
              <div key={i} className={`guess-chip ${isCorrectGuess ? 'chip-correct' : 'chip-wrong'}`}>
                {g}
              </div>
            )
          })}
        </div>

        {!revealed && (
          <div className={`input-row ${shaking ? 'shake' : ''}`}>
            <input
              ref={inputRef}
              className="guess-input"
              value={input}
              onChange={e => setInput(e.target.value.replace(/[^a-zA-Z]/g, ''))}
              onKeyDown={handleKeyDown}
              placeholder="type your answer…"
              maxLength={20}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
            />
            <button className="submit-btn" onClick={submitGuess} disabled={!input.trim()}>
              →
            </button>
          </div>
        )}

        <div className="attempts-row">
          {Array.from({ length: MAX_GUESSES }).map((_, i) => (
            <span key={i} className={`attempt-dot ${i < guesses.length ? 'dot-used' : ''}`} />
          ))}
        </div>
      </div>

      <div className="score-row">
        Score <strong>{totalScore}</strong>
        <span className="score-max"> / {maxScore}</span>
        <span className="puzzle-counter"> · {currentIdx + 1} of {PUZZLES_PER_GAME}</span>
      </div>
    </div>
  )
}
