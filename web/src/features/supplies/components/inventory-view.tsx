import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  BoxesIcon,
  MapPinIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSupplies } from "../store"
import { SUPPLIES_LOCATIONS } from "../types"
import type { CatalogItem, InventoryItem } from "../types"
import { ItemEntry } from "./item-entry"

const ALL_LOCATIONS = "__all__"
const NO_LOCATION = "__none__"

export function InventoryView() {
  const { t } = useTranslation()
  const inventory = useSupplies((s) => s.inventory)
  const catalog = useSupplies((s) => s.catalog)
  const addInventoryItem = useSupplies((s) => s.addInventoryItem)
  const lists = useSupplies((s) => s.lists)
  const defaultListId = useSupplies((s) => s.defaultListId)
  const addListItem = useSupplies((s) => s.addListItem)
  const [filter, setFilter] = useState<string>(ALL_LOCATIONS)
  const [addOpen, setAddOpen] = useState(false)

  const catalogById = useMemo(() => {
    const map = new Map<string, CatalogItem>()
    for (const c of catalog) map.set(c.id, c)
    return map
  }, [catalog])

  const filtered = useMemo(() => {
    if (filter === ALL_LOCATIONS) return inventory
    if (filter === NO_LOCATION) return inventory.filter((i) => !i.location)
    return inventory.filter((i) => i.location === filter)
  }, [inventory, filter])

  const handleAddToList = (catalogId: string) => {
    const listId = defaultListId ?? lists[0]?.id
    if (!listId) return
    addListItem({ listId, catalogId, quantity: 1 })
  }

  const canAddToList = lists.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("All locations")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_LOCATIONS}>{t("All locations")}</SelectItem>
            <SelectItem value={NO_LOCATION}>{t("No location")}</SelectItem>
            {SUPPLIES_LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {t(loc)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto">
              <PlusIcon />
              {t("Add to inventory")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Add to inventory")}</DialogTitle>
              <DialogDescription>
                {t("Pick from your catalog or type a new item.")}
              </DialogDescription>
            </DialogHeader>
            <ItemEntry
              submitLabel={t("Add")}
              onSelect={({ catalogItem, quantity }) => {
                addInventoryItem({ catalogId: catalogItem.id, quantity })
                setAddOpen(false)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BoxesIcon />
            </EmptyMedia>
            <EmptyTitle>{t("Nothing on hand")}</EmptyTitle>
            <EmptyDescription>
              {t("Add items as you stock up to track what you have.")}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setAddOpen(true)}>
              <PlusIcon />
              {t("Add to inventory")}
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4 gap-3">
          {filtered.map((item) => {
            const c = catalogById.get(item.catalogId)
            if (!c) return null
            return (
              <InventoryCard
                key={item.id}
                item={item}
                catalog={c}
                canAddToList={canAddToList}
                onAddToList={() => handleAddToList(c.id)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function InventoryCard(props: {
  item: InventoryItem
  catalog: CatalogItem
  canAddToList: boolean
  onAddToList: () => void
}) {
  const { t } = useTranslation()
  const { item, catalog } = props
  const updateInventoryQuantity = useSupplies((s) => s.updateInventoryQuantity)
  const updateInventoryLocation = useSupplies((s) => s.updateInventoryLocation)
  const removeInventoryItem = useSupplies((s) => s.removeInventoryItem)
  const isLow =
    item.lowThreshold !== null && item.quantity <= item.lowThreshold

  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{catalog.name}</h3>
            <div className="flex flex-wrap items-center gap-1 mt-1">
              {item.location && (
                <Badge variant="secondary" className="gap-1">
                  <MapPinIcon className="size-3" />
                  {item.location}
                </Badge>
              )}
              {isLow && <Badge variant="destructive">{t("Low")}</Badge>}
              {catalog.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <MoreHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={!props.canAddToList}
                onClick={props.onAddToList}
              >
                {t("Add to shopping list")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <LocationSubmenu
                value={item.location}
                onChange={(loc) => updateInventoryLocation(item.id, loc)}
              />
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => removeInventoryItem(item.id)}
              >
                <Trash2Icon className="size-4" />
                {t("Remove")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={item.quantity <= 0}
              onClick={() => updateInventoryQuantity(item.id, item.quantity - 1)}
            >
              <MinusIcon size={14} />
            </Button>
            <span className="w-8 text-center text-sm tabular-nums">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateInventoryQuantity(item.id, item.quantity + 1)}
            >
              <PlusIcon size={14} />
            </Button>
          </div>
          {catalog.defaultUnit && (
            <span className="text-xs text-muted-foreground">{catalog.defaultUnit}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function LocationSubmenu(props: {
  value: string | null
  onChange: (loc: string | null) => void
}) {
  const { t } = useTranslation()
  return (
    <>
      <DropdownMenuItem
        onClick={() => props.onChange(null)}
        className="text-muted-foreground"
      >
        {t("Clear location")}
      </DropdownMenuItem>
      {SUPPLIES_LOCATIONS.map((loc) => (
        <DropdownMenuItem
          key={loc}
          onClick={() => props.onChange(loc)}
          className={props.value === loc ? "font-medium" : ""}
        >
          <MapPinIcon className="size-4" />
          {t(loc)}
        </DropdownMenuItem>
      ))}
    </>
  )
}
