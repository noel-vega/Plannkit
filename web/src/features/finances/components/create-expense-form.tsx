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
import { useDialog } from "@/hooks";
import { useCreateExpense } from "../hooks";
import { useTranslation } from "react-i18next";

type CreateExpenseFormProps = {
  spaceId: number,
  onSubmit: () => void
}

export function CreateExpenseForm(props: CreateExpenseFormProps) {
  const { t } = useTranslation()
  const createExpense = useCreateExpense()
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
              <FieldLabel htmlFor={field.name}>{t("Name")}</FieldLabel>
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
                <FieldLabel htmlFor={field.name}>{t("Amount")}</FieldLabel>
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
                <FieldLabel htmlFor={field.name}>{t("Category")}</FieldLabel>
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select option")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="child-care">{t("Childcare")}</SelectItem>
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
              <FieldLabel htmlFor={field.name}>{t("Description")}</FieldLabel>
              <Textarea placeholder={t("Describe your expense...")} value={field.value ?? undefined} onChange={field.onChange} className="h-24 resize-none" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={handleReset}>{t("Reset")}</Button>
          <Button type="submit" disabled={isDisabled}>{t("Submit")}</Button>
        </Field>

      </Field>
    </form>
  )
}

type Props = {
  spaceId: number
} & PropsWithChildren

export function CreateExpenseDialog(props: Props) {
  const { t } = useTranslation()
  const dialog = useDialog()
  return (
    <Dialog {...dialog}>
      <DialogTrigger asChild>
        {props.children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Create Expense")}</DialogTitle>
        </DialogHeader>
        <CreateExpenseForm spaceId={props.spaceId} onSubmit={dialog.close} />
      </DialogContent>
    </Dialog>
  )
}


