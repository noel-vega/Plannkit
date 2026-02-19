import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { DialogProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CreateFinanceSpaceSchema, type FinanceSpace } from "../types";
import { type FormEvent } from "react";
import { useCreateFinanceSpace } from "../hooks";

type Props = {
  onSuccess: (space: FinanceSpace) => void
} & DialogProps

export function CreateFinanceSpaceDialog(props: Props) {

  const handleOpenChange = (open: boolean) => {
    props.onOpenChange(open)
  }

  return (
    <Dialog {...props} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Finance Space</DialogTitle>
        </DialogHeader>
        <CreateFinanceSpaceForm onSuccess={props.onSuccess} />
      </DialogContent>
    </Dialog>
  )
}

export function CreateFinanceSpaceForm(props: { onSuccess: (space: FinanceSpace) => void }) {
  const form = useForm({
    resolver: zodResolver(CreateFinanceSpaceSchema),
    defaultValues: {
      name: ""
    }
  })

  const createSpace = useCreateFinanceSpace()

  const handleSubmit = (e: FormEvent) => {
    form.handleSubmit((data) => {
      createSpace.mutate(data, {
        onSuccess: (data) => {
          props.onSuccess(data)
          form.reset()
        }
      })
    })(e)
  }

  const isDisabled = !form.formState.isValid
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Controller control={form.control} name="name"
        render={({ field, fieldState }) =>
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              autoComplete="off"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        }
      />

      <div>
        <Button type="submit" disabled={isDisabled}>Create</Button>
      </div>
    </form>
  )
}
