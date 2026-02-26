import { SproutIcon, ListIcon, BanknoteIcon, MailIcon, FilesIcon, LayoutDashboard, ShoppingBasketIcon, StickyNoteIcon, ContactIcon } from "lucide-react";

const isDev = import.meta.env.DEV

export const communityLinks = [
  {
    title: "Posts",
    url: "/network/posts",
    icon: StickyNoteIcon,
    active: isDev,
  },
  {
    title: "People",
    url: "/network/people",
    icon: ContactIcon,
    active: isDev,
  },
]

// TODO: make urls type safe with router
//
export const links = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    active: isDev,
  },
  {
    title: "Habits",
    url: "/habits",
    icon: SproutIcon,
    active: true,
  },
  {
    title: "Tasks",
    url: "/todos",
    icon: ListIcon,
    active: true,
  },
  {
    title: "Finances",
    url: "/finances",
    icon: BanknoteIcon,
    active: true,
  },
  {
    title: "Groceries",
    url: "/groceries",
    icon: ShoppingBasketIcon,
    active: true,
  },
]


export const comingSoonLinks = [
  {
    title: "Email",
    url: "/email",
    icon: MailIcon,
    active: isDev,
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FilesIcon,
    acitve: isDev,
  },
]
