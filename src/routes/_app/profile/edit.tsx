import {
  createFileRoute,
  getRouteApi,
  Link,
  useRouter,
} from '@tanstack/react-router'
import { useState } from 'react'

import { LoginPrompt } from '#/components/LoginPrompt'
import {
  getLatestProfile,
  saveProfile,
  type ProfileDto,
} from '#/server/profile'

const appRoute = getRouteApi('/_app')

export const Route = createFileRoute('/_app/profile/edit')({
  loader: async () => {
    try {
      return await getLatestProfile()
    } catch {
      return null
    }
  },
  component: ProfileEditPage,
})

function ProfileEditPage() {
  const auth = appRoute.useLoaderData()
  const latest = Route.useLoaderData()
  const router = useRouter()

  if (!auth.user) {
    return <LoginPrompt title="登录后编辑个人资料" />
  }

  return (
    <ProfileEditForm
      initial={latest}
      onSaved={async () => {
        await router.invalidate()
        await router.navigate({ to: '/profile' })
      }}
    />
  )
}

function ProfileEditForm({
  initial,
  onSaved,
}: {
  initial: ProfileDto
  onSaved: () => Promise<void>
}) {
  const [displayName, setDisplayName] = useState(initial?.displayName ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [department, setDepartment] = useState(initial?.department ?? '')
  const [bio, setBio] = useState(initial?.bio ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      await saveProfile({
        data: { displayName, phone, department, bio },
      })
      await onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">编辑个人资料</h1>
        <p className="mt-2 text-sm text-slate-400">
          每次保存都会生成新版本，历史记录可在版本列表中查看。
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
      >
        <Field label="显示姓名" required>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={inputClass}
            placeholder="你希望展示的姓名"
            maxLength={50}
            required
          />
        </Field>

        <Field label="手机号">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="可选"
            maxLength={20}
          />
        </Field>

        <Field label="部门">
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className={inputClass}
            placeholder="例如：产品部"
            maxLength={100}
          />
        </Field>

        <Field label="简介">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={`${inputClass} min-h-28 resize-y`}
            placeholder="一句话介绍自己"
            maxLength={500}
          />
        </Field>

        {error ? (
          <p className="text-sm text-rose-300">{error}</p>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-medium text-slate-950 disabled:opacity-60"
          >
            {saving ? '保存中…' : '保存新版本'}
          </button>
          <Link
            to="/profile/history"
            className="rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-200"
          >
            查看历史版本
          </Link>
          <Link
            to="/profile"
            className="rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-200"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
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
