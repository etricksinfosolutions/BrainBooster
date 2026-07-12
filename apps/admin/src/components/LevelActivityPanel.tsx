import { useEffect, useMemo, useState } from 'react'
import { contentApi, type LevelConfig } from '../auth/content'
import { ApiError } from '../auth/api'
import { ActivitySelect } from './ActivitySelect'

/**
 * Level → Activity: levels on the left, an activity dropdown on the right.
 * Saving pins the chosen activity to that level; the game then runs ONLY that
 * activity there.
 */
export function LevelActivityPanel() {
  const [config, setConfig] = useState<LevelConfig | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [choice, setChoice] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const cfg = await contentApi.levels()
      setConfig(cfg)
      if (selected == null && cfg.levels.length) setSelected(cfg.levels[0].id)
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void load() }, [])

  // Keep the dropdown in sync with the selected level's current assignment.
  useEffect(() => {
    if (config && selected != null) setChoice(config.assignments[String(selected)] || '')
  }, [selected, config])

  const activityById = useMemo(() => {
    const m: Record<string, { name: string; icon: string }> = {}
    config?.activities.forEach((a) => (m[a.id] = { name: a.name, icon: a.icon }))
    return m
  }, [config])

  async function save() {
    if (selected == null) return
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const { assignments } = await contentApi.setLevelActivity(selected, choice || null)
      setConfig((c) => (c ? { ...c, assignments } : c))
      setNotice(choice ? 'Saved — this level will run the selected activity.' : 'Cleared — this level auto-picks again.')
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="panel"><p className="muted">Loading levels…</p></div>
  if (error && !config) return <div className="panel"><p className="field-error">{error}</p></div>
  if (!config) return null

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>🗺️ Level Activities</h2>
        <span className="muted">Pin an activity to any level. Pinned levels run only that activity.</span>
      </div>
      <div className="la-layout">
        {/* Left: levels */}
        <div className="la-levels" role="listbox" aria-label="Levels">
          {config.levels.map((lv) => {
            const assigned = config.assignments[String(lv.id)]
            return (
              <button
                key={lv.id}
                role="option"
                aria-selected={selected === lv.id}
                className={`la-level${selected === lv.id ? ' active' : ''}`}
                onClick={() => setSelected(lv.id)}
              >
                <span className="la-level-id">Level {lv.id}</span>
                <span className="la-level-tier">{lv.tier}</span>
                <span className="la-level-act">
                  {assigned ? `${activityById[assigned]?.icon ?? '📌'} ${activityById[assigned]?.name ?? assigned}` : <em className="muted">auto</em>}
                </span>
              </button>
            )
          })}
        </div>

        {/* Right: activity picker */}
        <div className="la-detail">
          {selected != null && (
            <>
              <h3>Level {selected} <span className="la-tier-badge">{config.levels.find((l) => l.id === selected)?.tier}</span></h3>
              <div className="field">
                <label id="la-activity-label"><span>Activity for this level</span></label>
                <ActivitySelect
                  options={config.activities}
                  value={choice}
                  onChange={setChoice}
                  disabled={saving}
                  autoLabel="Auto (let the game choose)"
                />
              </div>
              <div className="row-actions">
                <button className="login-button" style={{ margin: 0 }} onClick={() => void save()} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button className="btn" onClick={() => { setChoice(''); }} disabled={saving || !choice}>Set to Auto</button>
              </div>
              {notice && <p className="la-notice" role="status">{notice}</p>}
              {error && <p className="field-error" role="alert">{error}</p>}
              <p className="legend">
                {choice
                  ? `Preview: ${activityById[choice]?.icon} ${activityById[choice]?.name} will always run on level ${selected}.`
                  : `Preview: level ${selected} will auto-pick an age-appropriate activity.`}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
