import { SignUpForm } from '@/features/auth/components/sign-up-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <SignUpForm />
  </div>
}
