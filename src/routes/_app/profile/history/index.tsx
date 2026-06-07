import { createFileRoute, getRouteApi, Link } from '@tanstack/react-router'

import { LoginPrompt } from '#/components/LoginPrompt'
import { listProfileVersions } from '#/server/profile'

const appRoute = getRouteApi('/_app')

export const Route = createFileRoute('/_app/profile/history/')({
  loader: async () => {
    try {
      return await listProfileVersions()
    } catch {
      return []
    }
  },
  component: ProfileHistoryPage,
})

function ProfileHistoryPage() {
  const auth = appRoute.useLoaderData()
  const versions = Route.useLoaderData()

  if (!auth.user) {
    return <LoginPrompt title="登录后查看版本历史" />
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">资料版本历史</h1>
          <p className="mt-2 text-sm text-slate-400">
            每次保存都会递增版本号，旧版本不会被覆盖。
          </p>
        </div>
        <Link
          to="/profile/edit"
          className="inline-flex rounded-2xl bg-sky-500 px-5 py-3 text-sm font-medium text-slate-950"
        >
          编辑资料
        </Link>
      </header>

      {versions.length === 0 ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center">
          <p className="text-slate-400">还没有保存过个人资料。</p>
          <Link
            to="/profile/edit"
            className="mt-4 inline-flex text-sm text-sky-400 hover:text-sky-300"
          >
            去填写第一份资料
          </Link>
        </section>
      ) : (
        <section className="space-y-3">
          {versions.map((item) => (
            <Link
              key={item.version}
              to="/profile/history/$version"
              params={{ version: String(item.version) }}
              className="block rounded-3xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-sky-500/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">
                    v{item.version} · {item.displayName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(item.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <span className="text-sm text-sky-400">查看详情 →</span>
              </div>
            </Link>
          ))}
        </section>
      )}

      <Link
        to="/profile"
        className="inline-flex rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200"
      >
        返回个人中心
      </Link>
    </div>
  )
}
