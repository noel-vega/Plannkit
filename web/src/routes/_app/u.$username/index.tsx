import { Container } from '@/components/layout/container'
import { Page } from '@/components/layout/page'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/features/auth/store'
import { getUseUserProfileQueryOptions, useUserProfile } from '@/features/network/hooks'
import { queryClient } from '@/lib/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type ChangeEvent } from 'react'
import { useUpdateAvatarMutation } from '@/features/user/hooks'
import { FollowButton } from '@/features/network/components/follow-button'
import { ConnectButton } from '@/features/network/components/connect-button'

export const Route = createFileRoute('/_app/u/$username/')({
  beforeLoad: async ({ params: { username } }) => {
    const profile = await queryClient.ensureQueryData(getUseUserProfileQueryOptions(username))
    return { profile }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const routeContext = Route.useRouteContext()
  const { username } = Route.useParams()
  const { data: profile, isLoading } = useUserProfile(username, routeContext.profile)
  const { me } = useAuth()

  if (isLoading) {
    return "loading..."
  }

  if (!profile) {
    return "Error"
  }

  const isMe = me.id === profile.user.id
  return (
    <Page title="Profile">
      <Container className="max-w-5xl">
        <Card className="p-0 overflow-clip gap-0">
          <CardHeader className="h-60 bg-blue-500" />
          <CardContent className="pt-0 relative">
            <div className="-mt-24 mb-6">
              {isMe ? (
                <MeAvatar />
              ) : (
                <Avatar className="size-40 border-2 border-white/50 shadow ">
                  {profile.user.avatar && (
                    <AvatarImage src={profile.user.avatar} alt="@shadcn" />
                  )}
                  <AvatarFallback className="border-2 border-white">{profile.user.firstName[0]} {profile.user.lastName[0]}</AvatarFallback>
                </Avatar>
              )}
            </div>
            <div className="mb-2">
              <h2 className="text-2xl font-semibold">{profile.user.firstName} {profile.user.lastName}</h2>
            </div>
            {me.id !== profile.user.id && (
              <div className="flex gap-2">
                <FollowButton profile={profile} />
                <ConnectButton profile={profile} />
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4"></CardFooter>
        </Card>
      </Container>
    </Page>
  )
}

function MeAvatar() {
  const { me } = useAuth()

  const updateAvatar = useUpdateAvatarMutation()

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (!file) return
    updateAvatar.mutate(file, {
      onSuccess: ({ avatar }) => {
        useAuth.setState({ me: { ...useAuth.getState().me, avatar } })
      }
    })
  }

  return (
    <>
      <label className="rounded-full cursor-pointer" htmlFor="avatar">
        <Avatar className="size-40 border-2 border-white/50 shadow ">
          {me.avatar && (
            <AvatarImage src={me.avatar} alt="@shadcn" />
          )}
          <AvatarFallback className="border-2 border-white">{me.firstName[0]} {me.lastName[0]}</AvatarFallback>
        </Avatar>
      </label>
      <input
        id="avatar"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        hidden
      />
    </>
  )
}
