import { Page } from '@/components/layout/page'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Page className="h-dvh flex items-center">
      <Outlet />
    </Page>
  )
}
