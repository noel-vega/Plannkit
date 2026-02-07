import { zodResolver } from "@hookform/resolvers/zod"
import type { FormEvent } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod/v3"
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from "@/lib/utils"
import { PlusIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

const AddItemFormDataSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().min(1)
})

export type AddItemFormData = z.infer<typeof AddItemFormDataSchema>

export function AddItemForm(props: { className?: string, onSubmit: (val: AddItemFormData) => void }) {
  const { t } = useTranslation()
  const form = useForm({
    resolver: zodResolver(AddItemFormDataSchema),
    defaultValues: {
      name: "",
      quantity: 1
    }
  })

  const handleSubmit = (e: FormEvent) => {
    form.handleSubmit(data => {
      form.reset()
      form.setFocus("name")
      props.onSubmit(data)
    })(e)
  }

  return (
    <form onSubmit={handleSubmit} className={cn("", props.className)}>
      <Controller
        name="name"
        control={form.control}
        render={({ field }) => (
          <Field className="flex-1">
            <Input placeholder={t("Search and add items")} {...field} />
          </Field>
        )}
      />

      <Button variant="secondary" type="submit" onClick={() => {
        form.setFocus("name")
      }}>
        <PlusIcon />
        {t("Item")}
      </Button>
    </form>
  )
}
