import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { CreateRoutineSchema } from "../types"
import type { FormEvent } from "react"
import { useCreateRoutineMutation } from "../hooks"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useTranslation } from "react-i18next"
import type { DialogProps } from "@/types"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"

export function CreateRoutineForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation()
  const createRoutine = useCreateRoutineMutation()

  const form = useForm({
    resolver: zodResolver(CreateRoutineSchema),
    defaultValues: {
      name: ""
    }
  })

  const handleSubmit = (e: FormEvent) => {
    return form.handleSubmit((data) => {
      createRoutine.mutate(data, {
        onSuccess: () => {
          onSuccess()
        }
      })
    })(e)
  }

  const isDisabled = !form.formState.isValid || createRoutine.isPending || createRoutine.isSuccess
  return (
    <form onSubmit={handleSubmit}>
      <Controller control={form.control} name="name"
        render={({ field, fieldState }) => {
          return <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{t("Name")}</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              autoComplete="off"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        }}
      />
      <Button disabled={isDisabled}>Submit</Button>
    </form>
  )
}

export function CreateRoutineDialog(props: DialogProps) {
  const { t } = useTranslation()
  const closeDialog = () => {
    props.onOpenChange(false)
  }
  return (
    <Dialog {...props} modal>
      <DialogContent>
        <DialogTitle>{t("Create Routine")}</DialogTitle>
        <CreateRoutineForm onSuccess={closeDialog} />
      </DialogContent>
    </Dialog>
  )
}

export function CreateRoutineDrawer(props: DialogProps) {
  const { t } = useTranslation()
  const closeDrawer = () => {
    props.onOpenChange(false)
  }
  return (
    <Drawer  {...props} modal>
      <DrawerContent className="pb-3 min-h-[90%]">
        <div className="overflow-scroll px-3">
          <DrawerHeader>
            <DrawerTitle>{t("Create Routine")}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-scroll">
            <CreateRoutineForm onSuccess={closeDrawer} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}


export function CreateRoutineDialogDrawer(props: DialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  if (isDesktop) {
    return <CreateRoutineDialog {...props} />
  }
  return <CreateRoutineDrawer {...props} />
}
