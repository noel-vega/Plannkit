import { CreateHabitSchema } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, type FormEvent } from "react"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "./ui/field"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog"
import { PlusIcon } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { createHabit, getListHabitsQueryOptions } from "@/api"
import { queryClient } from "@/lib/react-query"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"


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
      completionType: "step" as const
    }
  })

  const createHabitMutation = useMutation({
    mutationFn: createHabit,
  })

  const handleSubmit = (e: FormEvent) => {
    console.log("handle submit", form.formState.errors)
    form.handleSubmit(async data => {
      createHabitMutation.mutate(data, {
        onSuccess: (newHabit) => {
          console.log("success")
          const queryKey = getListHabitsQueryOptions().queryKey
          queryClient.setQueryData(queryKey, (oldData) => {
            return oldData ? [...oldData, newHabit] : oldData
          })
          props.onSubmit()
        }, onError: (e) => {
          console.log("something went wrong", e.message)
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

export function CreateHabitDialog() {
  const [open, setOpen] = useState(false)
  const closeDialog = () => setOpen(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><PlusIcon />Add Habit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create Habit</DialogTitle>
        <CreateHabitForm onSubmit={closeDialog} onCancel={closeDialog} />
      </DialogContent>
    </Dialog>
  )
}
