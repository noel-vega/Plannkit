import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import "../index.css"
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import type { QueryClient } from '@tanstack/react-query'

const RootLayout = () => (
  <>
    <SidebarProvider >
      <AppSidebar />
      <main className="w-full flex flex-col">
        <div className="h-12 border-b flex items-center px-4">
          <SidebarTrigger>Menu</SidebarTrigger>
        </div>
        <div className="flex-1 flex">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  </>
)

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async () => {
    return { today: new Date() }
  },


  component: RootLayout
})
