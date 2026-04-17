import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  BookTextIcon,
  ImageIcon,
  SearchIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useSupplies } from "../store"
import type { CatalogItem } from "../types"

export function CatalogView() {
  const { t } = useTranslation()
  const catalog = useSupplies((s) => s.catalog)
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<CatalogItem | null>(null)

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return catalog
      .filter((c) => !c.deletedAt)
      .filter((c) => {
        if (!term) return true
        return (
          c.name.toLowerCase().includes(term) ||
          c.tags.some((tag) => tag.toLowerCase().includes(term))
        )
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [catalog, search])

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <SearchIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("Search catalog or tags")}
          className="pl-9"
        />
      </div>

      {catalog.filter((c) => !c.deletedAt).length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookTextIcon />
            </EmptyMedia>
            <EmptyTitle>{t("Catalog is empty")}</EmptyTitle>
            <EmptyDescription>
              {t("Items appear here as you add them to inventory or shopping lists.")}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : visible.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          {t("No matches.")}
        </p>
      ) : (
        <div className="grid grid-cols-1 @md:grid-cols-2 @3xl:grid-cols-3 gap-3">
          {visible.map((c) => (
            <Card
              key={c.id}
              className="cursor-pointer hover:bg-accent/40"
              onClick={() => setEditing(c)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="size-12 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {c.photo ? (
                    <img src={c.photo} alt="" className="size-full object-cover" />
                  ) : (
                    <ImageIcon className="size-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-medium truncate">{c.name}</h3>
                    {!c.description && !c.price && !c.photo && (
                      <SparklesIcon
                        className="size-3 text-muted-foreground shrink-0"
                        aria-label={t("Incomplete")}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {c.price !== null && (
                      <span className="text-sm text-muted-foreground tabular-nums">
                        ${c.price.toFixed(2)}
                      </span>
                    )}
                    {c.tags.length > 0 && (
                      <div className="flex gap-1 overflow-hidden">
                        {c.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <CatalogEditDialog
          item={editing}
          open
          onOpenChange={(o) => !o && setEditing(null)}
        />
      )}
    </div>
  )
}

function CatalogEditDialog(props: {
  item: CatalogItem
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const { item } = props
  const updateCatalogItem = useSupplies((s) => s.updateCatalogItem)
  const softDeleteCatalogItem = useSupplies((s) => s.softDeleteCatalogItem)
  const isReferenced = useSupplies((s) => s.isCatalogItemReferenced)(item.id)

  const [name, setName] = useState(item.name)
  const [description, setDescription] = useState(item.description ?? "")
  const [photo, setPhoto] = useState(item.photo ?? "")
  const [defaultUnit, setDefaultUnit] = useState(item.defaultUnit ?? "")
  const [priceText, setPriceText] = useState(
    item.price !== null ? String(item.price) : ""
  )
  const [tags, setTags] = useState<string[]>(item.tags)
  const [tagDraft, setTagDraft] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = () => {
    const priceNumber = priceText.trim() === "" ? null : Number(priceText)
    updateCatalogItem(item.id, {
      name: name.trim() || item.name,
      description: description.trim() || null,
      photo: photo.trim() || null,
      defaultUnit: defaultUnit.trim() || null,
      price: Number.isFinite(priceNumber) ? priceNumber : null,
      tags,
    })
    props.onOpenChange(false)
  }

  const addTag = () => {
    const t = tagDraft.trim().toLowerCase()
    if (!t) return
    if (tags.includes(t)) {
      setTagDraft("")
      return
    }
    setTags((prev) => [...prev, t])
    setTagDraft("")
  }

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t))

  return (
    <>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Edit catalog item")}</DialogTitle>
            <DialogDescription>
              {t("Add details to enrich autocomplete and inventory.")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cat-name">{t("Name")}</Label>
              <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cat-photo">{t("Photo URL")}</Label>
              <Input
                id="cat-photo"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-price">{t("Price")}</Label>
                <Input
                  id="cat-price"
                  inputMode="decimal"
                  value={priceText}
                  onChange={(e) => setPriceText(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-unit">{t("Unit")}</Label>
                <Input
                  id="cat-unit"
                  value={defaultUnit}
                  onChange={(e) => setDefaultUnit(e.target.value)}
                  placeholder="oz, pack, bottle"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cat-desc">{t("Description")}</Label>
              <Textarea
                id="cat-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t("Tags")}</Label>
              <div className="flex gap-2">
                <Input
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  placeholder={t("Add tag")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  {t("Add")}
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="opacity-60 hover:opacity-100"
                      >
                        <XIcon className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2Icon />
              {t("Delete")}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => props.onOpenChange(false)}>
                {t("Cancel")}
              </Button>
              <Button onClick={handleSave}>{t("Save")}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isReferenced ? t("Item is in use") : t("Delete this item?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isReferenced
                ? t(
                    "This item is referenced by inventory or a shopping list. Remove it from those first to delete the catalog entry."
                  )
                : t("This will remove the item from your catalog.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            {!isReferenced && (
              <AlertDialogAction
                onClick={() => {
                  softDeleteCatalogItem(item.id)
                  setConfirmDelete(false)
                  props.onOpenChange(false)
                }}
              >
                {t("Delete")}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
