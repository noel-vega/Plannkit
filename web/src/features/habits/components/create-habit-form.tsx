import { CreateHabitSchema } from "@/features/habits/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { type FormEvent } from "react"
import { Controller, useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { createHabit, getListHabitsQueryOptions } from "@/features/habits/api"
import { queryClient } from "@/lib/react-query"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldSet, FieldTitle } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CompletionsPerDayInput } from "@/components/ui/completions-per-day-input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { DialogProps } from "@/types"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useDialog, useMediaQuery } from "@/hooks"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { IconPicker, icons } from "@/components/ui/icon-picker"
import { DynamicIcon } from "@/components/ui/dynamic-icon"

type CreateHabitFormProps =
  {
    onSubmit: () => void
    onCancel: () => void
  }
export function CreateHabitForm(props: CreateHabitFormProps) {
  const { open, onOpenChange } = useDialog()
  const form = useForm({
    resolver: zodResolver(CreateHabitSchema),
    defaultValues: {
      name: "",
      icon: "Activity",
      description: "",
      completionType: "step" as const,
      completionsPerDay: 1,
    }
  })

  const createHabitMutation = useMutation({
    mutationFn: createHabit,
  })

  const handleSubmit = (e: FormEvent) => {
    console.log(form.formState.errors)
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
      <div className="flex flex-col gap-2">
        <div className="flex justify-center items-end">
          <Controller control={form.control} name="icon" render={({ field }) => (
            <Popover modal open={open} onOpenChange={onOpenChange}>
              <PopoverTrigger asChild>
                <Button variant="outline" type="button" className="size-20 border-3 rounded-full flex items-center justify-center bg-secondary/50 hover:bg-secondary cursor-pointer">
                  <DynamicIcon name={field.value} size={20} />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="shadow-2xl p-0">
                <div className="max-h-96 max-w-96 w-full  h-full flex flex-col gap-2">
                  <div className="font-semibold p-3 border-b">Pick Icon</div>
                  <div className="overflow-auto flex-1 p-3">
                    <div className="overflow-auto">
                      <IconPicker
                        value={field.value}
                        onChange={(icon) => {
                          field.onChange(icon)
                          onOpenChange(false)
                        }}
                        icons={icons}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>

            </Popover>
          )} />
        </div>
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

      </div>

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


export function CreateHabitDialog(props: DialogProps) {
  const closeDialog = () => {
    props.onOpenChange(false)
  }
  return (
    <Dialog {...props} modal>
      <DialogContent>
        <DialogTitle>Create Habit</DialogTitle>
        <CreateHabitForm onSubmit={closeDialog} onCancel={closeDialog} />
      </DialogContent>
    </Dialog>
  )
}

export function CreateHabitDrawer(props: DialogProps) {
  const closeDrawer = () => {
    props.onOpenChange(false)
  }
  return (
    <Drawer  {...props} modal>
      <DrawerContent className="pb-3 min-h-[90%]">
        <div className="overflow-scroll px-3">
          <DrawerHeader>
            <DrawerTitle>Create Habit</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-scroll">
            <CreateHabitForm onSubmit={closeDrawer} onCancel={closeDrawer} />
          </div>
        </div>
      </DrawerContent>

    </Drawer>
  )
}

export function CreateHabitDialogDrawer(props: DialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  if (isDesktop) {
    return <CreateHabitDialog {...props} />
  }
  return <CreateHabitDrawer {...props} />
}
