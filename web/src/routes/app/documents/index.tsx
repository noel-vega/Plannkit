import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/documents/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/documents/"!</div>
}
