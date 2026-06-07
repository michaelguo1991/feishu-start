import {
  createFileRoute,
  getRouteApi,
  Link,
  useRouter,
} from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'

import { LoginPrompt } from '#/components/LoginPrompt'
import { getProfileVersion, restoreProfileVersion } from '#/server/profile'

const appRoute = getRouteApi('/_app')

export const Route = createFileRoute('/_app/profile/history/$version')({
  params: {
    parse: (params) => ({
      version: z.coerce.number().int().positive().parse(params.version),
    }),
    stringify: ({ version }) => ({ version: String(version) }),
  },
  loader: async ({ params }) => {
    try {
      return await getProfileVersion({ data: { version: params.version } })
    } catch {
      return null
    }
  },
  component: ProfileVersionPage,
})

function ProfileVersionPage() {
  const auth = appRoute.useLoaderData()
  const profile = Route.useLoaderData()
  const { version } = Route.useParams()
  const router = useRouter()
  const [restoring, setRestoring] = useState(false)
  const [error, setError] = useState('')

  if (!auth.user) {
    return <LoginPrompt title="登录后查看版本详情" />
  }

  if (!profile) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center">
        <h2 className="text-xl font-medium">版本不存在</h2>
        <Link
          to="/profile/history"
          className="mt-4 inline-flex text-sm text-sky-400 hover:text-sky-300"
        >
          返回历史列表
        </Link>
      </section>
    )
  }

  async function handleRestore() {
    setRestoring(true)
    setError('')
    try {
      await restoreProfileVersion({ data: { version } })
      await router.invalidate()
      await router.navigate({ to: '/profile' })
    } catch (err) {
      setError(err instanceof Error ? err.message : '恢复失败')
    } finally {
      setRestoring(false)
    }
  }

  const fields = [
    ['显示姓名', profile.displayName],
    ['手机号', profile.phone || '-'],
    ['部门', profile.department || '-'],
    ['简介', profile.bio || '-'],
    ['保存时间', new Date(profile.createdAt).toLocaleString('zh-CN')],
    ['版本号', `v${profile.version}`],
  ]

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-sky-400">版本 v{profile.version}</p>
        <h1 className="mt-2 text-2xl font-semibold md:text-3xl">
          {profile.displayName}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          恢复此版本会基于该内容创建一个新版本，不会删除历史记录。
        </p>
      </header>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <dl className="space-y-4">
          {fields.map(([label, value]) => (
            <div
              key={label}
              className="grid gap-2 border-b border-slate-800 pb-4 sm:grid-cols-[120px_1fr]"
            >
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="whitespace-pre-wrap text-sm text-slate-200">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleRestore}
          disabled={restoring}
          className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-medium text-slate-950 disabled:opacity-60"
        >
          {restoring ? '恢复中…' : '恢复此版本'}
        </button>
        <Link
          to="/profile/history"
          className="rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-200"
        >
          返回历史列表
        </Link>
        <Link
          to="/profile/edit"
          className="rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-200"
        >
          编辑资料
        </Link>
      </div>
    </div>
  )
}
