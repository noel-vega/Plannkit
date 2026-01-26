import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import type { FormEvent } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod/v3"
import { signUp } from "../api"

const SignUpDataSchema = z.object({
  firstName: z.string().min(1, { message: "Required" }),
  lastName: z.string().min(1, { message: "Required" }),
  email: z.string().min(1, { message: "Required" }),
  password: z.string().min(6, { message: "Too short, 6 characters required" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof SignUpDataSchema>


export function SignUpForm() {
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(SignUpDataSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  })

  const signUpMutation = useMutation({
    mutationFn: signUp,
  })

  const handleSubmit = (e: FormEvent) => {
    form.handleSubmit(data => {
      signUpMutation.mutate(data)
    })(e)
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6 @container/form">
      {signUpMutation.error && (
        <div className="p-4 bg-red-100/50 border border-destructive rounded-lg font-medium text-red-700">
          * {signUpMutation.error.message}
        </div>
      )}

      <FieldGroup>
        <FieldSet className="flex @sm:flex-row flex-col">
          <Controller control={form.control} name="firstName"
            render={({ field, fieldState }) => {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                  <Input
                    {...field}
                    placeholder="John"
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )
            }}
          />

          <Controller control={form.control} name="lastName"
            render={({ field, fieldState }) => {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Last Name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Smith"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )
            }}
          />
        </FieldSet>

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


        <Controller control={form.control} name="confirmPassword"
          render={({ field, fieldState }) => {
            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
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
        <Button type="submit" className="w-full" disabled={!form.formState.isValid}>Sign Up</Button>
      </div>
    </form>
  )
}
