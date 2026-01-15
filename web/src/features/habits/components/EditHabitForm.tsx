import { invalidateHabitById, updateHabit } from "@/features/habits/api"
import { HabitSchema, type Habit } from "@/features/habits/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { type FormEvent, type PropsWithChildren } from "react"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldSet, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDialog } from "@/hooks"
import { CompletionsPerDayInput } from "@/components/ui/completions-per-day-input"

type EditHabitFormProps =
  {
    habit: Habit
    onSubmit: () => void
    onCancel: () => void
  }
export function EditHabitForm(props: EditHabitFormProps) {
  const form = useForm({
    resolver: zodResolver(HabitSchema),
    defaultValues: props.habit
  })

  const updateHabitMutation = useMutation({
    mutationFn: updateHabit,
  })

  const handleSubmit = (e: FormEvent) => {
    form.handleSubmit(async data => {
      updateHabitMutation.mutate(data, {
        onSuccess: () => {
          invalidateHabitById(data.id)
          props.onSubmit()
        }, onError: (e) => {
          console.error("Could not create habit", e.message)
        }
      })
    })(e)
  }

  const handleCancel = () => {
    form.reset()
    props.onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Controller control={form.control} name="name"
        render={({ field, fieldState }) => {
          return <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
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

      <Controller control={form.control} name="description"
        render={({ field, fieldState }) => {
          return <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Description</FieldLabel>
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

      <Controller
        name="completionType"
        control={form.control}
        render={({ field, fieldState }) => (
          <FieldSet>
            <FieldLabel htmlFor={field.name}>Completion Type</FieldLabel>
            <RadioGroup
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
            >
              <FieldLabel htmlFor={`form-rhf-radiogroup-step`} className="cursor-pointer">
                <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                  <FieldContent>
                    <FieldTitle>Step By Step</FieldTitle>
                    <FieldDescription>Increment by 1  with each completion</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem
                    value="step"
                    id={`form-rhf-radiogroup-step`}
                    aria-invalid={fieldState.invalid}
                  />
                </Field>
              </FieldLabel>

              <FieldLabel htmlFor={`form-rhf-radiogroup-custom`} className="cursor-pointer">
                <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                  <FieldContent>
                    <FieldTitle>Custom Value</FieldTitle>
                    <FieldDescription>Enter any value when completing</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem
                    value="custom"
                    id={`form-rhf-radiogroup-custom`}
                    aria-invalid={fieldState.invalid}
                  />
                </Field>
              </FieldLabel>
            </RadioGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldSet>
        )}
      />

      <Controller control={form.control} name="completionsPerDay"
        render={({ field, fieldState }) => {
          return <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Completions per day</FieldLabel>
            <CompletionsPerDayInput {...field} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        }}
      />

      <div className="justify-end gap-3 flex">
        <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>

  )
}

export function EditHabitDialog(props: { habit: Habit } & PropsWithChildren) {
  const { isOpen, setIsOpen, close } = useDialog()
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {props.children}
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>
            View and edit your habit settings.
          </DialogDescription>
        </DialogHeader>
        <EditHabitForm habit={props.habit} onSubmit={close} onCancel={close} />
      </DialogContent>
    </Dialog>
  )
}
