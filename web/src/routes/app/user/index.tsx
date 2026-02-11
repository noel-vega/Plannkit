import { Page } from '@/components/layout/page'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/features/auth/store'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/user/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { me } = useAuth()
  return (
    <Page title="Profile">
      <div className="max-w-5xl">
        <Card className="p-0 overflow-clip gap-0">
          <CardHeader className="h-60 bg-blue-500" />
          <CardContent className="pt-0 relative">
            <div className="-mt-24">
              <Avatar className="size-40">
                <AvatarImage src="" alt="@shadcn" />
                <AvatarFallback className="border-6 border-white">{me.firstName[0]} {me.lastName[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{me.firstName} {me.lastName}</h2>
            </div>
          </CardContent>
          <CardFooter className="p-4"></CardFooter>
        </Card>
      </div>
    </Page>
  )
}
