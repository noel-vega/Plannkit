import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/app/network')({
  head: async () => ({
    meta: [
      { title: "Network" }
    ]
  }),
  component: Outlet,
})
