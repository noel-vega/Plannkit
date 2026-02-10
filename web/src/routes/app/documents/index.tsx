import { Page } from '@/components/layout/page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/documents/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Page title="Documents">
      Documents
    </Page>
  )
}
