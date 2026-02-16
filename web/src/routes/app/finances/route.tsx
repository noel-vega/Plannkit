import { Page } from '@/components/layout/page'
import { FinanceSpaceSwitcher } from '@/features/finances/components/finance-space-switcher'
import { getUseListFinanceSpacesOptions } from '@/features/finances/hooks'
import type { FinanceSpace } from '@/features/finances/types'
import { queryClient } from '@/lib/react-query'
import { createFileRoute, Outlet, redirect, useNavigate } from '@tanstack/react-router'
import z from 'zod/v3'

export const Route = createFileRoute('/app/finances')({
  params: {
    parse: z.object({ spaceId: z.coerce.number().nullish() }).parse
  },
  beforeLoad: async ({ params }) => {
    const spaces = await queryClient.ensureQueryData(getUseListFinanceSpacesOptions())
    if (params.spaceId === undefined) {
      throw redirect({ to: "/app/finances/$spaceId/overview", params: { spaceId: spaces[0].id } })
    }
    const currentSpace = spaces.find(x => x.id === Number(params.spaceId))
    if (!currentSpace) throw Error("Space not found")
    return { spaces, currentSpace }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { spaces, currentSpace } = Route.useRouteContext()
  const handleSwitchSpace = (space: FinanceSpace) => {
    navigate({ to: "/app/finances/$spaceId/overview", params: { spaceId: space.id } })
  }
  return (
    <Page title="Finances">
      <div className="mb-4">
        <FinanceSpaceSwitcher value={currentSpace} spaces={spaces} onValueChange={handleSwitchSpace} />
      </div>
      <Outlet />
    </Page>
  )
}

