import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { useDialog } from "@/hooks"
import { SparklesIcon, PlusIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { CreateHabitDialogDrawer } from "./create-habit-form"
import { CreateRoutineDialogDrawer } from "./create-routine-form"
import { Button } from "@/components/ui/button"

export function EmptyHabits() {
  const { t } = useTranslation()
  const createRoutineDialog = useDialog()
  const createHabitDialog = useDialog()

  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SparklesIcon />
        </EmptyMedia>
        <EmptyTitle>{t("Start building your daily habits")}</EmptyTitle>
        <EmptyDescription>{t("Create a routine to group related habits, or add a standalone habit to start tracking your progress.")}</EmptyDescription>
      </EmptyHeader>
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={createRoutineDialog.handleOpenDialog}>
          <PlusIcon className="size-3.5" />
          {t("Create routine")}
        </Button>
        <Button variant="outline" size="sm" onClick={createHabitDialog.handleOpenDialog}>
          <PlusIcon className="size-3.5" />
          {t("Create habit")}
        </Button>
      </div>
      <CreateRoutineDialogDrawer {...createRoutineDialog} />
      <CreateHabitDialogDrawer {...createHabitDialog} />
    </Empty>
  )
}
