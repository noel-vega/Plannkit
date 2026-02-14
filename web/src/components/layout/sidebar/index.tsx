import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { comingSoonLinks, links } from "./links"
import { useAuth } from "@/features/auth/store"
import { ChevronsUpDownIcon } from "lucide-react"

export function AppSidebar() {
  const { t } = useTranslation()
  const { me } = useAuth()

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plannkit</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="">
                    <Link to={item.url} className="border border-transparent" activeProps={{
                      className: "font-semibold border-border"
                    }}>
                      <item.icon />
                      <span>{t(item.title)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Coming Soon</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {comingSoonLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} disabled={!import.meta.env.DEV} className="border border-transparent" activeProps={{
                      className: "font-semibold border-border"
                    }}>
                      <item.icon />
                      <span>{t(item.title)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border border-border/80 hover:border-border"
            >
              <Link to="/app/user">
                <Avatar className="h-8 w-8 border-border border">
                  <AvatarImage src={`http://localhost:8080/public/avatars/${me.avatar}`} alt="@shadcn" />
                  <AvatarFallback className="border">{me.firstName[0]} {me.lastName[0]}</AvatarFallback>
                </Avatar>
                <span>{me.firstName} {me.lastName}</span>
                <ChevronsUpDownIcon className="ml-auto size-4" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarFooter />
    </Sidebar>
  )
}
