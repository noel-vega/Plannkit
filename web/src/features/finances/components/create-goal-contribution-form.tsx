import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { CreateGoalContributionParamsSchema, type GoalIdent } from "../types"
import type { FormEvent, PropsWithChildren } from "react"
import { useCreateGoalContributionMutation } from "../hooks"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useDialog } from "@/hooks"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

type Props = GoalIdent & {
  onSuccess: () => void
}

export function CreateGoalContributionForm(props: Props) {
  const { t } = useTranslation()
  const createGoalContribution = useCreateGoalContributionMutation()
  const form = useForm({
    resolver: zodResolver(CreateGoalContributionParamsSchema),
    defaultValues: {
      amount: 0,
      note: ""
    }
  })

  const handleSubmit = (e: FormEvent) => {
    form.handleSubmit(data => {
      createGoalContribution.mutate({
        spaceId: props.spaceId,
        goalId: props.goalId,
        data
      }, {
        onSuccess: () => {
          props.onSuccess()
        }
      })
    })(e)
  }

  const handleReset = () => form.reset()

  const isDisabled = !form.formState.isDirty || createGoalContribution.isPending || createGoalContribution.isSuccess

  return (
    <form onSubmit={handleSubmit}>
      <Field>
        <Controller control={form.control} name="amount"
          render={({ field, fieldState }) =>
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{t("Amount")}</FieldLabel>
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

        <Controller control={form.control} name="note"
          render={({ field, fieldState }) =>
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{t("Note")}</FieldLabel>
              <Textarea
                id={field.name}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          }
        />
        <div className="flex gap-2">
          <Button type="button" disabled={!form.formState.isDirty} variant="outline" onClick={handleReset}>{t("Reset")}</Button>
          <Button type="submit" disabled={isDisabled}>{t("Create")}</Button>
        </div>
      </Field>
    </form>
  )
}

export function CreateGoalContributionDialog(props: GoalIdent & PropsWithChildren) {
  const { t } = useTranslation()
  const dialog = useDialog()

  return (
    <Dialog {...dialog}>
      <DialogTrigger asChild>
        {props.children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Create Goal Contribution")}</DialogTitle>
        </DialogHeader>
        <CreateGoalContributionForm spaceId={props.spaceId} goalId={props.goalId} onSuccess={dialog.close} />
      </DialogContent>
    </Dialog>
  )
}
