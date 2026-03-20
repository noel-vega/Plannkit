import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { useCurrentSpace, useDeleteSpace, useSpaceUpdateNameMutation } from '@/features/finances/hooks'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { type FormEvent, type PropsWithChildren } from 'react'
import z from 'zod/v3'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/layout/container'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { BackButton } from '@/components/back-button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDialog } from '@/hooks'

export const Route = createFileRoute('/_app/finances/$spaceId/settings')({
  params: {
    parse: z.object({ spaceId: z.coerce.number() }).parse
  },
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  const currentSpace = useCurrentSpace(params)
  const { t } = useTranslation()
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
            {t(currentSpace.data?.name ?? "")}
          </ItemDescription>
        </ItemContent>

        <ItemActions>
          <RenameSpaceDialog spaceId={params.spaceId} name={currentSpace.data.name}>
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
  const dialog = useDialog()
  const router = useRouter()
  const { t } = useTranslation()
  const form = useForm({
    resolver: zodResolver(z.object({ spaceId: z.number(), name: z.string().min(1) })),
    defaultValues: {
      spaceId: props.spaceId,
      name: props.name
    }
  })
  const updateName = useSpaceUpdateNameMutation()

  //TODO: invalidate the current name in finance switcher
  const handleSubmit = (e: FormEvent) => {
    return form.handleSubmit((data) => {
      updateName.mutate(data, {
        onSuccess: () => {
          dialog.onOpenChange(false)
          router.invalidate()
        }
      })
    })(e)
  }
  const isDisabled = !form.formState.isValid || !form.formState.isDirty

  return (
    <Dialog {...dialog}>
      <DialogTrigger asChild>
        {props.children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Rename space")}</DialogTitle>
          <DialogDescription>
            {t("Update the name of your finance space.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="name">{t("Name")}</FieldLabel>
            <Input
              {...form.register("name")}
              id="name"
              autoComplete="off"
            />
          </Field>
          <Button type="submit" disabled={isDisabled}>{t("Save")}</Button>
        </form>
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
