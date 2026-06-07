import { Link } from '@tanstack/react-router'

export function LoginPrompt({ title = '需要登录' }: { title?: string }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center">
      <h2 className="text-xl font-medium">{title}</h2>
      <p className="mt-3 text-sm text-slate-400">
        请先在首页完成飞书登录，再访问此页面。
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-2xl bg-sky-500 px-5 py-3 text-sm font-medium text-slate-950"
      >
        前往首页登录
      </Link>
    </section>
  )
}
