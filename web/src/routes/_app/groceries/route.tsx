import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/groceries')({
  head: () => ({ meta: [{ title: "Groceries" }] }),
  component: Outlet,
})
