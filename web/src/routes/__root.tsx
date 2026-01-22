import "../index.css"
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import type { QueryClient } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { useHeaderStore } from '@/hooks/use-header'

const RootLayout = () => (
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

function Main(props: PropsWithChildren) {
  return (
    <div className="flex-1 flex">
      {props.children}
    </div>
  )
}

function Header() {
  const { title } = useHeaderStore()
  return (
    <div className="h-14 border-b flex items-center px-4 gap-4">
      <SidebarTrigger>Menu</SidebarTrigger>
      <p className="font-bold text-xl">{title}</p>
    </div>)
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async () => {
    return { today: new Date() }
  },


  component: RootLayout
})
