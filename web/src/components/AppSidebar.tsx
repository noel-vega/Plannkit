import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"
import { BanknoteIcon, FilesIcon, HomeIcon, ListIcon, MailIcon, SproutIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

const items = [
  {
    title: "Home",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Habits",
    url: "/habits",
    icon: SproutIcon,
  },
  {
    title: "Todos",
    url: "/habits",
    icon: ListIcon,
  },
  {
    title: "Finances",
    url: "#",
    icon: BanknoteIcon,
  },
  {
    title: "Email",
    url: "#",
    icon: MailIcon,
  },

  {
    title: "Files",
    url: "#",
    icon: FilesIcon,
  },
]
export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      {/* <SidebarHeader> */}
      {/*   <SidebarMenu> */}
      {/*     <SidebarMenuItem> */}
      {/*       <SidebarMenuButton */}
      {/*         size="lg" */}
      {/*         className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent" */}
      {/*       > */}
      {/*         <div className={cn("flex flex-col gap-0.5 leading-none font-semibold text-lg border border-red-500", { */}
      {/*         })}> */}
      {/*           {open ? "Plannkit" : "P"} */}
      {/*         </div> */}
      {/*       </SidebarMenuButton> */}
      {/**/}
      {/*     </SidebarMenuItem> */}
      {/*   </SidebarMenu> */}
      {/**/}
      {/* </SidebarHeader> */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="">
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
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
            <SidebarMenuButton asChild size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"

            >
              <Link to={"/"}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>NV</AvatarFallback>
                </Avatar>
                <span>Noel Vega</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarFooter />
    </Sidebar>
  )
}
