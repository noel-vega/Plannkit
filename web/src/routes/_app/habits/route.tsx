import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/habits')({
  head: () => ({ meta: [{ title: "Habits" }] }),
  component: Outlet,
})
