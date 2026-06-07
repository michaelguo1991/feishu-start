import { createFileRoute } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'

export const Route = createFileRoute('/_app/apps')({
  component: AppsPage,
})

const apps = [
  {
    name: '站点首页',
    desc: 'zhangjie.life 主站',
    href: 'https://zhangjie.life/',
  },
  {
    name: '静态工作台',
    desc: '原 /feishu/ 静态页',
    href: 'https://zhangjie.life/feishu/',
  },
  {
    name: '镜像仓库',
    desc: '私有 Docker Registry',
    href: 'https://registry.zhangjie.life/',
  },
  {
    name: '飞书开放平台',
    desc: '管理应用与权限配置',
    href: 'https://open.feishu.cn/app',
  },
]

function AppsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold md:text-3xl">应用入口</h1>
        <p className="mt-2 text-sm text-slate-400">
          常用链接与内部工具，移动端与桌面端均可快速访问。
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {apps.map((app) => (
          <a
            key={app.href}
            href={app.href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-3xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-sky-500/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-medium">{app.name}</h2>
                <p className="mt-2 text-sm text-slate-400">{app.desc}</p>
              </div>
              <ExternalLink className="h-5 w-5 shrink-0 text-slate-600 transition group-hover:text-sky-400" />
            </div>
            <p className="mt-4 break-all font-mono text-xs text-slate-500">
              {app.href}
            </p>
          </a>
        ))}
      </section>
    </div>
  )
}
