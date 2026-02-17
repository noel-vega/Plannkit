import { createFileRoute } from '@tanstack/react-router'
import z from 'zod/v3'

export const Route = createFileRoute('/app/finances/$spaceId/settings')({
  params: {
    parse: z.object({ spaceId: z.coerce.number() }).parse
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/finances/$spaceId/settings"!</div>
}
