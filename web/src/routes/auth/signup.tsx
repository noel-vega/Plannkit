import { Button } from '@/components/ui/button'
import { SignUpForm } from '@/features/auth/components/sign-up-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import type { PropsWithChildren } from 'react'

export const Route = createFileRoute('/auth/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Container>
      <Header />
      <SignUpForm />
      <SignInCallout />
    </Container>
  )
}

function Container({ children }: PropsWithChildren) {
  return (
    <div className="max-w-lg w-full space-y-4">
      {children}
    </div>
  )
}

function Header() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Sign Up</h1>
      <p className="text-muted-foreground">Get organized today!</p>
    </div>
  )
}

function SignInCallout() {
  return (
    <div className="text-sm">
      <span>
        Already have an account?
      </span>
      <Button className="text-blue-500" variant="link" asChild>
        <Link to="/auth/signin">
          Sign In
        </Link>
      </Button>
    </div>
  )
}
