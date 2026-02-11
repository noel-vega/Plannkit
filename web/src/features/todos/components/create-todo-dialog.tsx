import { zodResolver } from "@hookform/resolvers/zod"
import { type FormEvent, type PropsWithChildren } from "react"
import { Controller, useForm } from "react-hook-form"
import { CreateTodoParamsSchema, type TodoStatus } from "../types"
import { Field, FieldLabel, FieldDescription, FieldError, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { DialogProps } from "@/types"
import { useCreateTodo } from "../hooks"

type Props = {
  status?: TodoStatus
} & PropsWithChildren & DialogProps

export function CreateTodoDialog({ status = "todo", ...props }: Props) {
  const createTodo = useCreateTodo()

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      status
    },
    resolver: zodResolver(CreateTodoParamsSchema)
  })

  const handleSubmit = (e: FormEvent) => {
    form.handleSubmit((data) => {
      createTodo.mutate(data, {
        onSuccess: async () => {
          props.onOpenChange(false)
          form.reset()
        }
      })
    })(e)
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Todo</DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldSet>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Provide a concise name for your todo.
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea {...field} />
                  <FieldDescription>
                    Describe your todo in further detail.
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldSet>
          <DialogFooter>
            <Button type="submit" disabled={createTodo.isPending || form.formState.isSubmitting}>
              {createTodo.isPending && <Spinner />}
              Submit
            </Button>
          </DialogFooter>
        </form>


      </DialogContent>
    </Dialog>
  )
}
