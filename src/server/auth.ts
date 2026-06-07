import { createServerFn } from '@tanstack/react-start'

import { getFeishuRedirectUri, isFeishuConfigured, env } from '#/lib/env'
import { readSession } from '#/lib/session'

export const getAuthState = createServerFn({ method: 'GET' }).handler(async () => {
  const session = readSession()

  return {
    configured: isFeishuConfigured(),
    appId: env.feishuAppId,
    redirectUri: getFeishuRedirectUri(),
    user: session?.user ?? null,
    expiresAt: session?.expiresAt ?? null,
  }
})

export type AuthState = Awaited<ReturnType<typeof getAuthState>>
