import { Page } from '@/components/layout/page'
import { PageHeader } from '@/components/layout/page-header'
import { Field, FieldLabel } from '@/components/ui/field'
import { LanguageSelect } from '@/features/settings/components/language-picker'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_app/settings/')({
  component: RouteComponent,
})


function RouteComponent() {
  const { t } = useTranslation()
  return (
    <Page>
      <PageHeader title="Settings" />
      <Field>
        <FieldLabel>{t("Language")}</FieldLabel>
        <LanguageSelect />
      </Field>
    </Page>
  )
}
