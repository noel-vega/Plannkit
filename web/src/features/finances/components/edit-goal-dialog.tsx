import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { DialogProps } from "@/types";

export function EditGoalDialog({ ...dialogProps }: DialogProps) {
  return (

    <Dialog {...dialogProps}>
      <DialogContent>
        Edit Goal
      </DialogContent>
    </Dialog>
  )
}
