import { Page } from '@/components/layout/page'
import { PageHeader } from '@/components/layout/page-header'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/network/posts/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Page>
      <PageHeader title='Network' />
    </Page>
  )
}
