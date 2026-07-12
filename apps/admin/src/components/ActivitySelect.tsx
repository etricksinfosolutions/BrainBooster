import { useEffect, useMemo, useRef, useState } from 'react'

export interface ActivityOption {
  id: string
  name: string
  icon: string
  category: string
  mechanic?: string
}

interface Props {
  options: ActivityOption[]
  value: string
  onChange: (id: string) => void
  disabled?: boolean
  /** Label for the empty/"no override" choice. */
  autoLabel?: string
  id?: string
}

// The always-present "auto" choice (empty id = clear the override).
const AUTO_ID = ''

/**
 * A select2-style combobox: options grouped by category, type-to-search, and
 * full keyboard support — implemented natively (no jQuery / select2 dependency).
 */
export function ActivitySelect({ options, value, onChange, disabled, autoLabel = 'Auto (let the game choose)', id }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.id === value) || null

  // Filter + group by category. The flat list drives keyboard navigation; the
  // grouped list drives rendering. Index 0 is always the "Auto" choice.
  const { groups, flat } = useMemo(() => {
    const q = query.trim().toLowerCase()
    const match = (o: ActivityOption) =>
      !q ||
      o.name.toLowerCase().includes(q) ||
      o.category.toLowerCase().includes(q) ||
      (o.mechanic || '').toLowerCase().includes(q)

    const filtered = options.filter(match)
    const byCat = new Map<string, ActivityOption[]>()
    for (const o of filtered) {
      const arr = byCat.get(o.category) || []
      arr.push(o)
      byCat.set(o.category, arr)
    }
    const showAuto = !q || autoLabel.toLowerCase().includes(q)
    const flatList: { id: string; label: string; icon: string }[] = []
    if (showAuto) flatList.push({ id: AUTO_ID, label: autoLabel, icon: '✨' })
    const grouped = [...byCat.entries()].map(([category, items]) => {
      items.forEach((o) => flatList.push({ id: o.id, label: `${o.name} · ${o.category}`, icon: o.icon }))
      return { category, items }
    })
    return { groups: grouped, flat: flatList, showAuto }
  }, [options, query, autoLabel])

  // Keep the active option in range + scrolled into view when navigating.
  useEffect(() => {
    if (activeIndex >= flat.length) setActiveIndex(Math.max(0, flat.length - 1))
  }, [flat.length, activeIndex])
  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`)
    el?.scrollIntoView?.({ block: 'nearest' })
  }, [activeIndex, open])

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  function openMenu() {
    if (disabled) return
    setOpen(true)
    setQuery('')
    const idx = flatIndexOf(value)
    setActiveIndex(idx >= 0 ? idx : 0)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function flatIndexOf(idVal: string) {
    return flat.findIndex((f) => f.id === idVal)
  }

  function choose(idVal: string) {
    onChange(idVal)
    setOpen(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      openMenu()
      return
    }
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(flat.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = flat[activeIndex]
      if (opt) choose(opt.id)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
  }

  let renderIdx = flat.length && flat[0].id === AUTO_ID ? 1 : 0 // auto occupies index 0 when shown
  const autoShown = flat.length > 0 && flat[0].id === AUTO_ID

  return (
    <div className={`s2${disabled ? ' disabled' : ''}`} ref={rootRef} onKeyDown={onKeyDown}>
      <button
        type="button"
        id={id}
        className="s2-control"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
      >
        <span className="s2-value">
          {selected ? (
            <>
              <span aria-hidden="true">{selected.icon}</span> {selected.name}
              <span className="s2-cat">{selected.category}</span>
            </>
          ) : (
            <span className="muted">✨ {autoLabel}</span>
          )}
        </span>
        <span className="s2-arrow" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="s2-menu" role="listbox" aria-label="Activities">
          <div className="s2-search">
            <input
              ref={inputRef}
              type="text"
              value={query}
              placeholder="Search activities…"
              onChange={(e) => { setQuery(e.target.value); setActiveIndex(0) }}
              aria-label="Search activities"
            />
          </div>
          <div className="s2-list" ref={listRef}>
            {autoShown && (
              <div
                data-idx={0}
                role="option"
                aria-selected={value === AUTO_ID}
                className={`s2-opt s2-auto${activeIndex === 0 ? ' active' : ''}${value === AUTO_ID ? ' selected' : ''}`}
                onMouseEnter={() => setActiveIndex(0)}
                onClick={() => choose(AUTO_ID)}
              >
                <span aria-hidden="true">✨</span> {autoLabel}
              </div>
            )}
            {groups.map((g) => (
              <div className="s2-group" key={g.category}>
                <div className="s2-group-label">{g.category}</div>
                {g.items.map((o) => {
                  const idx = renderIdx++
                  return (
                    <div
                      key={o.id}
                      data-idx={idx}
                      role="option"
                      aria-selected={value === o.id}
                      className={`s2-opt${activeIndex === idx ? ' active' : ''}${value === o.id ? ' selected' : ''}`}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => choose(o.id)}
                    >
                      <span aria-hidden="true">{o.icon}</span> {o.name}
                    </div>
                  )
                })}
              </div>
            ))}
            {flat.length === 0 && <div className="s2-empty">No matching activities</div>}
          </div>
        </div>
      )}
    </div>
  )
}
