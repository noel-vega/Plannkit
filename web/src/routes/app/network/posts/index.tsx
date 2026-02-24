import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/network/posts/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/network/posts/"!</div>
}
