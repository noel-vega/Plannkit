import { BackButton } from '@/components/back-button'
import { Container } from '@/components/layout/container'
import { Page } from '@/components/layout/page'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/features/auth/store'
import { getUseUserProfileQueryOptions, useFollowMutation, useUnFollowMutation, useUserProfile } from '@/features/network/hooks'
import { queryClient } from '@/lib/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CheckIcon, MinusCircleIcon, PlusIcon } from 'lucide-react'
import { useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useUpdateAvatarMutation } from '@/features/user/hooks'
import type { UserProfile } from '@/features/network/types'

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
  const { data: profile } = useUserProfile(username, routeContext.profile)
  const { me } = useAuth()

  const isMe = me.id === profile.user.id
  return (
    <Page title="Profile">
      <Container className="max-w-5xl">
        <BackButton />
        <Separator className="my-2 bg-transparent" />
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
            <div>
              <FollowButton profile={profile} />
            </div>
          </CardContent>
          <CardFooter className="p-4"></CardFooter>
        </Card>
      </Container>
    </Page>
  )
}

function FollowButton(props: { profile: UserProfile }) {
  const [isHovered, setIsHovered] = useState(false)
  const { user, followStatus, isFollowing } = props.profile
  const { t } = useTranslation()
  const { me } = useAuth()
  const follow = useFollowMutation(user.username)
  const unfollow = useUnFollowMutation(user.username)

  const handleClick = () => {
    isFollowing ? unfollow.mutate(user.id) : follow.mutate(user.id)

  }
  if (me.username === user.username) return
  return <Button
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    variant={"secondary"}
    onClick={handleClick} disabled={unfollow.isPending} className="min-w-44 transition-none">
    {isFollowing ? (
      <>
        {followStatus === "accepted" ? (
          <>
            {isHovered ? (
              <>
                <MinusCircleIcon />{t("Unfollow")}
              </>
            ) : (
              <>
                <CheckIcon />{t("Following")}
              </>
            )}
          </>
        ) : (
          <>
            <MinusCircleIcon />{t("Cancel Request")}
          </>
        )
        }
      </>

    ) : (
      <>
        <PlusIcon /> {user.isPrivate && "Request "}{t("Follow")}
      </>
    )}
  </Button >
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
