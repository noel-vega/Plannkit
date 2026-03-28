
import type { PropsWithChildren } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { buttonVariants } from "@/components/ui/button"
import type { DialogProps } from "@/types"
import { useDeleteRoutineMutation } from "../hooks"
import { useTranslation } from "react-i18next"

type Props = {
  routineId: number
} & PropsWithChildren & DialogProps

export function ConfirmDeleteRoutineDialog({ routineId, children, ...dialog }: Props) {
  const { t } = useTranslation()
  const deleteRoutine = useDeleteRoutineMutation()

  const handleConfirmDelete = () => {
    deleteRoutine.mutate({ id: routineId })
  }

  const isDisabled = deleteRoutine.isPending || deleteRoutine.isSuccess

  return (
    <AlertDialog {...dialog} onOpenChange={(open) => {
      dialog.onOpenChange(open)
      if (!open) {
        deleteRoutine.reset()
      }
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Delete Routine")}</AlertDialogTitle>
          <AlertDialogDescription>{t("Are you sure you want to permanently delete this routine and its habits?")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={isDisabled} className={buttonVariants({ variant: "destructive" })} onClick={handleConfirmDelete}>
            {deleteRoutine.isPending ? <Spinner /> : t("Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
