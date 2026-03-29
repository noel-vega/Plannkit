import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { DialogProps } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FormEvent } from "react"
import { Controller, useForm } from "react-hook-form"
import { UpdateRoutineSchema, type Routine } from "../types"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

type EditRoutineFormProps = {
  routine: Routine
}

export function EditRoutineForm(props: EditRoutineFormProps) {
  const { t } = useTranslation()
  const form = useForm({
    resolver: zodResolver(UpdateRoutineSchema),
    defaultValues: props.routine
  })

  const handleSubmit = (e: FormEvent) => {
    return form.handleSubmit((data) => {
      console.log(data)
    })(e)
  }

  const isDisabled = !form.formState.isValid || !form.formState.isDirty
  const isResetDisabled = !form.formState.isDirty

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Controller control={form.control} name="name"
        render={({ field, fieldState }) => {
          return (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{t("Name")}</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                autoFocus
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )
        }}
      />
      <div className="flex justify-end gap-2">
        <Button disabled={isResetDisabled} type="button" variant="outline" className="ml-auto w-fit" onClick={() => form.reset()}>Reset</Button>
        <Button disabled={isDisabled} type="submit">Save</Button>
      </div>
    </form>
  )
}

export function EditRoutineDialog({ routine, ...dialog }: { routine: Routine } & DialogProps) {
  return (
    <Dialog {...dialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Routine</DialogTitle>
        </DialogHeader>
        <EditRoutineForm routine={routine} />
      </DialogContent>
    </Dialog>
  )
}
