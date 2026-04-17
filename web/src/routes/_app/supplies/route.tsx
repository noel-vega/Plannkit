import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/supplies')({
  head: () => ({ meta: [{ title: "Groceries" }] }),
  component: Outlet,
})
