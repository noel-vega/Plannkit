import { Page } from '@/components/layout/page'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/features/auth/store'
import { AvatarSchema } from '@/features/auth/types'
import { pkFetch } from '@/lib/plannkit-api-client'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type ChangeEvent } from 'react'
import z from 'zod/v3'

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
              <MeAvatar />
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
