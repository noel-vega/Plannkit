import "../index.css"
import { createRootRouteWithContext, HeadContent, Outlet, redirect } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { useAuth } from "@/features/auth/store"
import type { Flags } from "@/features/_internal/api"
import { PageNotFound } from "@/components/page-not-found"
import { auth } from "@/features/auth/api"

const RootLayout = () => (
  <>
    <HeadContent />
    <Outlet />
  </>
)

export const Route = createRootRouteWithContext<{ queryClient: QueryClient, today: Date, flags: Flags }>()({
  beforeLoad: async ({ location }) => {
    const { success, accessToken } = await auth.refreshAccessToken()
    useAuth.setState({ accessToken })

    if (success) {
      const me = await auth.getMe()
      useAuth.setState({ me })
      if (location.pathname.startsWith("/auth")) {
        throw redirect({ to: "/habits" })
      }
    } else if (!location.pathname.startsWith("/auth")) {
      throw redirect({ to: "/auth/signin" })
    }
  },
  component: RootLayout,
  notFoundComponent: PageNotFound
})
