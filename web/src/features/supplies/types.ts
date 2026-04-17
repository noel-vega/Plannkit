import z from "zod/v3"

export const CatalogItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().nullable(),
  photo: z.string().nullable(),
  defaultUnit: z.string().nullable(),
  price: z.number().nullable(),
  tags: z.array(z.string()),
  deletedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
})
export type CatalogItem = z.infer<typeof CatalogItemSchema>

export const InventoryItemSchema = z.object({
  id: z.string(),
  catalogId: z.string(),
  quantity: z.number().min(0),
  location: z.string().nullable(),
  lowThreshold: z.number().nullable(),
  updatedAt: z.coerce.date(),
})
export type InventoryItem = z.infer<typeof InventoryItemSchema>

export const ShoppingListSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  createdAt: z.coerce.date(),
})
export type ShoppingList = z.infer<typeof ShoppingListSchema>

export const ShoppingListItemSchema = z.object({
  id: z.string(),
  listId: z.string(),
  catalogId: z.string(),
  quantity: z.number().min(1),
  checked: z.boolean(),
})
export type ShoppingListItem = z.infer<typeof ShoppingListItemSchema>

export const SUPPLIES_LOCATIONS = [
  "Pantry",
  "Fridge",
  "Freezer",
  "Bathroom",
  "Cleaning",
  "Garage",
  "Other",
] as const
export type SuppliesLocation = (typeof SUPPLIES_LOCATIONS)[number]
