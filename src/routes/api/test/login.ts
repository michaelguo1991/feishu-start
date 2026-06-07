import { createFileRoute } from '@tanstack/react-router'

import { env } from '#/lib/env'
import { E2E_TEST_USER, e2eNotFound, isE2eTestMode } from '#/lib/e2e'
import { redirectResponse, sessionCookieHeader } from '#/lib/session'

function resolveRedirect(redirect: string) {
  const base = env.appBaseUrl.replace(/\/$/, '')
  if (redirect.startsWith('http')) return redirect
  const path = redirect.startsWith('/') ? redirect : `/${redirect}`
  return `${base}${path}`
}

export const Route = createFileRoute('/api/test/login')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!isE2eTestMode()) return e2eNotFound()

        const url = new URL(request.url)
        const redirect = url.searchParams.get('redirect') ?? '/'

        return redirectResponse(resolveRedirect(redirect), [
          sessionCookieHeader({
            accessToken: 'e2e-test-token',
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            user: E2E_TEST_USER,
          }),
        ])
      },
    },
  },
})
