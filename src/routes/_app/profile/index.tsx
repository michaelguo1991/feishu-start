import { createFileRoute, Link, getRouteApi } from '@tanstack/react-router'

import { LoginPrompt } from '#/components/LoginPrompt'
import { getLatestProfile } from '#/server/profile'

const appRoute = getRouteApi('/_app')

export const Route = createFileRoute('/_app/profile/')({
  loader: async () => {
    try {
      return { savedProfile: await getLatestProfile() }
    } catch {
      return { savedProfile: null }
    }
  },
  component: ProfilePage,
})

function ProfilePage() {
  const auth = appRoute.useLoaderData()
  const { savedProfile } = Route.useLoaderData()

  if (!auth.user) {
    return <LoginPrompt title="登录后查看个人信息" />
  }

  const user = auth.user
  const feishuFields = [
    ['姓名', user.name],
    ['英文名', user.enName || '-'],
    ['邮箱', user.email || '-'],
    ['Open ID', user.openId],
    ['Union ID', user.unionId],
    ['User ID', user.userId],
    ['Tenant Key', user.tenantKey],
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">个人中心</h1>
          <p className="mt-2 text-sm text-slate-400">
            飞书账号信息与已保存的个人资料
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/profile/edit"
            className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950"
          >
            编辑资料
          </Link>
          <Link
            to="/profile/history"
            className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200"
          >
            版本历史
          </Link>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium">已保存资料</h2>
          {savedProfile ? (
            <span className="text-xs text-slate-500">
              当前 v{savedProfile.version} ·{' '}
              {new Date(savedProfile.createdAt).toLocaleString('zh-CN')}
            </span>
          ) : null}
        </div>
        {savedProfile ? (
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <SavedField label="显示姓名" value={savedProfile.displayName} />
            <SavedField label="手机号" value={savedProfile.phone || '-'} />
            <SavedField label="部门" value={savedProfile.department || '-'} />
            <SavedField
              label="简介"
              value={savedProfile.bio || '-'}
              className="sm:col-span-2"
            />
          </dl>
        ) : (
          <p className="mt-4 text-sm text-slate-400">
            还没有保存过资料。{' '}
            <Link to="/profile/edit" className="text-sky-400 hover:text-sky-300">
              去填写
            </Link>
          </p>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="mx-auto h-24 w-24 rounded-3xl border border-slate-700 object-cover md:mx-0 md:h-28 md:w-28"
            />
          ) : (
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-800 text-3xl md:mx-0 md:h-28 md:w-28">
              {user.name.slice(0, 1)}
            </div>
          )}
          <h2 className="mt-5 text-center text-xl font-medium md:text-left">
            {user.name}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400 md:text-left">
            已通过飞书登录
          </p>
          {auth.expiresAt ? (
            <p className="mt-4 text-center text-xs text-slate-500 md:text-left">
              会话过期：{new Date(auth.expiresAt).toLocaleString('zh-CN')}
            </p>
          ) : null}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-lg font-medium">飞书账号详情</h3>
          <dl className="mt-6 space-y-4">
            {feishuFields.map(([label, value]) => (
              <div
                key={label}
                className="grid gap-2 border-b border-slate-800 pb-4 sm:grid-cols-[120px_1fr]"
              >
                <dt className="text-sm text-slate-500">{label}</dt>
                <dd className="break-all font-mono text-sm text-slate-200">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <form action="/feishu-app/api/auth/logout" method="post">
        <button
          type="submit"
          className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200"
        >
          退出登录
        </button>
      </form>
    </div>
  )
}

function SavedField({
  label,
  value,
  className = '',
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-200">{value}</dd>
    </div>
  )
}
