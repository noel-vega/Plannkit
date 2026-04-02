import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useTranslation } from "react-i18next"

export function LanguageSelect() {
  const { t, i18n } = useTranslation()
  return (
    <Select value={i18n.language} onValueChange={lang => i18n.changeLanguage(lang)}>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder={t("Select a language")} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="en">{t("English")}</SelectItem>
          <SelectItem value="es">{t("Español")}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

