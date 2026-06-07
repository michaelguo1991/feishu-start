import { createFileRoute } from '@tanstack/react-router'

import { completeFeishuLogin } from '#/lib/feishu'
import { isFeishuConfigured } from '#/lib/env'
import {
  appHomeUrl,
  clearOAuthStateCookieHeader,
  readOAuthStateCookie,
  redirectResponse,
  sessionCookieHeader,
} from '#/lib/session'

export const Route = createFileRoute('/api/auth/feishu/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const error = url.searchParams.get('error')
        const code = url.searchParams.get('code')
        const state = url.searchParams.get('state')

        if (error) {
          return redirectResponse(appHomeUrl({ error: 'access_denied' }), [
            clearOAuthStateCookieHeader(),
          ])
        }

        if (!isFeishuConfigured() || !code || !state) {
          return redirectResponse(appHomeUrl({ error: 'invalid_callback' }), [
            clearOAuthStateCookieHeader(),
          ])
        }

        const savedState = readOAuthStateCookie()

        if (!savedState || savedState !== state) {
          return redirectResponse(appHomeUrl({ error: 'invalid_state' }), [
            clearOAuthStateCookieHeader(),
          ])
        }

        try {
          const login = await completeFeishuLogin(code, 'browser')

          return redirectResponse(appHomeUrl(), [
            sessionCookieHeader({
              accessToken: login.accessToken,
              expiresAt: Date.now() + login.expiresIn * 1000,
              user: login.user,
            }),
            clearOAuthStateCookieHeader(),
          ])
        } catch (callbackError) {
          console.error('[feishu callback]', callbackError)
          return redirectResponse(appHomeUrl({ error: 'token_exchange_failed' }), [
            clearOAuthStateCookieHeader(),
          ])
        }
      },
    },
  },
})
