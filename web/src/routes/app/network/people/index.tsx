import { users } from '@/features/network/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/network/people/')({
  beforeLoad: async () => {
    const data = await users.list()
    console.log(data)
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/network/people/"!</div>
}
