import { Button } from '@/components/ui/button'
import { SignUpForm } from '@/features/auth/components/sign-up-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { NotebookTabsIcon } from 'lucide-react'

export const Route = createFileRoute('/auth/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="max-w-lg w-full space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-medium">Get Organized Now</h1>
        <p className="text-muted-foreground">Create your account below to get started</p>
      </div>
      <SignUpForm />
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
    </div>
  )
}
