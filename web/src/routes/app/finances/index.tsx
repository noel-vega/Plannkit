import { Page } from '@/components/layout/page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/finances/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Page title="Finances">
      Finances
    </Page>
  )
}
