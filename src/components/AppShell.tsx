import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { Home, LayoutGrid, Settings, User } from 'lucide-react'
import type { ReactNode } from 'react'

import type { AuthState } from '#/server/auth'

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/profile', label: '个人', icon: User },
  { to: '/apps', label: '应用', icon: LayoutGrid },
  { to: '/settings', label: '设置', icon: Settings },
] as const

export function AppShell({
  auth,
  children,
}: {
  auth: AuthState
  children?: ReactNode
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-800 bg-slate-950/95 backdrop-blur md:flex md:flex-col">
        <div className="border-b border-slate-800 px-5 py-6">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-400">
            飞书工作台
          </p>
          <h1 className="mt-2 text-lg font-semibold">小郭 · Demo</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = isActive(pathname, to)
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  active
                    ? 'bg-sky-500/15 text-sky-300'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-slate-800 p-4 text-xs text-slate-500">
          {auth.user ? (
            <p className="truncate">已登录：{auth.user.name}</p>
          ) : (
            <p>未登录</p>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur md:hidden">
          <div>
            <p className="text-xs text-sky-400">飞书工作台</p>
            <p className="text-sm font-medium">
              {navItems.find((item) => isActive(pathname, item.to))?.label ??
                '首页'}
            </p>
          </div>
          {auth.user ? (
            <span className="max-w-[40vw] truncate rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-400">
              {auth.user.name}
            </span>
          ) : null}
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6 pb-28 md:pb-10">
          {children ?? <Outlet />}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="grid grid-cols-4">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = isActive(pathname, to)
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] transition ${
                  active ? 'text-sky-400' : 'text-slate-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function isActive(pathname: string, to: string) {
  if (to === '/') return pathname === '/' || pathname === ''
  return pathname === to || pathname.startsWith(`${to}/`)
}
