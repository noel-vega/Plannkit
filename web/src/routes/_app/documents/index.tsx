import { Page } from '@/components/layout/page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/documents/')({
  head: () => ({ meta: [{ title: "Documents" }] }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Page title="Documents">
      Documents
    </Page>
  )
}
