import { BackButton } from '@/components/back-button'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod/v3'

export const Route = createFileRoute(
  '/app/finances/$spaceId/expenses/$expenseId',
)({
  params: {
    parse: z.object({ spaceId: z.coerce.number(), expenseId: z.coerce.number() }).parse
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <BackButton />
  )
}
