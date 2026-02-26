import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { SignInForm } from '@/features/auth/components/sign-in-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/auth/signin')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  return (
    <Container className="max-w-lg w-full mx-auto">
      <div className="space-y-2 mb-4">
        <h1 className="text-2xl font-semibold">{t("Welcome Back")}</h1>
        <p className="text-muted-foreground">{t("Sign in to continue staying organized")}</p>
      </div>
      <SignInForm />
      <div className="text-sm mt-2">
        <span>
          {t("Don't have an account?")}
        </span>
        <Button className="text-blue-500" variant="link" asChild>
          <Link to="/auth/signup">
            {t("Sign Up")}
          </Link>
        </Button>
      </div>
    </Container>
  )
}
