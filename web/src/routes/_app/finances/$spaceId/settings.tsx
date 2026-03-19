import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { useDeleteSpace } from '@/features/finances/hooks'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, type ChangeEvent, type PropsWithChildren } from 'react'
import z from 'zod/v3'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/layout/container'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { BackButton } from '@/components/back-button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export const Route = createFileRoute('/_app/finances/$spaceId/settings')({
  params: {
    parse: z.object({ spaceId: z.coerce.number() }).parse
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { currentSpace } = Route.useRouteContext()
  const { t } = useTranslation()
  const params = Route.useParams()
  return (
    <Container className="max-w-3xl flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <BackButton to="/finances" />
        <p className="text-sm">Back to space</p>
      </div>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>{t("Rename space")}</ItemTitle>
          <ItemDescription>
            {t("Rename your space name")}
          </ItemDescription>
        </ItemContent>

        <ItemActions>
          <RenameSpaceDialog spaceId={params.spaceId} name={currentSpace.name}>
            <Button variant="secondary">{t("Rename")}</Button>
          </RenameSpaceDialog>
        </ItemActions>
      </Item>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>{t("Delete space")}</ItemTitle>
          <ItemDescription>
            {t("Once you delete a space, there is no going back. Please be certain.")}
          </ItemDescription>
        </ItemContent>

        <ItemActions>
          <DeleteSpaceAlertDialog spaceId={params.spaceId}>
            <Button variant="secondary">{t("Delete")}</Button>
          </DeleteSpaceAlertDialog>
        </ItemActions>
      </Item>
    </Container>
  )
}

function RenameSpaceDialog(props: { spaceId: number, name: string } & PropsWithChildren) {
  const { t } = useTranslation()
  const [name, setName] = useState(props.name)
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.currentTarget.value)
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        {props.children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename space</DialogTitle>
        </DialogHeader>

        <Field>
          <FieldLabel htmlFor="name">{t("Name")}</FieldLabel>
          <Input
            value={name}
            onChange={handleInputChange}
            id="name"
            autoComplete="off"
          />
        </Field>

      </DialogContent>

    </Dialog>
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
          <AlertDialogAction onClick={handleConfirm} className={buttonVariants({ variant: "destructive" })}>
            {t("Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
