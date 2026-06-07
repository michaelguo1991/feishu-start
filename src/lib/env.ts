const trim = (value: string | undefined) => value?.trim() ?? ''

export const env = {
  feishuAppId: trim(process.env.FEISHU_APP_ID),
  feishuAppSecret: trim(process.env.FEISHU_APP_SECRET),
  appBaseUrl: trim(process.env.APP_BASE_URL) || 'http://localhost:3000/feishu-app',
  sessionSecret: trim(process.env.SESSION_SECRET) || 'dev-only-change-me',
  nodeEnv: trim(process.env.NODE_ENV) || 'development',
  databasePath: trim(process.env.DATABASE_PATH) || '.data/db.sqlite',
}

export function getFeishuRedirectUri() {
  const configured = trim(process.env.FEISHU_REDIRECT_URI)
  if (configured) return configured
  return `${env.appBaseUrl.replace(/\/$/, '')}/api/auth/feishu/callback`
}

export function isFeishuConfigured() {
  return Boolean(env.feishuAppId && env.feishuAppSecret)
}
