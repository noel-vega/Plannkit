import { Page } from '@/components/layout/page'
import { getUseListSpacesOptions } from '@/features/finances/hooks'
import { queryClient } from '@/lib/react-query'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import z from 'zod/v3'

export const Route = createFileRoute('/_app/finances')({
  head: () => ({ meta: [{ title: "Finances" }] }),
  params: {
    parse: z.object({ spaceId: z.coerce.number().nullish() }).parse
  },
  beforeLoad: async ({ params }) => {
    const lastVisitedSpaceId = localStorage.getItem("last_visited_finance_space_id")
    const spaces = await queryClient.ensureQueryData(getUseListSpacesOptions())

    if (params.spaceId === undefined) {
      if (lastVisitedSpaceId === null) {
        throw redirect({ to: "/finances/$spaceId", params: { spaceId: spaces[0].id } })
      }
      throw redirect({ to: "/finances/$spaceId", params: { spaceId: Number(lastVisitedSpaceId) } })
    }
    return { spaces }
  },
  component: () => {
    return (
      <Page title="Finances">
        <Outlet />
      </Page>
    )
  },
})

