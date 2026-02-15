import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FormEvent } from "react"
import { Controller, useForm } from "react-hook-form"
import { useAuth } from "../store"
import { useNavigate } from "@tanstack/react-router"
import { useSignUp } from "../hooks"
import { AuthErrorMessage } from "./auth-error-message"
import { SignUpDataSchema, type SignUpFormData } from "../types"

export function SignUpForm() {
  const navigate = useNavigate()
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

  const signUp = useSignUp()

  const handleSignUp = (e: FormEvent) => {
    form.handleSubmit(data => {
      signUp.mutate(data, {
        onSuccess: (data) => {
          useAuth.setState(data)
          navigate({ to: "/app/habits" })
        }
      })
    })(e)
  }

  const isDisabled = !form.formState.isValid || signUp.isPending || signUp.isSuccess

  return (
    <form onSubmit={handleSignUp} className="space-y-6 @container/form">
      <AuthErrorMessage message={signUp.error?.message} />

      <FieldGroup>
        <FieldSet className="flex flex-row gap-2">
          <Controller control={form.control} name="firstName"
            render={({ field, fieldState }) =>
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
            }
          />

          <Controller control={form.control} name="lastName"
            render={({ field, fieldState }) =>
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
            }
          />
        </FieldSet>

        <Controller control={form.control} name="email"
          render={({ field, fieldState }) =>
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
          }
        />

        <Controller control={form.control} name="password"
          render={({ field, fieldState }) =>
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
          }
        />

        <Controller control={form.control} name="confirmPassword"
          render={({ field, fieldState }) =>
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
          }
        />
      </FieldGroup>

      <Button className="w-full" disabled={isDisabled}>Sign Up</Button>
    </form>
  )
}
