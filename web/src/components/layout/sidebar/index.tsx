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
import { Link, useLocation } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { communityFeatures, links, type FeatureLink } from "./links"
import { useAuth } from "@/features/auth/store"
import { ChevronsUpDownIcon } from "lucide-react"

function FeatureNavLink(props: { feature: FeatureLink }) {
  const { t } = useTranslation()
  const { feature } = props
  const { pathname } = useLocation()
  const isActive = pathname.startsWith(feature.to as string)
  return (
    <SidebarMenuItem key={feature.label} className="relative px-2">
      {isActive && <div className="h-full w-0.75 bg-blue-500 absolute left-0" />}
      <SidebarMenuButton asChild>
        <Link to={feature.to} className="border border-transparent" activeProps={{
          className: "font-semibold border-border",
        }}>
          <feature.icon />
          <span>{t(feature.label)}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  const { t } = useTranslation()
  const { me } = useAuth()

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupLabel>Plannkit</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <FeatureNavLink feature={item} key={item.label} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-0">
          <SidebarGroupLabel>{t("Network")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityFeatures.map((feature) => (
                <FeatureNavLink feature={feature} key={feature.label} />
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
              <Link to="/u/$username" params={{ username: me.username }} >
                <Avatar className="h-8 w-8 border-border border">
                  {me.avatar && (
                    <AvatarImage src={me.avatar} alt="@shadcn" />
                  )}
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
