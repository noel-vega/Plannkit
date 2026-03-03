import { Container } from '@/components/layout/container'
import { Page } from '@/components/layout/page'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUseDiscoverUsersQueryOptions, useDiscoverUsersQuery } from '@/features/network/hooks'
import { queryClient } from '@/lib/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { GlobeIcon, HandshakeIcon, SearchIcon, SpotlightIcon, UsersIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useDebounce } from 'use-debounce'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_app/network/people/')({
  head: () => ({ meta: [{ title: "People" }] }),
  beforeLoad: async () => {
    const users = await queryClient.ensureQueryData(getUseDiscoverUsersQueryOptions())
    queryClient.ensureQueryData(getUseDiscoverUsersQueryOptions({ search: "", filter: "following" }))
    queryClient.ensureQueryData(getUseDiscoverUsersQueryOptions({ search: "", filter: "followers" }))
    return { users }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  return (
    <Page title="Network">
      <Container className="max-w-4xl">
        <Tabs defaultValue='discover'>
          <TabsList className="mb-4" variant="line">
            <TabsTrigger value="discover"><GlobeIcon />{t("Discover")}</TabsTrigger>
            <TabsTrigger value="following"><SpotlightIcon />{t("Following")}</TabsTrigger>
            <TabsTrigger value="followers"><UsersIcon />{t("Followers")}</TabsTrigger>
            <TabsTrigger value="connections"><HandshakeIcon />{t("Connections")}</TabsTrigger>
          </TabsList>
          <TabsContent value="discover">
            <DiscoverUsers />
          </TabsContent>
          <TabsContent value="following">
            <Following />
          </TabsContent>
          <TabsContent value="followers">
            <Follwers />
          </TabsContent>
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
  const users = useDiscoverUsersQuery({ search: value, filter: "all" }, rtCtx.users)

  const handleSearchInput = (e: FormEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value)
  }
  return (
    <>
      <Field className="mb-4">
        <Input icon={SearchIcon} onInput={handleSearchInput} placeholder={t("Search users...")} />
      </Field>
      <ul className="divide-y">
        {users.data.map(user => (
          <li key={user.id} >
            <Link to="/u/$username" params={{ username: user.username }} className="p-4 block">
              <div className="flex gap-4">
                <Avatar className="size-16">
                  {user.avatar && (
                    <AvatarImage src={user.avatar} alt="@shadcn" />
                  )}
                  <AvatarFallback className="border-2 border-white">{user.firstName[0]} {user.lastName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

    </>

  )
}


function Following() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [value] = useDebounce(search, 500)
  const users = useDiscoverUsersQuery({ search: value, filter: "following" }, [])

  const handleSearchInput = (e: FormEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value)
  }
  return (
    <>
      <Field className="mb-4">
        <Input icon={SearchIcon} onInput={handleSearchInput} placeholder={t("Search following...")} />
      </Field>
      <ul className="divide-y">
        {users.data.map(user => (
          <li key={user.id} >
            <Link to="/u/$username" params={{ username: user.username }} className="hover:bg-secondary/50 p-4 block">
              <div className="flex gap-4">
                <Avatar className="size-16">
                  {user.avatar && (
                    <AvatarImage src={user.avatar} alt="@shadcn" />
                  )}
                  <AvatarFallback className="border-2 border-white">{user.firstName[0]} {user.lastName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}


function Follwers() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [value] = useDebounce(search, 500)
  const users = useDiscoverUsersQuery({ search: value, filter: "followers" }, [])

  const handleSearchInput = (e: FormEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value)
  }
  return (
    <>
      <Field className="mb-4">
        <Input icon={SearchIcon} onInput={handleSearchInput} placeholder={t("Search followers...")} />
      </Field>
      <ul className="divide-y">
        {users.data.map(user => (
          <li key={user.id} >
            <Link to="/u/$username" params={{ username: user.username }} className="hover:bg-secondary/50 p-4 block">
              <div className="flex gap-4">
                <Avatar className="size-16">
                  {user.avatar && (
                    <AvatarImage src={user.avatar} alt="@shadcn" />
                  )}
                  <AvatarFallback className="border-2 border-white">{user.firstName[0]} {user.lastName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

    </>

  )
}
