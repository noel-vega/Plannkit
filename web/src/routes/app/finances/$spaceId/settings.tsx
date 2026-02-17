import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { useDeleteFinanceSpace } from '@/features/finances/hooks'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { PropsWithChildren } from 'react'
import z from 'zod/v3'

export const Route = createFileRoute('/app/finances/$spaceId/settings')({
  params: {
    parse: z.object({ spaceId: z.coerce.number() }).parse
  },
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  return (
    <>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Delete this space</ItemTitle>
          <ItemDescription>
            Once you delete a space, there is no going back. Please be certain.
          </ItemDescription>
        </ItemContent>

        <ItemActions>
          <DeleteSpaceAlertDialog spaceId={params.spaceId}>
            <Button variant="secondary">Delete space</Button>
          </DeleteSpaceAlertDialog>
        </ItemActions>
      </Item>
    </>
  )
}

function DeleteSpaceAlertDialog(props: { spaceId: number; } & PropsWithChildren) {
  const navigate = useNavigate()
  const deleteSpace = useDeleteFinanceSpace()
  const handleConfirm = () => {
    deleteSpace.mutate({ id: props.spaceId })
    navigate({ to: "/app/finances" })
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {props.children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>Once you delete a space, there is no going back.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
