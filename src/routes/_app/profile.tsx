import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/profile')({
  component: ProfileLayout,
})

function ProfileLayout() {
  return <Outlet />
}
