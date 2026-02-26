import { BackButton } from '@/components/back-button'
import { Container } from '@/components/layout/container'
import { Page } from '@/components/layout/page'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/features/auth/store'
import { AvatarSchema } from '@/features/auth/types'
import { getUseUserProfileQueryOptions, useUserProfile } from '@/features/network/hooks'
import { pkFetch } from '@/lib/plannkit-api-client'
import { queryClient } from '@/lib/react-query'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { type ChangeEvent } from 'react'
import z from 'zod/v3'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_app/u/$username/')({
  beforeLoad: async ({ params: { username } }) => {
    const user = await queryClient.ensureQueryData(getUseUserProfileQueryOptions(username))

    return { user }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const routeContext = Route.useRouteContext()
  const { username } = Route.useParams()
  const { data: user } = useUserProfile(username, routeContext.user)
  const { me } = useAuth()

  const isMe = me.id === user.id
  return (
    <Page title="Profile">
      <Container>
        <BackButton />
        <Separator className="my-2 bg-transparent" />
        <Card className="p-0 overflow-clip gap-0">
          <CardHeader className="h-60 bg-blue-500" />
          <CardContent className="pt-0 relative">
            <div className="-mt-24">
              {isMe ? (
                <MeAvatar />
              ) : (
                <Avatar className="size-40 border-2 border-white/50 shadow ">
                  {user.avatar && (
                    <AvatarImage src={user.avatar} alt="@shadcn" />
                  )}
                  <AvatarFallback className="border-2 border-white">{user.firstName[0]} {user.lastName[0]}</AvatarFallback>
                </Avatar>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{user.firstName} {user.lastName}</h2>
            </div>
            <div>
              {!isMe && (
                <Button className="bg-sky-600 hover:bg-sky-600"><PlusIcon />{t("Follow")}</Button>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-4"></CardFooter>
        </Card>
      </Container>
    </Page>
  )
}

async function updateAvatar(file: File) {
  const formData = new FormData()
  formData.append("avatar", file)
  const response = await pkFetch("/users/avatar", {
    method: "PUT",
    body: formData
  }, false)

  return z.object({ avatar: AvatarSchema }).parse(await response.json())
}

function MeAvatar() {
  const { me } = useAuth()

  const updateAvatarMtn = useMutation({
    mutationFn: updateAvatar,
    onSuccess: ({ avatar }) => {
      useAuth.setState({ me: { ...useAuth.getState().me, avatar } })
    }

  })

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (!file) return
    updateAvatarMtn.mutate(file)
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
