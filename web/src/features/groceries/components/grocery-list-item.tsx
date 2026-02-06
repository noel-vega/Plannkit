import { cn } from "@/lib/utils"
import type { GroceryListItem } from "../types"
import { CheckIcon, MinusIcon, MoreVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react"
import type { MouseEvent } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Props = {
  onClick: (e: MouseEvent) => void
  onDelete: (e: MouseEvent) => void
  onQuantityChange: (itemId: number, quantity: number) => void
  item: GroceryListItem
}

export function GroceryListitem({ item, ...props }: Props) {
  const { t } = useTranslation()
  return (
    <div
      onClick={props.onClick}
      className={cn('hover:cursor-pointer py-1.5 px-0', { "": item.inCart })}>
      <div className="px-3">
        <div className="flex items-center gap-4 py-2">
          <div className={cn("h-6 w-6 border rounded-full flex items-center justify-center", {
            "bg-green-100 border-green-900": item.inCart
          })}>
            <CheckIcon size={14} className={cn("hidden text-green-900", {
              "block": item.inCart
            })} />
          </div>
          <p className="flex-1">{item.name}</p>
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              disabled={item.quantity <= 1}
              onClick={() => props.onQuantityChange(item.id, item.quantity - 1)}
            >
              <MinusIcon size={14} />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => props.onQuantityChange(item.id, item.quantity + 1)}
            >
              <PlusIcon size={14} />
            </Button>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild className="flex gap-2 stroke-red-500  hover:text-red-500 hover:bg-red-100 hover:border-red-500 hidden" onClick={e => e.stopPropagation()} >
              <Button variant="outline" size="icon">
                <Trash2Icon />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("Are you want to delete this item?")}</AlertDialogTitle>
                <AlertDialogDescription>{t("This will delete this item from your list.")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={props.onDelete}>{t("Proceed")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      </div>
    </div>
  )
}
