import { create } from "zustand"
import type {
  CatalogItem,
  InventoryItem,
  ShoppingList,
  ShoppingListItem,
} from "./types"

type SuppliesState = {
  catalog: CatalogItem[]
  inventory: InventoryItem[]
  lists: ShoppingList[]
  listItems: ShoppingListItem[]
  defaultListId: string | null
}

type SuppliesActions = {
  // Catalog
  addCatalogItem: (name: string) => CatalogItem
  updateCatalogItem: (id: string, patch: Partial<Omit<CatalogItem, "id" | "createdAt">>) => void
  softDeleteCatalogItem: (id: string) => void
  restoreCatalogItem: (id: string) => void
  isCatalogItemReferenced: (id: string) => boolean

  // Inventory
  addInventoryItem: (params: { catalogId: string; quantity: number; location?: string | null }) => void
  updateInventoryQuantity: (id: string, quantity: number) => void
  updateInventoryLocation: (id: string, location: string | null) => void
  removeInventoryItem: (id: string) => void

  // Lists
  addList: (name: string) => ShoppingList
  renameList: (id: string, name: string) => void
  removeList: (id: string) => void
  setDefaultList: (id: string | null) => void

  // List items
  addListItem: (params: { listId: string; catalogId: string; quantity: number }) => void
  toggleListItemChecked: (id: string) => void
  updateListItemQuantity: (id: string, quantity: number) => void
  removeListItem: (id: string) => void
  clearList: (listId: string) => void
  finishShopping: (listId: string) => void
}

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `id_${Math.random().toString(36).slice(2)}`

export const useSupplies = create<SuppliesState & SuppliesActions>((set, get) => ({
  catalog: [],
  inventory: [],
  lists: [],
  listItems: [],
  defaultListId: null,

  // Catalog
  addCatalogItem: (name) => {
    const item: CatalogItem = {
      id: newId(),
      name: name.trim(),
      description: null,
      photo: null,
      defaultUnit: null,
      price: null,
      tags: [],
      deletedAt: null,
      createdAt: new Date(),
    }
    set((s) => ({ catalog: [item, ...s.catalog] }))
    return item
  },
  updateCatalogItem: (id, patch) => {
    set((s) => ({
      catalog: s.catalog.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }))
  },
  softDeleteCatalogItem: (id) => {
    set((s) => ({
      catalog: s.catalog.map((c) => (c.id === id ? { ...c, deletedAt: new Date() } : c)),
    }))
  },
  restoreCatalogItem: (id) => {
    set((s) => ({
      catalog: s.catalog.map((c) => (c.id === id ? { ...c, deletedAt: null } : c)),
    }))
  },
  isCatalogItemReferenced: (id) => {
    const s = get()
    return (
      s.inventory.some((i) => i.catalogId === id) ||
      s.listItems.some((li) => li.catalogId === id)
    )
  },

  // Inventory
  addInventoryItem: ({ catalogId, quantity, location = null }) => {
    set((s) => {
      const existing = s.inventory.find((i) => i.catalogId === catalogId)
      if (existing) {
        return {
          inventory: s.inventory.map((i) =>
            i.id === existing.id
              ? { ...i, quantity: i.quantity + quantity, updatedAt: new Date() }
              : i
          ),
        }
      }
      const item: InventoryItem = {
        id: newId(),
        catalogId,
        quantity,
        location,
        lowThreshold: null,
        updatedAt: new Date(),
      }
      return { inventory: [item, ...s.inventory] }
    })
  },
  updateInventoryQuantity: (id, quantity) => {
    set((s) => ({
      inventory: s.inventory.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(0, quantity), updatedAt: new Date() } : i
      ),
    }))
  },
  updateInventoryLocation: (id, location) => {
    set((s) => ({
      inventory: s.inventory.map((i) =>
        i.id === id ? { ...i, location, updatedAt: new Date() } : i
      ),
    }))
  },
  removeInventoryItem: (id) => {
    set((s) => ({ inventory: s.inventory.filter((i) => i.id !== id) }))
  },

  // Lists
  addList: (name) => {
    const list: ShoppingList = { id: newId(), name: name.trim(), createdAt: new Date() }
    set((s) => ({
      lists: [...s.lists, list],
      defaultListId: s.defaultListId ?? list.id,
    }))
    return list
  },
  renameList: (id, name) => {
    set((s) => ({
      lists: s.lists.map((l) => (l.id === id ? { ...l, name: name.trim() } : l)),
    }))
  },
  removeList: (id) => {
    set((s) => ({
      lists: s.lists.filter((l) => l.id !== id),
      listItems: s.listItems.filter((li) => li.listId !== id),
      defaultListId: s.defaultListId === id ? null : s.defaultListId,
    }))
  },
  setDefaultList: (id) => set({ defaultListId: id }),

  // List items
  addListItem: ({ listId, catalogId, quantity }) => {
    set((s) => {
      const existing = s.listItems.find(
        (li) => li.listId === listId && li.catalogId === catalogId && !li.checked
      )
      if (existing) {
        return {
          listItems: s.listItems.map((li) =>
            li.id === existing.id ? { ...li, quantity: li.quantity + quantity } : li
          ),
        }
      }
      const item: ShoppingListItem = {
        id: newId(),
        listId,
        catalogId,
        quantity,
        checked: false,
      }
      return { listItems: [item, ...s.listItems] }
    })
  },
  toggleListItemChecked: (id) => {
    set((s) => ({
      listItems: s.listItems.map((li) =>
        li.id === id ? { ...li, checked: !li.checked } : li
      ),
    }))
  },
  updateListItemQuantity: (id, quantity) => {
    set((s) => ({
      listItems: s.listItems.map((li) =>
        li.id === id ? { ...li, quantity: Math.max(1, quantity) } : li
      ),
    }))
  },
  removeListItem: (id) => {
    set((s) => ({ listItems: s.listItems.filter((li) => li.id !== id) }))
  },
  clearList: (listId) => {
    set((s) => ({ listItems: s.listItems.filter((li) => li.listId !== listId) }))
  },
  finishShopping: (listId) => {
    const { listItems, addInventoryItem } = get()
    const checked = listItems.filter((li) => li.listId === listId && li.checked)
    checked.forEach((li) => addInventoryItem({ catalogId: li.catalogId, quantity: li.quantity }))
    set((s) => ({
      listItems: s.listItems.filter((li) => !(li.listId === listId && li.checked)),
    }))
  },
}))
