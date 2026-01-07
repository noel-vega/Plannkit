import { updateHabit } from "@/api"
import { HabitSchema, type Habit } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useState, type FormEvent } from "react"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldSet, FieldTitle } from "./ui/field"
import { Input } from "./ui/input"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { PlusIcon } from "lucide-react"



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
          props.onSubmit()
        }, onError: (e) => {
          console.log("Could not create habit", e.message)
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




      <div className="justify-end gap-3 flex">
        <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>

  )
}

export function EditHabitDialog(props: { habit: Habit }) {
  const [open, setOpen] = useState(false)
  const closeDialog = () => setOpen(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><PlusIcon />Add Habit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Edit Habit</DialogTitle>
        <EditHabitForm habit={props.habit} onSubmit={closeDialog} onCancel={closeDialog} />
      </DialogContent>
    </Dialog>
  )
}
