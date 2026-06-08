import { createFileRoute } from '@tanstack/react-router'

import { LoginPrompt } from '#/components/LoginPrompt'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const auth = Route.parentRoute!.useLoaderData()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">设置</h1>
        <p className="mt-2 text-sm text-slate-400">应用配置与会话管理</p>
      </header>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-medium">运行状态</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-slate-500">飞书凭证</dt>
            <dd>{auth.configured ? '已配置' : '未配置'}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-slate-500">App ID</dt>
            <dd className="break-all font-mono text-slate-300">
              {auth.appId || '-'}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-slate-500">OAuth 回调</dt>
            <dd className="break-all font-mono text-xs text-slate-300">
              {auth.redirectUri}
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-slate-500">登录状态</dt>
            <dd>{auth.user ? `已登录（${auth.user.name}）` : '未登录'}</dd>
          </div>
        </dl>
      </section>

      {auth.user ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-medium">账户操作</h2>
          <p className="mt-2 text-sm text-slate-400">
            退出后将清除当前会话 Cookie，飞书客户端内再次打开会自动免登。
          </p>
          <form action="/feishu-app/api/auth/logout" method="post" className="mt-4">
            <button
              type="submit"
              className="w-full rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 sm:w-auto"
            >
              退出登录
            </button>
          </form>
        </section>
      ) : (
        <LoginPrompt title="登录后可管理会话" />
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 text-xs text-slate-500">
        <p>部署路径：/feishu-app/</p>
      </section>
    </div>
  )
}
