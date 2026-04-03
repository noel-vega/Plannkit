
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { buttonVariants } from "@/components/ui/button"
import type { DialogProps } from "@/types"
import type { Goal } from "../types"
import { useDeleteGoalMutation } from "../hooks"
import { useTranslation } from "react-i18next"

type Props = {
  goal: Goal
} & DialogProps

export function ConfirmDeleteGoalDialog({ goal, ...dialog }: Props) {
  const { t } = useTranslation()
  const deleteGoal = useDeleteGoalMutation()

  const handleConfirmDelete = () => {
    deleteGoal.mutate({ goalId: goal.id, spaceId: goal.spaceId })
  }

  const isDisabled = deleteGoal.isPending || deleteGoal.isSuccess

  return (
    <AlertDialog {...dialog} onOpenChange={(open) => {
      dialog.onOpenChange(open)
      if (!open) {
        deleteGoal.reset()
      }
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Delete Goal")}</AlertDialogTitle>
          <AlertDialogDescription>{t("Are you sure you want to permanently delete this goal?")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={isDisabled} className={buttonVariants({ variant: "destructive" })} onClick={handleConfirmDelete}>
            {deleteGoal.isPending ? <Spinner /> : t("Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
