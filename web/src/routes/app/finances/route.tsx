import { getUseListSpacesOptions } from '@/features/finances/hooks'
import { queryClient } from '@/lib/react-query'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import z from 'zod/v3'

export const Route = createFileRoute('/app/finances')({
  head: () => ({ meta: [{ title: "Finances" }] }),
  params: {
    parse: z.object({ spaceId: z.coerce.number().nullish() }).parse
  },
  beforeLoad: async ({ params }) => {
    const spaces = await queryClient.ensureQueryData(getUseListSpacesOptions())
    if (params.spaceId === undefined) {
      throw redirect({ to: "/app/finances/$spaceId", params: { spaceId: spaces[0].id } })
    }
    const currentSpace = spaces.find(x => x.id === Number(params.spaceId))
    if (!currentSpace) throw Error("Space not found")
    return { spaces, currentSpace }
  },
  component: Outlet,
})

