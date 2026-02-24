import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/network/people/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/network/people/"!</div>
}
