import type { LinkProps } from "@tanstack/react-router";
import { SproutIcon, ListIcon, BanknoteIcon, MailIcon, FilesIcon, LayoutDashboard, ShoppingBasketIcon, StickyNoteIcon, ContactIcon, type LucideIcon } from "lucide-react";

const isDev = import.meta.env.DEV

export type FeatureLink = {
  label: string;
  to: LinkProps["to"];
  icon: LucideIcon;
  active: boolean
}

export const communityFeatures: FeatureLink[] = [
  {
    label: "Posts",
    to: "/network/posts",
    icon: StickyNoteIcon,
    active: isDev,
  },
  {
    label: "People",
    to: "/network/people",
    icon: ContactIcon,
    active: isDev,
  },
]

// TODO: make urls type safe with router
//
export const links: FeatureLink[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    active: isDev,
  },
  {
    label: "Habits",
    to: "/habits",
    icon: SproutIcon,
    active: true,
  },
  {
    label: "Tasks",
    to: "/todos",
    icon: ListIcon,
    active: true,
  },
  {
    label: "Finances",
    to: "/finances",
    icon: BanknoteIcon,
    active: true,
  },
  {
    label: "Groceries",
    to: "/groceries",
    icon: ShoppingBasketIcon,
    active: true,
  },
]


export const comingSoonLinks: FeatureLink[] = [
  {
    label: "Email",
    to: "/email",
    icon: MailIcon,
    active: false,
  },
  {
    label: "Documents",
    to: "/documents",
    icon: FilesIcon,
    active: false
  },
]
