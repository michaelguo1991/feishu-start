import { createFileRoute } from '@tanstack/react-router'

import { buildFeishuAuthorizeUrl } from '#/lib/feishu'
import { isFeishuConfigured } from '#/lib/env'
import {
  createOAuthState,
  oauthStateCookieHeader,
  redirectResponse,
} from '#/lib/session'

export const Route = createFileRoute('/api/auth/feishu/login')({
  server: {
    handlers: {
      GET: async () => {
        if (!isFeishuConfigured()) {
          return new Response('飞书应用未配置 FEISHU_APP_ID / FEISHU_APP_SECRET', {
            status: 503,
          })
        }

        const state = createOAuthState()

        return redirectResponse(buildFeishuAuthorizeUrl(state), [
          oauthStateCookieHeader(state),
        ])
      },
    },
  },
})
