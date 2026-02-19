import { Controller, useForm } from "react-hook-form"
import { CreateGoalParamsSchema, type CreateGoalParams } from "../types"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FormEvent, PropsWithChildren } from "react"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useDialog } from "@/hooks"
import { useCreateGoal } from "../hooks"

type CreateGoalFormProps = {
  spaceId: number
  onSubmit: () => void
}

export function CreateGoalForm(props: CreateGoalFormProps) {
  const { isPending, isSuccess, mutate: createGoal } = useCreateGoal()
  const form = useForm<CreateGoalParams>({
    resolver: zodResolver(CreateGoalParamsSchema),
    defaultValues: {
      spaceId: props.spaceId,
      name: "",
      amount: 0,
      monthlyCommitment: 0
    }
  })

  const handleSubmit = (e: FormEvent) => {
    form.handleSubmit(data => {
      console.log("submit", data)
      createGoal(data, {
        onSuccess: props.onSubmit
      })
    })(e)
  }
  const isDisabled = !form.formState.isValid || isPending || isSuccess
  return (
    <form onSubmit={handleSubmit}>
      <Field>
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

        <Controller control={form.control} name="amount"
          render={({ field, fieldState }) =>
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
              <Input
                type="number"
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          }
        />

        <Controller control={form.control} name="monthlyCommitment"
          render={({ field, fieldState }) =>
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Monthly Commitment</FieldLabel>
              <Input
                type="number"
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          }
        />
        <Button type="submit" disabled={isDisabled}>Add Goal</Button>
      </Field>
    </form>
  )
}

export function CreateGoalDialog(props: { spaceId: number } & PropsWithChildren) {
  const dialog = useDialog()
  return (
    <Dialog {...dialog}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Goal</DialogTitle>
          <DialogDescription>
            Set a new financial goal to work towards.
          </DialogDescription>
        </DialogHeader>
        <CreateGoalForm spaceId={props.spaceId} onSubmit={dialog.close} />
      </DialogContent>
    </Dialog>
  )
}
