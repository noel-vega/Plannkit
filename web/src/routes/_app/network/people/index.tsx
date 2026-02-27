import { Container } from '@/components/layout/container'
import { Page } from '@/components/layout/page'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUseDiscoverUsersQueryOptions, useDiscoverUsersQuery } from '@/features/network/hooks'
import { queryClient } from '@/lib/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { GlobeIcon, HandshakeIcon, SpotlightIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useDebounce } from 'use-debounce'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_app/network/people/')({
  head: () => ({ meta: [{ title: "People" }] }),
  beforeLoad: async () => {
    const users = await queryClient.ensureQueryData(getUseDiscoverUsersQueryOptions())
    return { users }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  return (
    <Page title="Network">
      <Container>
        <Tabs defaultValue='discover'>
          <TabsList className="mb-8" variant="line">
            <TabsTrigger value="discover"><GlobeIcon />{t("Discover")}</TabsTrigger>
            <TabsTrigger value="following"><SpotlightIcon />{t("Following")}</TabsTrigger>
            <TabsTrigger value="connections"><HandshakeIcon />{t("Connections")}</TabsTrigger>
          </TabsList>
          <TabsContent value="discover">
            <DiscoverUsers />
          </TabsContent>
          <TabsContent value="following"></TabsContent>
          <TabsContent value="connections"></TabsContent>
        </Tabs>
      </Container>
    </Page>
  )
}

function DiscoverUsers() {
  const { t } = useTranslation()
  const rtCtx = Route.useRouteContext()
  const [search, setSearch] = useState("")
  const [value] = useDebounce(search, 500)
  const users = useDiscoverUsersQuery({ search: value }, rtCtx.users)

  const handleSearchInput = (e: FormEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value)
  }
  return (
    <>
      <Field className="mb-4">
        <FieldLabel htmlFor="search">{t("Search")}</FieldLabel>
        <Input onInput={handleSearchInput} placeholder={t("Search users...")} />
      </Field>
      <ul className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {users.data.map(user => (
          <li>
            <Link to="/u/$username" params={{ username: user.username }}>
              <Card>
                <CardContent className="flex flex-col items-center justify-center">
                  <Avatar className="size-28">
                    {user.avatar && (
                      <AvatarImage src={user.avatar} alt="@shadcn" />
                    )}
                    <AvatarFallback className="border-2 border-white">{user.firstName[0]} {user.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-lg">
                    {user.firstName} {user.lastName}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

    </>

  )
}
