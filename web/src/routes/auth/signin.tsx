import { Button } from '@/components/ui/button'
import { SignInForm } from '@/features/auth/components/sign-in-form'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/signin')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="max-w-lg w-full space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Welcome Back</h1>
        <p className="text-muted-foreground">Sign in to continue staying organized</p>
      </div>
      <SignInForm />
      <div className="text-sm">
        <span>
          Don't have an account?
        </span>
        <Button className="text-blue-500" variant="link" asChild>
          <Link to="/auth/signup">
            Sign Up
          </Link>
        </Button>
      </div>
    </div>
  )
}
