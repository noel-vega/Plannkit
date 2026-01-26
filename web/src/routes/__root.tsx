import "../index.css"
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

const RootLayout = () => (
  <div className="h-dvh">
    <Outlet />
  </div>
)

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async () => {
    return { today: new Date() }
  },
  component: RootLayout
})
