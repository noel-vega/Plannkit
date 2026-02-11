import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'
import { FlagsSchema } from '@/features/_internal/api';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';

export const Route = createFileRoute('/app')({
  beforeLoad: ({ context: { flags }, location }) => {
    const result = FlagsSchema.keyof().safeParse(location.pathname.split("/")[2])

    if (!import.meta.env.DEV && result.success && !flags[result.data]) {
      throw notFound({ routeId: "__root__" })
    }
  },
  component: AppLayout,
})

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full flex flex-col">
        <Header />
        <Main>
          <Outlet />
        </Main>
      </div>
    </SidebarProvider>
  )
}

