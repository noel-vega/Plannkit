import { Page } from '@/components/layout/page'
import { PageHeader } from '@/components/layout/page-header'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/dashboard/')({
  head: () => ({ meta: [{ title: "Dashboard" }] }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Page title="Dashboard">
      <PageHeader title="Dashboard" />
    </Page>
  )
}
