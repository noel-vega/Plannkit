import { useDialog } from "@/hooks"
import type { RequestStatus } from "../types"
import { CheckIcon, ClockIcon, MinusIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function NetworkButton(props: {
  isRequester: boolean
  onRequest: () => void
  onRemove: () => void
  onAccept: () => void
  confirm: boolean
  confirmTitle: string
  confirmDescription: string
  status?: RequestStatus
  isPending: boolean
  labels: { request: string; accepted: string; requestPending: string, acceptPending: string }
}) {
  const dialog = useDialog()
  const { confirmTitle, confirmDescription, onRequest, onAccept, onRemove, confirm, isPending, status, labels, isRequester } = props

  const handleClick = () => {
    if (!status) {
      return onRequest()
    }

    if (!isRequester && confirm && status === "pending") {
      return dialog.handleOpenDialog()
    }
    return onRemove()
  }


  let icon = <PlusIcon />
  let label = labels.request

  if (status === "accepted") {
    icon = <CheckIcon />
    label = labels.accepted
  } else if (status === "pending") {
    icon = <ClockIcon />
    if (isRequester) {
      label = labels.requestPending
    } else {
      label = labels.acceptPending
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleClick}
        disabled={isPending}
        className="min-w-32 transition-none"
      >
        {icon} {label}
      </Button>
      <Dialog {...dialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmTitle}</DialogTitle>
            <DialogDescription>{confirmDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => {
              onRemove()
              dialog.close()
            }} variant="secondary"><MinusIcon />Decline</Button>
            <Button onClick={() => {
              onAccept()
              dialog.close()
            }}><CheckIcon />Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
