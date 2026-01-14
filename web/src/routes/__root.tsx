import { createRootRoute, Outlet } from '@tanstack/react-router'
import "../index.css"
import { queryClient } from '@/lib/react-query'
import { getListHabitsQueryOptions } from '@/api'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'

const RootLayout = () => (
  <>
    <SidebarProvider >
      <AppSidebar />
      <main className="w-full">
        <div className="h-12 border-b flex items-center px-4">
          <SidebarTrigger>Menu</SidebarTrigger>
        </div>
        <Outlet />
      </main>
    </SidebarProvider>
  </>
)

export const Route = createRootRoute({
  beforeLoad: async () => {
    const initialHabits = await queryClient.ensureQueryData(getListHabitsQueryOptions())
    return { initialHabits, today: new Date() }
  },


  component: RootLayout
})
