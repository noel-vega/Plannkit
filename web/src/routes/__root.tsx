import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import "../index.css"
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'

const RootLayout = () => (
  <>
    <SidebarProvider>
      <AppSidebar />
      <main className="max-w-5xl w-full mx-auto">
        <Outlet />
      </main>
    </SidebarProvider>
    <TanStackRouterDevtools />
  </>
)

export const Route = createRootRoute({ component: RootLayout })
