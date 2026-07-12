import { useEffect, useState, type FormEvent } from 'react'
import { contentApi, fileToDataUri, type FunFact, type FunFactInput } from '../auth/content'
import { ApiError } from '../auth/api'

const EMPTY: FunFactInput = { icon: '💡', category: '', title: '', text: '', imageUrl: null, themes: [] }

/** Fun-facts CRUD with image/GIF (URL or uploaded file → data URI). */
export function FunFactsPanel() {
  const [facts, setFacts] = useState<FunFact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FunFactInput>(EMPTY)
  const [themes, setThemes] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setFacts((await contentApi.funFacts()).facts)
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void load() }, [])

  function reset() {
    setEditingId(null)
    setForm(EMPTY)
    setThemes('')
    setFormError(null)
  }

  function edit(f: FunFact) {
    setEditingId(f.id)
    setForm({ icon: f.icon, category: f.category, title: f.title, text: f.text, imageUrl: f.imageUrl })
    setThemes(f.themes.join(', '))
    setFormError(null)
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setFormError('Image must be under 5 MB'); return }
    try {
      const dataUri = await fileToDataUri(file)
      setForm((f) => ({ ...f, imageUrl: dataUri }))
    } catch {
      setFormError('Could not read that file')
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!form.title.trim() || !form.text.trim()) { setFormError('Title and text are required'); return }
    const payload: FunFactInput = {
      ...form,
      themes: themes.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
    }
    setSaving(true)
    try {
      if (editingId) await contentApi.updateFunFact(editingId, payload)
      else await contentApi.createFunFact(payload)
      reset()
      await load()
    } catch (e2) {
      setFormError((e2 as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(f: FunFact) {
    if (!window.confirm(`Delete fun fact "${f.title}"?`)) return
    try {
      await contentApi.deleteFunFact(f.id)
      if (editingId === f.id) reset()
      await load()
    } catch (e) {
      setError((e as ApiError).message)
    }
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>💡 Fun Facts</h2>
        <button className="btn" onClick={() => void load()} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
      </div>

      <form className="ff-form" onSubmit={onSubmit}>
        <div className="ff-form-grid">
          <label className="field" style={{ maxWidth: 80 }}>
            <span>Icon</span>
            <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} maxLength={4} disabled={saving} />
          </label>
          <label className="field">
            <span>Category</span>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Animals" disabled={saving} />
          </label>
          <label className="field">
            <span>Title</span>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Octopus Hearts" disabled={saving} />
          </label>
          <label className="field">
            <span>Themes (comma-separated)</span>
            <input value={themes} onChange={(e) => setThemes(e.target.value)} placeholder="ocean, general" disabled={saving} />
          </label>
        </div>
        <label className="field">
          <span>Fact text</span>
          <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={2} placeholder="An octopus has three hearts!" disabled={saving} />
        </label>
        <div className="ff-image-row">
          <label className="field" style={{ flex: 1 }}>
            <span>Image / GIF URL (or upload)</span>
            <input value={form.imageUrl ?? ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value || null })} placeholder="https://… or upload →" disabled={saving} />
          </label>
          <label className="btn ff-upload">
            Upload<input type="file" accept="image/*,image/gif" onChange={onFile} hidden disabled={saving} />
          </label>
          {form.imageUrl && <img className="ff-preview" src={form.imageUrl} alt="preview" />}
          {form.imageUrl && <button type="button" className="btn" onClick={() => setForm({ ...form, imageUrl: null })}>Remove</button>}
        </div>
        {formError && <p className="field-error" role="alert">{formError}</p>}
        <div className="row-actions">
          <button className="login-button" style={{ margin: 0 }} type="submit" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Update fact' : '+ Add fact'}
          </button>
          {editingId && <button type="button" className="btn" onClick={reset} disabled={saving}>Cancel edit</button>}
        </div>
      </form>

      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="ff-list">
        {facts.map((f) => (
          <div key={f.id} className={`ff-card${editingId === f.id ? ' editing' : ''}`}>
            <div className="ff-card-media">
              {f.imageUrl ? <img src={f.imageUrl} alt="" /> : <span className="ff-emoji">{f.icon}</span>}
            </div>
            <div className="ff-card-body">
              <span className="ff-cat">{f.icon} {f.category}</span>
              <strong>{f.title}</strong>
              <p className="muted">{f.text}</p>
              {f.themes.length > 0 && <span className="ff-themes">{f.themes.join(' · ')}</span>}
            </div>
            <div className="ff-card-actions">
              <button className="btn" onClick={() => edit(f)}>Edit</button>
              <button className="btn danger" onClick={() => void remove(f)}>Delete</button>
            </div>
          </div>
        ))}
        {facts.length === 0 && !loading && <p className="muted">No fun facts yet. Add one above.</p>}
      </div>
    </div>
  )
}
