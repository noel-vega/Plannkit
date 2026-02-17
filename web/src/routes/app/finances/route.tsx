import { Page } from '@/components/layout/page'
import { FinanceSpaceSwitcher } from '@/features/finances/components/finance-space-switcher'
import { getUseListFinanceSpacesOptions, useListFinanceSpaces } from '@/features/finances/hooks'
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
  const rtCtx = Route.useRouteContext()
  const spaces = useListFinanceSpaces({ initialData: rtCtx.spaces })
  const handleSwitchSpace = (space: FinanceSpace) => {
    navigate({ to: "/app/finances/$spaceId/overview", params: { spaceId: space.id } })
  }

  const handleCreate = (space: FinanceSpace) => {
    navigate({ to: "/app/finances/$spaceId/overview", params: { spaceId: space.id } })
  }

  const handleSettings = (space: FinanceSpace) => {
    navigate({ to: "/app/finances/$spaceId/settings", params: { spaceId: space.id } })
  }
  return (
    <Page title="Finances">
      <div className="mb-4">
        <FinanceSpaceSwitcher
          currentSpace={rtCtx.currentSpace}
          spaces={spaces.data}
          onSpaceSelect={handleSwitchSpace}
          onCreate={handleCreate}
          onSettings={handleSettings}
        />
      </div>
      <Outlet />
    </Page>
  )
}

