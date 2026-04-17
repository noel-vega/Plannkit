import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { MinusIcon, PlusIcon, SparklesIcon } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { useSupplies } from "../store"
import type { CatalogItem } from "../types"

type Props = {
  onSelect: (params: { catalogItem: CatalogItem; quantity: number }) => void
  submitLabel?: string
}

export function ItemEntry({ onSelect, submitLabel }: Props) {
  const { t } = useTranslation()
  const catalog = useSupplies((s) => s.catalog)
  const addCatalogItem = useSupplies((s) => s.addCatalogItem)
  const [search, setSearch] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const visibleCatalog = useMemo(
    () =>
      catalog
        .filter((c) => !c.deletedAt)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [catalog]
  )

  const exactMatch = useMemo(
    () =>
      visibleCatalog.find(
        (c) => c.name.toLowerCase().trim() === search.toLowerCase().trim()
      ),
    [visibleCatalog, search]
  )

  const selected = selectedId ? visibleCatalog.find((c) => c.id === selectedId) : null

  const handleSubmit = () => {
    if (selected) {
      onSelect({ catalogItem: selected, quantity })
      reset()
      return
    }
    const trimmed = search.trim()
    if (!trimmed) return
    const item = exactMatch ?? addCatalogItem(trimmed)
    onSelect({ catalogItem: item, quantity })
    reset()
  }

  const reset = () => {
    setSearch("")
    setQuantity(1)
    setSelectedId(null)
  }

  const canSubmit = !!selected || search.trim().length > 0

  return (
    <div className="flex flex-col gap-3">
      <Command shouldFilter className="border rounded-md">
        <CommandInput
          placeholder={t("Search or add an item...")}
          value={search}
          onValueChange={(v) => {
            setSearch(v)
            setSelectedId(null)
          }}
        />
        <CommandList>
          <CommandEmpty>
            {search.trim() ? (
              <span className="text-sm text-muted-foreground">
                {t('Press add to create "{{name}}"', { name: search.trim() })}
              </span>
            ) : (
              t("Type to search the catalog")
            )}
          </CommandEmpty>
          {visibleCatalog.length > 0 && (
            <CommandGroup heading={t("Catalog")}>
              {visibleCatalog.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.name}
                  onSelect={() => {
                    setSelectedId(c.id)
                    setSearch(c.name)
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="flex-1 truncate">{c.name}</span>
                  {!c.description && !c.price && (
                    <SparklesIcon
                      className="size-3 text-muted-foreground"
                      aria-label={t("Incomplete catalog entry")}
                    />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <MinusIcon size={14} />
          </Button>
          <span className="w-10 text-center text-sm tabular-nums">{quantity}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setQuantity((q) => q + 1)}
          >
            <PlusIcon size={14} />
          </Button>
        </div>

        <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
          <PlusIcon />
          {submitLabel ?? t("Add")}
        </Button>
      </div>
    </div>
  )
}
