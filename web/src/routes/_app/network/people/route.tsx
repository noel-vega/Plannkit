import { Container } from '@/components/layout/container'
import { Page } from '@/components/layout/page'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUseDiscoverUsersQueryOptions } from '@/features/network/hooks'
import { queryClient } from '@/lib/react-query'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { GlobeIcon, HandshakeIcon, SpotlightIcon, UsersIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_app/network/people')({
  head: () => ({ meta: [{ title: "People" }] }),
  beforeLoad: async () => {
    await queryClient.ensureQueryData(getUseDiscoverUsersQueryOptions())
    queryClient.ensureQueryData(getUseDiscoverUsersQueryOptions({ search: "", filter: "following" }))
    queryClient.ensureQueryData(getUseDiscoverUsersQueryOptions({ search: "", filter: "followers" }))
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  return (
    <Page title="Network">
      <div className="border-b py-4 px-8">
        <div className="flex items-center gap-6">
          <h2 className="font-semibold text-lg">Network</h2>
        </div>
      </div>
      <Container className="max-w-4xl">
        <Tabs defaultValue='discover'>
          <TabsList className="mb-4" variant="line">
            <TabsTrigger value="discover" asChild>
              <Link to="/network/people/discover">
                <GlobeIcon />{t("Discover")}
              </Link>
            </TabsTrigger>
            <TabsTrigger value="following" asChild>
              <Link to="/network/people/following">
                <SpotlightIcon />{t("Following")}
              </Link>
            </TabsTrigger>
            <TabsTrigger value="followers" asChild>
              <Link to="/network/people/followers">
                <UsersIcon />{t("Followers")}
              </Link>
            </TabsTrigger>
            <TabsTrigger value="connections" asChild>
              <Link to="/network/people/connections">
                <HandshakeIcon />{t("Connections")}
              </Link>
            </TabsTrigger>
          </TabsList>
          <Outlet />
        </Tabs>
      </Container>
    </Page>
  )
}
