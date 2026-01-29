import { Page } from '@/components/layout/page'
import { Field, FieldLabel } from '@/components/ui/field'
import { LanguageSelect } from '@/features/user/components/language-picker'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/app/user/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  return (
    <Page title="Settings" >
      <Field>
        <FieldLabel>{t("Language")}</FieldLabel>
        <LanguageSelect />
      </Field>
    </Page>
  )

}
