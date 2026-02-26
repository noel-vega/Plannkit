import { Page } from '@/components/layout/page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/dashboard/')({
  head: () => ({ meta: [{ title: "Dashboard" }] }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Page title="Dashboard">
      Dashboard
    </Page>
  )
}
