import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import i18n from "@/i18n"

export function LanguageSelect() {
  return (
    <Select onValueChange={lang => i18n.changeLanguage(lang)}>
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="es">Espanol</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

