import { SproutIcon, ListIcon, BanknoteIcon, MailIcon, FilesIcon, LayoutDashboard, ShoppingBasketIcon } from "lucide-react";

const isDev = import.meta.env.DEV

// TODO: make urls type safe with router
//
export const links = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LayoutDashboard,
    active: isDev,
  },
  {
    title: "Habits",
    url: "/app/habits",
    icon: SproutIcon,
    active: true,
  },
  {
    title: "Tasks",
    url: "/app/todos",
    icon: ListIcon,
    active: true,
  },
  {
    title: "Finances",
    url: "/app/finances",
    icon: BanknoteIcon,
    active: true,
  },
  {
    title: "Groceries",
    url: "/app/groceries",
    icon: ShoppingBasketIcon,
    active: true,
  },
]

export const comingSoonLinks = [
  {
    title: "Email",
    url: "/app/email",
    icon: MailIcon,
    active: isDev,
  },
  {
    title: "Documents",
    url: "/app/documents",
    icon: FilesIcon,
    acitve: isDev,
  },
]
