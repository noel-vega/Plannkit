import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { DialogProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { UpdateGoalSchema, type Goal } from "../types";
import type { FormEvent } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFinanceUpdateGoal } from "../hooks";

type Props = {
  goal: Goal;
  onSuccess: () => void
}

function EditGoalForm(props: Props) {
  const form = useForm({
    resolver: zodResolver(UpdateGoalSchema),
    defaultValues: props.goal
  })

  const updateGoal = useFinanceUpdateGoal()

  const handleSubmit = (e: FormEvent) => {
    return form.handleSubmit((data) => {
      console.log(data)
      updateGoal.mutate(data, {
        onSuccess: props.onSuccess
      })
    })(e)
  }

  const isSubmitDisabled = !form.formState.isValid || !form.formState.isDirty
  const isResetDisabled = !form.formState.isDirty
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Controller
        name="name"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input {...field} />
          </Field>
        )}
      />

      <Controller
        name="amount"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Amount</FieldLabel>
            <Input type="number" {...field} />
          </Field>
        )}
      />

      <Controller
        name="monthlyCommitment"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Monthly Commitment</FieldLabel>
            <Input type="number" {...field} />
          </Field>
        )}
      />

      <div className="flex justify-end gap-3">
        <Button type="button" disabled={isResetDisabled} variant="outline">Reset</Button>
        <Button type="submit" disabled={isSubmitDisabled}>Submit</Button>
      </div>
    </form>
  )
}

export function EditGoalDialog({ goal, ...dialogProps }: { goal: Goal } & DialogProps) {
  return (
    <Dialog {...dialogProps}>
      <DialogContent onOpenAutoFocus={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
          <DialogDescription>
            Edit your goal
          </DialogDescription>
        </DialogHeader>

        <EditGoalForm goal={goal} onSuccess={() => dialogProps.onOpenChange(false)} />

      </DialogContent>
    </Dialog>
  )
}
