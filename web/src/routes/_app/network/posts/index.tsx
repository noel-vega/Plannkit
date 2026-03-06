import { Page } from '@/components/layout/page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/network/posts/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Page>
      <div className="border-b py-2 px-8">
        <div className="flex items-center gap-6">
          <h2 className="font-semibold">Network</h2>
        </div>
      </div>
    </Page>
  )
}
