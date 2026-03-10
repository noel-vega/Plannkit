import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/network/people/')({
  beforeLoad: () => {
    throw redirect({ to: "/network/people/discover" })
  },
})

