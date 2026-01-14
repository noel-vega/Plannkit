import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/email/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/email/"!</div>
}
