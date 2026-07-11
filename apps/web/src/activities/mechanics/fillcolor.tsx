// ---------------------------------------------------------------------------
// Brain Booster Kids — FILL THE COLORS mechanic (replaces the Story activity)
//
// A colour-by-number mini-game: each cell shows a number; the child picks the
// matching palette colour and taps the cell to fill it. Complete the picture to
// win. Procedural board every round (see fillcolor.gen), difficulty scales by
// grid size + colour count, colour-blind-safe (every colour has a name, symbol
// and number). Self-contained — no dependency on the heavy games/ graph.
// ---------------------------------------------------------------------------
import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { LevelDef } from '../../data/levels'
import type { ActivitySpec } from '../types'
import { useStore, sfx, haptics, speak } from '../../state/store'
import { genFillBoard } from './fillcolor.gen'

interface FillColorProps {
  spec?: ActivitySpec
  level: LevelDef
  onDone: (accuracy: number, meta?: { hintsUsed?: number; seenIds?: string[] }) => void
}

export function FillColor({ spec, level, onDone }: FillColorProps) {
  const { state } = useStore()
  const soundOn = state.settings.sound
  const voiceOn = state.settings.voice
  const board = useMemo(() => genFillBoard(level.tierIndex), [level]) // eslint-disable-line
  const total = board.plan.length

  const [filled, setFilled] = useState<(number | null)[]>(() => board.plan.map(() => null))
  const [sel, setSel] = useState<number | null>(0)   // selected palette index
  const [wrongCell, setWrongCell] = useState<number | null>(null)
  const mistakes = useRef(0)
  const done = useRef(false)

  useEffect(() => { setFilled(board.plan.map(() => null)); setSel(0); mistakes.current = 0; done.current = false }, [board])
  useEffect(() => { if (voiceOn) speak('Fill each square with the colour that matches its number!', voiceOn) }, []) // eslint-disable-line

  const placedCount = filled.filter((f) => f !== null).length

  const tapCell = (i: number) => {
    if (done.current || filled[i] !== null || sel === null) return
    if (board.plan[i] === sel) {
      if (soundOn) sfx.good()
      const next = filled.slice(); next[i] = sel; setFilled(next)
      if (next.every((f) => f !== null)) {
        done.current = true
        const acc = Math.max(0.4, 1 - mistakes.current / total)
        if (soundOn) sfx.coin()
        setTimeout(() => onDone(acc), 500)
      }
    } else {
      if (soundOn) sfx.bad()
      haptics.wrong()
      mistakes.current++
      setWrongCell(i)
      setTimeout(() => setWrongCell(null), 400)
    }
  }

  const cellPx = board.size <= 2 ? 96 : board.size === 3 ? 78 : 62

  return (
    <div className="game-area">
      <div className="game-title-bar">
        <span className="game-title-icon">🎨</span>
        <span className="game-title-text">{spec?.name ?? 'Fill the Colors'}</span>
        <span className="game-title-sub">{placedCount}/{total}</span>
      </div>
      <p className="game-hint">Pick a colour, then tap the squares with its number! 🖌️</p>

      {/* The picture grid */}
      <div
        role="group"
        aria-label="Colouring grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${board.size}, ${cellPx}px)`,
          gap: 8,
          justifyContent: 'center',
          margin: '4px auto 14px',
        }}
      >
        {board.plan.map((planIdx, i) => {
          const f = filled[i]
          const filledColor = f !== null ? board.colors[f] : null
          const isWrong = wrongCell === i
          return (
            <button
              key={i}
              type="button"
              onClick={() => tapCell(i)}
              aria-label={f !== null ? `Filled ${board.colors[f].name}` : `Square, needs colour ${planIdx + 1}`}
              style={{
                width: cellPx,
                height: cellPx,
                borderRadius: 12,
                border: isWrong ? '3px solid var(--danger, #e5484d)' : '2px solid var(--sky-deep, #cfe0f5)',
                background: filledColor ? filledColor.hex : 'var(--card, #fff)',
                color: filledColor ? '#fff' : 'var(--ink, #29314a)',
                display: 'grid',
                placeItems: 'center',
                fontSize: cellPx * 0.34,
                fontWeight: 900,
                cursor: f === null ? 'pointer' : 'default',
                transition: state.settings.reducedMotion ? 'none' : 'transform .1s ease, background .15s ease',
                transform: isWrong ? 'translateX(-2px)' : 'none',
              }}
            >
              {filledColor ? <span aria-hidden="true">{filledColor.symbol}</span> : planIdx + 1}
            </button>
          )
        })}
      </div>

      {/* Palette */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }} role="group" aria-label="Colour palette">
        {board.colors.map((c, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => { if (soundOn) sfx.tap(); setSel(idx) }}
            aria-label={`${c.name}, number ${idx + 1}${sel === idx ? ', selected' : ''}`}
            aria-pressed={sel === idx}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 999,
              border: sel === idx ? '3px solid var(--ink, #29314a)' : '2px solid transparent',
              background: c.hex,
              color: '#fff',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: sel === idx ? '0 0 0 3px rgba(0,0,0,0.12)' : '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            <span aria-hidden="true">{c.symbol}</span> {idx + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
