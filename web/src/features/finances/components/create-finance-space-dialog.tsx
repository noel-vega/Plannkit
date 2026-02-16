import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { DialogProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CreateFinanceSpaceSchema } from "../types";
import { type FormEvent } from "react";

export function CreateFinanceSpaceDialog(props: DialogProps) {
  const form = useForm({
    resolver: zodResolver(CreateFinanceSpaceSchema),
    defaultValues: {
      name: ""
    }
  })

  const handleSubmit = (e: FormEvent) => {
    form.handleSubmit((data) => {
      console.log(data)
    })(e)
  }

  const isDisabled = !form.formState.isValid

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset({ name: "" })
    }
    props.onOpenChange(open)
  }

  return (
    <Dialog {...props} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Finance Space</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-2">
          <Controller control={form.control} name="name"
            render={({ field, fieldState }) =>
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
            }
          />

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => props.onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isDisabled}>Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
