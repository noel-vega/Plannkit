import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  ArrowLeftIcon,
  CheckIcon,
  ListChecksIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import { useSupplies } from "../store"
import type { CatalogItem, ShoppingList, ShoppingListItem } from "../types"
import { ItemEntry } from "./item-entry"

export function ListsView() {
  const { t } = useTranslation()
  const lists = useSupplies((s) => s.lists)
  const listItems = useSupplies((s) => s.listItems)
  const defaultListId = useSupplies((s) => s.defaultListId)
  const addList = useSupplies((s) => s.addList)
  const setDefaultList = useSupplies((s) => s.setDefaultList)
  const removeList = useSupplies((s) => s.removeList)

  const [openListId, setOpenListId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")

  const counts = useMemo(() => {
    const map = new Map<string, { total: number; checked: number }>()
    for (const li of listItems) {
      const c = map.get(li.listId) ?? { total: 0, checked: 0 }
      c.total += 1
      if (li.checked) c.checked += 1
      map.set(li.listId, c)
    }
    return map
  }, [listItems])

  const handleCreate = () => {
    if (!newName.trim()) return
    const list = addList(newName)
    setNewName("")
    setCreateOpen(false)
    setOpenListId(list.id)
  }

  if (openListId) {
    const list = lists.find((l) => l.id === openListId)
    if (!list) {
      setOpenListId(null)
      return null
    }
    return <ListDetail list={list} onBack={() => setOpenListId(null)} />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto">
              <PlusIcon />
              {t("New list")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("New shopping list")}</DialogTitle>
              <DialogDescription>
                {t('Give it a name like "Weekly" or "Costco".')}
              </DialogDescription>
            </DialogHeader>
            <Input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("List name")}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate()
              }}
            />
            <DialogFooter>
              <Button onClick={handleCreate} disabled={!newName.trim()}>
                {t("Create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {lists.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListChecksIcon />
            </EmptyMedia>
            <EmptyTitle>{t("No shopping lists yet")}</EmptyTitle>
            <EmptyDescription>
              {t("Create lists for different trips or stores.")}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              {t("New list")}
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-3 gap-3">
          {lists.map((list) => {
            const count = counts.get(list.id) ?? { total: 0, checked: 0 }
            const isDefault = list.id === defaultListId
            return (
              <Card
                key={list.id}
                className="cursor-pointer hover:bg-accent/40"
                onClick={() => setOpenListId(list.id)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{list.name}</h3>
                      {isDefault && (
                        <StarIcon className="size-3.5 fill-amber-400 text-amber-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("{{checked}} of {{total}} checked", {
                        checked: count.checked,
                        total: count.total,
                      })}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="size-7">
                        <MoreHorizontalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem
                        onClick={() => setDefaultList(isDefault ? null : list.id)}
                      >
                        <StarIcon className="size-4" />
                        {isDefault ? t("Unset default") : t("Set as default")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => removeList(list.id)}
                      >
                        <Trash2Icon className="size-4" />
                        {t("Delete list")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ListDetail({ list, onBack }: { list: ShoppingList; onBack: () => void }) {
  const { t } = useTranslation()
  const allItems = useSupplies((s) => s.listItems)
  const catalog = useSupplies((s) => s.catalog)
  const addListItem = useSupplies((s) => s.addListItem)
  const finishShopping = useSupplies((s) => s.finishShopping)
  const clearList = useSupplies((s) => s.clearList)

  const [addOpen, setAddOpen] = useState(false)

  const items = useMemo(
    () => allItems.filter((li) => li.listId === list.id),
    [allItems, list.id]
  )
  const unchecked = items.filter((i) => !i.checked)
  const checked = items.filter((i) => i.checked)

  const catalogById = useMemo(() => {
    const map = new Map<string, CatalogItem>()
    for (const c of catalog) map.set(c.id, c)
    return map
  }, [catalog])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h2 className="text-lg font-semibold flex-1 truncate">{list.name}</h2>
        <Badge variant="secondary">
          {t("{{checked}} / {{total}}", {
            checked: checked.length,
            total: items.length,
          })}
        </Badge>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon />
              {t("Add item")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Add to {{name}}", { name: list.name })}</DialogTitle>
              <DialogDescription>
                {t("Pick from your catalog or type a new item.")}
              </DialogDescription>
            </DialogHeader>
            <ItemEntry
              onSelect={({ catalogItem, quantity }) => {
                addListItem({ listId: list.id, catalogId: catalogItem.id, quantity })
                setAddOpen(false)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListChecksIcon />
            </EmptyMedia>
            <EmptyTitle>{t("This list is empty")}</EmptyTitle>
            <EmptyDescription>
              {t("Add what you need to pick up.")}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          <ListItemSection
            items={unchecked}
            catalogById={catalogById}
            heading={t("To buy")}
          />
          {checked.length > 0 && (
            <ListItemSection
              items={checked}
              catalogById={catalogById}
              heading={t("In cart")}
            />
          )}
        </div>
      )}

      {items.length > 0 && (
        <div className="flex gap-2 mt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex-1" size="lg">
                {t("Clear list")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("Clear all items?")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("This removes every item from {{name}}.", { name: list.name })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={() => clearList(list.id)}>
                  {t("Clear")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="flex-1" size="lg" disabled={checked.length === 0}>
                {t("Finish shopping")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("Add checked items to inventory?")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t(
                    "{{count}} item(s) will be added to inventory and removed from this list.",
                    { count: checked.length }
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={() => finishShopping(list.id)}>
                  {t("Confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  )
}

function ListItemSection(props: {
  items: ShoppingListItem[]
  catalogById: Map<string, CatalogItem>
  heading: string
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        {props.heading} ({props.items.length})
      </h3>
      <ul className="divide-y border rounded-lg overflow-hidden">
        {props.items.map((li) => {
          const c = props.catalogById.get(li.catalogId)
          if (!c) return null
          return (
            <li key={li.id} className="hover:bg-accent/30">
              <ListItemRow item={li} catalog={c} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ListItemRow({ item, catalog }: { item: ShoppingListItem; catalog: CatalogItem }) {
  const { t } = useTranslation()
  const toggleListItemChecked = useSupplies((s) => s.toggleListItemChecked)
  const updateListItemQuantity = useSupplies((s) => s.updateListItemQuantity)
  const removeListItem = useSupplies((s) => s.removeListItem)

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
      onClick={() => toggleListItemChecked(item.id)}
    >
      <div
        className={cn(
          "h-6 w-6 border rounded-full flex items-center justify-center shrink-0",
          { "bg-green-100 border-green-700": item.checked }
        )}
      >
        {item.checked && <CheckIcon size={14} className="text-green-700" />}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn("truncate", { "line-through text-muted-foreground": item.checked })}
        >
          {catalog.name}
        </p>
      </div>

      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          disabled={item.quantity <= 1}
          onClick={() => updateListItemQuantity(item.id, item.quantity - 1)}
        >
          <MinusIcon size={14} />
        </Button>
        <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => updateListItemQuantity(item.id, item.quantity + 1)}
        >
          <PlusIcon size={14} />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground"
        onClick={(e) => {
          e.stopPropagation()
          removeListItem(item.id)
        }}
        aria-label={t("Remove")}
      >
        <Trash2Icon size={14} />
      </Button>
    </div>
  )
}
