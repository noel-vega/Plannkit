import { CreateHabitSchema } from "@/features/habits/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { type FormEvent, type PropsWithChildren } from "react"
import { Controller, useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { createHabit, getListHabitsQueryOptions } from "@/features/habits/api"
import { queryClient } from "@/lib/react-query"
import { useDialog } from "@/hooks"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldSet, FieldTitle } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CompletionsPerDayInput } from "@/components/ui/completions-per-day-input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type CreateHabitFormProps =
  {
    onSubmit: () => void
    onCancel: () => void
  }
export function CreateHabitForm(props: CreateHabitFormProps) {
  const form = useForm({
    resolver: zodResolver(CreateHabitSchema),
    defaultValues: {
      name: "",
      description: "",
      completionType: "step" as const,
      completionsPerDay: 1,
    }
  })

  const createHabitMutation = useMutation({
    mutationFn: createHabit,
  })

  const handleSubmit = (e: FormEvent) => {
    form.handleSubmit(async data => {
      createHabitMutation.mutate(data, {
        onSuccess: (newHabit) => {
          const queryKey = getListHabitsQueryOptions().queryKey
          queryClient.setQueryData(queryKey, (oldData) => {
            return oldData ? [...oldData, newHabit] : oldData
          })
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
          return (
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
          )
        }}
      />

      <Controller control={form.control} name="description"
        render={({ field, fieldState }) => {
          return (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )
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

export function CreateHabitDialog(props: PropsWithChildren) {
  const { isOpen, close, setIsOpen } = useDialog()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {props.children}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create Habit</DialogTitle>
        <CreateHabitForm onSubmit={close} onCancel={close} />
      </DialogContent>
    </Dialog>
  )
}
