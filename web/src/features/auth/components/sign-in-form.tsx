import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import type { FormEvent } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod/v3"
import { signIn } from "../api"
import { useAuth } from "../store"
import { useNavigate } from "@tanstack/react-router"

const SignInDataSchema = z.object({
  email: z.string().min(1, { message: "Required" }),
  password: z.string().min(1, { message: "Required" }),
})

type SignInFormData = z.infer<typeof SignInDataSchema>


export function SignInForm() {
  const navigate = useNavigate()
  const form = useForm<SignInFormData>({
    resolver: zodResolver(SignInDataSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  })

  const signInMutation = useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      useAuth.setState(data)
      navigate({ to: "/app/habits" })
    }
  })

  const handleSubmit = (e: FormEvent) => {
    form.handleSubmit(data => {
      signInMutation.mutate(data)
    })(e)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 @container/form">
      {signInMutation.error && (
        <div className="p-4 bg-red-100/50 border border-destructive rounded-lg font-medium text-red-700">
          * {signInMutation.error.message}
        </div>
      )}

      <FieldGroup>
        <Controller control={form.control} name="email"
          render={({ field, fieldState }) => {
            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="JohnSmith@gmail.com"
                  type="email"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )
          }}
        />

        <Controller control={form.control} name="password"
          render={({ field, fieldState }) => {
            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )
          }}
        />
      </FieldGroup>

      <div>
        <Button type="submit" className="w-full" disabled={!form.formState.isValid || signInMutation.isPending}>Sign In</Button>
      </div>
    </form>
  )
}
