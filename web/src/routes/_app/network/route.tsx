import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/network')({
  head: async () => ({
    meta: [
      { title: "Network" }
    ]
  }),
  component: Outlet,
})
