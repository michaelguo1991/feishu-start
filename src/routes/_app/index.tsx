import { createFileRoute, Link } from '@tanstack/react-router'
import { LayoutGrid, NotebookText, Settings, User } from 'lucide-react'
import { z } from 'zod'

import { FeishuGuestAuth } from '#/components/FeishuGuestAuth'

const homeSearchSchema = z.object({
  error: z
    .enum([
      'access_denied',
      'invalid_callback',
      'invalid_state',
      'token_exchange_failed',
    ])
    .optional(),
})

export const Route = createFileRoute('/_app/')({
  validateSearch: homeSearchSchema,
  component: HomePage,
})

const errorMessages: Record<string, string> = {
  access_denied: '你已取消飞书授权。',
  invalid_callback: '飞书回调参数无效，请重试。',
  invalid_state: '授权状态校验失败，请重新登录。',
  token_exchange_failed: '换取飞书访问凭证失败，请检查应用配置与权限。',
}

const quickLinks = [
  {
    to: '/profile' as const,
    label: '个人中心',
    desc: '查看飞书账号信息与登录状态',
    icon: User,
  },
  {
    to: '/notes' as const,
    label: '笔记',
    desc: '创建与管理你的个人笔记',
    icon: NotebookText,
  },
  {
    to: '/apps' as const,
    label: '应用入口',
    desc: '常用站点与内部工具链接',
    icon: LayoutGrid,
  },
  {
    to: '/settings' as const,
    label: '设置',
    desc: '应用配置与退出登录',
    icon: Settings,
  },
]

function HomePage() {
  const auth = Route.parentRoute!.useLoaderData()
  const { error } = Route.useSearch()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">飞书工作台</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400 md:text-base">
          飞书客户端内自动免登；外部浏览器走 OAuth 登录。
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessages[error] ?? '登录失败，请重试。'}
        </div>
      ) : null}

      {!auth.configured ? (
        <section className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6">
          <h2 className="text-lg font-medium text-amber-100">部署前配置</h2>
          <p className="mt-3 text-sm text-slate-300">
            在 k8s Secret 或本地 <code>.env</code> 中设置飞书凭证与
            SESSION_SECRET。
          </p>
        </section>
      ) : auth.user ? (
        <>
          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 md:p-6">
            <p className="text-sm text-slate-400">欢迎回来</p>
            <h2 className="mt-1 text-xl font-medium md:text-2xl">
              {auth.user.name}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {auth.user.email || auth.user.openId}
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map(({ to, label, desc, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-sky-500/30 hover:bg-slate-900"
              >
                <Icon className="h-6 w-6 text-sky-400" />
                <h3 className="mt-4 font-medium">{label}</h3>
                <p className="mt-2 text-sm text-slate-400">{desc}</p>
              </Link>
            ))}
          </section>
        </>
      ) : (
        <FeishuGuestAuth appId={auth.appId} redirectUri={auth.redirectUri} />
      )}
    </div>
  )
}
