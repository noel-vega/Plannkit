import { useNavigate } from "@tanstack/react-router"
import type { PropsWithChildren } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { buttonVariants } from "@/components/ui/button"
import type { DialogProps } from "@/types"
import { useDeleteHabit } from "../hooks"

type Props = {
  id: number
} & PropsWithChildren & DialogProps

export function DeleteHabitDialog(props: Props) {
  const navigate = useNavigate()
  const deleteHabit = useDeleteHabit()

  const handleDelete = () => {
    deleteHabit.mutate({ id: props.id }, {
      onSuccess: () => navigate({ to: "/app/habits" })
    })
  }

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Habit</AlertDialogTitle>
          <AlertDialogDescription>Are you sure you want to permanently delete this habit?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={handleDelete}>
            {deleteHabit.isPending ? <Spinner /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
