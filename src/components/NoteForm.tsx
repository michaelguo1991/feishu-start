import { useState } from 'react'

import type { NoteDto } from '#/server/notes'

export function NoteForm({
  initial,
  submitLabel,
  onSubmit,
  secondaryActions,
}: {
  initial?: Pick<NoteDto, 'title' | 'content'>
  submitLabel: string
  onSubmit: (data: { title: string; content: string }) => Promise<void>
  secondaryActions?: React.ReactNode
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSubmit({ title, content })
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
    >
      <Field label="标题" required>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="笔记标题"
          maxLength={100}
          required
        />
      </Field>

      <Field label="正文">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`${inputClass} min-h-40 resize-y`}
          placeholder="正文内容"
          maxLength={10000}
        />
      </Field>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-medium text-slate-950 disabled:opacity-60"
        >
          {saving ? '保存中…' : submitLabel}
        </button>
        {secondaryActions}
      </div>
    </form>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-slate-400">
        {label}
        {required ? <span className="text-rose-400"> *</span> : null}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-500'
