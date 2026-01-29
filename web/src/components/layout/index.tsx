import { Outlet } from "@tanstack/react-router";
import { SidebarProvider } from "../ui/sidebar";
import { Header } from "./header";
import { Main } from "./main";
import { AppSidebar } from "./sidebar";

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
