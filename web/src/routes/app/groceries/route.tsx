import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/app/groceries')({
  head: () => ({ meta: [{ title: "Groceries" }] }),
  component: Outlet,
})
