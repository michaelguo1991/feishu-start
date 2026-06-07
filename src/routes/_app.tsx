import { createFileRoute, Outlet } from '@tanstack/react-router'

import { AppShell } from '#/components/AppShell'
import { getAuthState } from '#/server/auth'

export const Route = createFileRoute('/_app')({
  loader: () => getAuthState(),
  component: AppLayout,
})

function AppLayout() {
  const auth = Route.useLoaderData()

  return (
    <AppShell auth={auth}>
      <Outlet />
    </AppShell>
  )
}
