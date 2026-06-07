import { createFileRoute } from '@tanstack/react-router'

import {
  appHomeUrl,
  clearSessionCookieHeader,
  redirectResponse,
} from '#/lib/session'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: async () => {
        return redirectResponse(appHomeUrl(), [clearSessionCookieHeader()])
      },
      GET: async () => {
        return redirectResponse(appHomeUrl(), [clearSessionCookieHeader()])
      },
    },
  },
})
