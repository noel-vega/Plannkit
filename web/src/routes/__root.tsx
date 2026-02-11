import "../index.css"
import { createRootRouteWithContext, Outlet, redirect } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { useAuth } from "@/features/auth/store"
import type { Flags } from "@/features/_internal/api"
import { PageNotFound } from "@/components/page-not-found"
import { auth } from "@/features/auth/api"

const RootLayout = () => (
  <div className="h-dvh">
    <Outlet />
  </div>
)

export const Route = createRootRouteWithContext<{ queryClient: QueryClient, today: Date, flags: Flags }>()({
  beforeLoad: async ({ location }) => {
    const response = await auth.getMe()
    if (response.success) {
      useAuth.setState(response.data)
      if (location.pathname.startsWith("/auth")) {
        throw redirect({ to: "/app/habits" })
      }
    } else if (!location.pathname.startsWith("/auth")) {
      throw redirect({ to: "/auth/signin" })
    }
  },
  component: RootLayout,
  notFoundComponent: PageNotFound
})
