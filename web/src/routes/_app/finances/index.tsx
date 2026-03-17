import { Container } from '@/components/layout/container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CreateSpaceDialog } from '@/features/finances/components/create-finance-space-form'
import { useAcceptSpaceInviteMutation, useDeclineSpaceInviteMutation, useListSpacesQuery } from '@/features/finances/hooks'
import type { FinanceSpace, SpaceWithMembership } from '@/features/finances/types'
import { useAuth } from '@/features/auth/store'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { CheckIcon, CrownIcon, MailIcon, PlusIcon, WalletIcon, XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_app/finances/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const routeCtx = Route.useRouteContext()
  const spaces = useListSpacesQuery({ initialData: routeCtx.spaces })
  const [createOpen, setCreateOpen] = useState(false)

  const { mySpaces, invites } = useMemo(() => {
    const data = spaces.data ?? []
    return {
      mySpaces: data.filter((s) => s.membership.status === 'accepted'),
      invites: data.filter((s) => s.membership.status === 'pending'),
    }
  }, [spaces.data])

  const handleCreateSuccess = (space: FinanceSpace) => {
    navigate({ to: '/finances/$spaceId', params: { spaceId: space.id } })
  }

  return (
    <div className="@container">
      <Container>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('Finance Spaces')}</h1>
            <p className="text-muted-foreground">
              {t('Manage your budgets and shared financial plans.')}
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon /> {t('New Space')}
          </Button>
        </div>

        {invites.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">{t('Pending Invites')}</h2>
            <div className="grid grid-cols-1 @3xl:grid-cols-2 @6xl:grid-cols-3 gap-4">
              {invites.map((space) => (
                <InviteCard key={space.id} space={space} />
              ))}
            </div>
          </section>
        )}

        <section>
          {mySpaces.length > 0 && invites.length > 0 && (
            <h2 className="text-lg font-semibold mb-3">{t('Your Spaces')}</h2>
          )}
          {mySpaces.length === 0 && invites.length === 0 && (
            <Card>
              <CardContent className="grid place-content-center place-items-center gap-4 h-52">
                <WalletIcon size={52} className="text-muted-foreground" />
                <p className="text-muted-foreground">
                  {t('No finance spaces yet. Create one to get started.')}
                </p>
              </CardContent>
            </Card>
          )}
          <div className="grid grid-cols-1 @3xl:grid-cols-2 @6xl:grid-cols-3 gap-4">
            {mySpaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        </section>

        <CreateSpaceDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={handleCreateSuccess}
        />
      </Container>
    </div>
  )
}

function SpaceCard({ space }: { space: SpaceWithMembership }) {
  const { t } = useTranslation()
  const isOwner = space.membership.role === 'owner'
  return (
    <Link to="/finances/$spaceId" params={{ spaceId: space.id }} resetScroll>
      <Card className="cursor-pointer transition-colors hover:bg-accent/50">
        <CardContent className="flex items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <WalletIcon className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{space.name}</h3>
            <p className="text-sm text-muted-foreground">
              {isOwner
                ? t('Owner')
                : t('Owned by {{name}}', { name: `${space.owner.firstName} ${space.owner.lastName}` })
              }
            </p>
          </div>
          {isOwner && (
            <CrownIcon className="size-4 text-amber-500 shrink-0" />
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function InviteCard({ space }: { space: SpaceWithMembership }) {
  const { t } = useTranslation()
  const me = useAuth((s) => s.me)
  const acceptInvite = useAcceptSpaceInviteMutation()
  const declineInvite = useDeclineSpaceInviteMutation()
  const isPending = acceptInvite.isPending || declineInvite.isPending

  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
          <MailIcon className="size-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{space.name}</h3>
            <Badge variant="secondary">{t(space.membership.role)}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('From {{name}}', { name: `${space.owner.firstName} ${space.owner.lastName}` })}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon-sm"
            variant="ghost"
            disabled={isPending}
            onClick={() => acceptInvite.mutate({ spaceId: space.id })}
          >
            <CheckIcon className="size-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            disabled={isPending}
            onClick={() => declineInvite.mutate({ spaceId: space.id, userId: me.id })}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
