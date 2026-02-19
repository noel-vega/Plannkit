import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FormEvent, PropsWithChildren } from "react";
import { Controller, useForm } from "react-hook-form";
import { CreateExpenseParamsSchema } from "../types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateFinanceExpense } from "../hooks";
import { useDialog } from "@/hooks";

type CreateExpenseFormProps = {
  spaceId: number,
  onSubmit: () => void
}

export function CreateExpenseForm(props: CreateExpenseFormProps) {
  const createExpense = useCreateFinanceExpense()
  const form = useForm({
    resolver: zodResolver(CreateExpenseParamsSchema),
    defaultValues: {
      spaceId: props.spaceId,
      name: "",
      amount: 0,
      category: null,
      description: null
    }
  })

  const handleSubmit = (e: FormEvent) => {
    form.handleSubmit(data => {
      createExpense.mutate(data, {
        onSuccess: () => {
          form.reset()
          props.onSubmit()
        }
      })
    })(e)
  }

  const handleReset = () => {
    form.reset()
    form.setFocus("name")
  }

  const isDisabled = !form.formState.isValid || createExpense.isPending
  return (
    <form onSubmit={handleSubmit}>
      <Field>
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field orientation="horizontal">
          <Controller
            name="amount"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="category"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="child-care">Childcare</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </Field>


        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <Textarea placeholder="Describe your expense..." value={field.value ?? undefined} onChange={field.onChange} className="h-24 resize-none" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
          <Button type="submit" disabled={isDisabled}>Submit</Button>
        </Field>

      </Field>
    </form>
  )
}

type Props = {
  spaceId: number
} & PropsWithChildren

export function CreateExpenseDialog(props: Props) {
  const dialog = useDialog()
  return (
    <Dialog {...dialog}>
      <DialogTrigger asChild>
        {props.children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Expense</DialogTitle>
        </DialogHeader>
        <CreateExpenseForm spaceId={props.spaceId} onSubmit={dialog.close} />
      </DialogContent>
    </Dialog>
  )
}


