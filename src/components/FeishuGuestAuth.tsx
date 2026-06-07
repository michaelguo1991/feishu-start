import { useEffect, useState } from 'react'

import { ensureFeishuClientReady, loginViaFeishuJsapi } from '#/lib/feishu-client'

type AutoLoginState = 'idle' | 'loading' | 'error' | 'unsupported'

export function FeishuGuestAuth({
  appId,
  redirectUri,
}: {
  appId: string
  redirectUri: string
}) {
  const [autoLoginState, setAutoLoginState] = useState<AutoLoginState>('idle')
  const [autoLoginError, setAutoLoginError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function runAutoLogin() {
      const inClient = await ensureFeishuClientReady()
      if (!inClient) {
        if (!cancelled) setAutoLoginState('unsupported')
        return
      }

      setAutoLoginState('loading')
      try {
        await loginViaFeishuJsapi(appId)
        if (cancelled) return
        // 免登后刷新整页，确保 _app loader 读到新 Cookie
        window.location.assign('/feishu-app/')
      } catch (error) {
        if (!cancelled) {
          setAutoLoginState('error')
          setAutoLoginError(
            error instanceof Error ? error.message : '飞书客户端免登失败',
          )
        }
      }
    }

    void runAutoLogin()

    return () => {
      cancelled = true
    }
  }, [appId])

  if (autoLoginState === 'loading' || autoLoginState === 'idle') {
    return (
      <section className="rounded-3xl border border-sky-500/20 bg-sky-500/10 p-8">
        <h2 className="text-2xl font-medium text-sky-100">飞书客户端免登中</h2>
        <p className="mt-3 text-slate-300">
          已检测到飞书客户端环境，正在通过 JSAPI 自动获取登录凭证…
        </p>
      </section>
    )
  }

  if (autoLoginState === 'error') {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8">
          <h2 className="text-2xl font-medium text-rose-100">客户端免登失败</h2>
          <p className="mt-3 text-slate-300">{autoLoginError}</p>
          <p className="mt-4 text-sm text-slate-400">
            请确认飞书后台已配置可信域名 <code>zhangjie.life</code>，并将本页 URL
            加入重定向 URL 列表。
          </p>
        </section>
        <BrowserLoginPanel appId={appId} redirectUri={redirectUri} />
      </div>
    )
  }

  return <BrowserLoginPanel appId={appId} redirectUri={redirectUri} />
}

function BrowserLoginPanel({
  appId,
  redirectUri,
}: {
  appId: string
  redirectUri: string
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
        <h2 className="text-2xl font-medium">使用飞书账号登录</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          外部浏览器请使用 OAuth 跳转登录；飞书客户端内打开时会自动免登。
        </p>
        <a
          href="/feishu-app/api/auth/feishu/login"
          className="mt-8 inline-flex items-center rounded-2xl bg-sky-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-400"
        >
          飞书登录
        </a>
      </section>

      <section className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6">
        <h3 className="text-lg font-medium text-amber-100">飞书后台配置</h3>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-slate-300">
          <li>
            App ID：<code>{appId}</code>
          </li>
          <li>
            <strong>应用能力</strong> → 开启「网页应用」
          </li>
          <li>
            <strong>安全设置 → 可信域名</strong>：<code>zhangjie.life</code>
          </li>
          <li>
            <strong>安全设置 → 重定向 URL</strong>（浏览器 OAuth 需要）：
          </li>
        </ol>
        <div className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 font-mono text-sm text-emerald-300 break-all">
          {redirectUri}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          客户端免登还需将主页 URL{' '}
          <code>https://zhangjie.life/feishu-app/</code> 配到网页应用桌面/移动端主页。
        </p>
      </section>
    </div>
  )
}
