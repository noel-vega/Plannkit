import { useHeaderStore } from "@/hooks/use-header"
import { useTranslation } from "react-i18next"
import { SidebarTrigger } from "../ui/sidebar"

export function Header() {
  const { title } = useHeaderStore()
  const { t } = useTranslation()

  return (
    <div className="h-14 border-b flex items-center px-4 gap-4">
      <SidebarTrigger>Menu</SidebarTrigger>
      <p className="font-bold text-xl">{t(title)}</p>
    </div>)
}
