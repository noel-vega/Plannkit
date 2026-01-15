import { zodResolver } from "@hookform/resolvers/zod"
import { type FormEvent, type PropsWithChildren } from "react"
import { Controller, useForm } from "react-hook-form"
import { CreateTodoSchema, type TodoStatus } from "../types"
import { Field, FieldLabel, FieldDescription, FieldError, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { createTodo, invalidateListTodosQuery } from "@/features/todos/api"
import { Spinner } from "@/components/ui/spinner"
import { useDialog } from "@/hooks"

type Props = {
  status?: TodoStatus
} & PropsWithChildren

export function CreateTodoDialog({ status = "todo", ...props }: Props) {
  const { isOpen, setIsOpen, close } = useDialog()
  const createTodoMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: async () => {
      await invalidateListTodosQuery()
      close()
      form.reset()

    }
  })

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      status
    },
    resolver: zodResolver(CreateTodoSchema)
  })
  const handleSubmit = (e: FormEvent) => {
    form.handleSubmit((data) => {
      console.log("CREATE TODO:", data)
      createTodoMutation.mutate(data)
    })(e)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {props.children}
      </DialogTrigger>
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
            <Button type="submit" disabled={createTodoMutation.isPending || form.formState.isSubmitting}>
              {createTodoMutation.isPending && <Spinner />}
              Submit
            </Button>
          </DialogFooter>
        </form>


      </DialogContent>
    </Dialog>
  )
}
