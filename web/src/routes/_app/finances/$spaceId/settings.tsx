import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { useDeleteSpace } from '@/features/finances/hooks'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { PropsWithChildren } from 'react'
import z from 'zod/v3'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_app/finances/$spaceId/settings')({
  params: {
    parse: z.object({ spaceId: z.coerce.number() }).parse
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const params = Route.useParams()
  return (
    <>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>{t("Delete this space")}</ItemTitle>
          <ItemDescription>
            {t("Once you delete a space, there is no going back. Please be certain.")}
          </ItemDescription>
        </ItemContent>

        <ItemActions>
          <DeleteSpaceAlertDialog spaceId={params.spaceId}>
            <Button variant="secondary">{t("Delete space")}</Button>
          </DeleteSpaceAlertDialog>
        </ItemActions>
      </Item>
    </>
  )
}

function DeleteSpaceAlertDialog(props: { spaceId: number; } & PropsWithChildren) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deleteSpace = useDeleteSpace()
  const handleConfirm = () => {
    deleteSpace.mutate({ id: props.spaceId })
    navigate({ to: "/finances" })
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {props.children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Are you sure?")}</AlertDialogTitle>
          <AlertDialogDescription>{t("Once you delete a space, there is no going back.")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {t("Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            {t("Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
