import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { SignUpForm } from '@/features/auth/components/sign-up-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/auth/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Container className="max-w-lg w-full mx-auto">
      <Header />
      <SignUpForm />
      <SignInCallout />
    </Container>
  )
}


function Header() {
  const { t } = useTranslation()
  return (
    <div className="space-y-2 mb-4">
      <h1 className="text-2xl font-semibold">{t("Sign Up")}</h1>
      <p className="text-muted-foreground">{t("Get organized today!")}</p>
    </div>
  )
}

function SignInCallout() {
  const { t } = useTranslation()
  return (
    <div className="text-sm mt-2">
      <span>
        {t("Already have an account?")}
      </span>
      <Button className="text-blue-500" variant="link" asChild>
        <Link to="/auth/signin">
          {t("Sign In")}
        </Link>
      </Button>
    </div>
  )
}
