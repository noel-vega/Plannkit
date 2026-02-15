import { pkFetch } from "@/lib/plannkit-api-client"
import z from "zod/v3"

export const FinanceSpaceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export type FinanceSpace = z.infer<typeof FinanceSpaceSchema>

export const finances = {
  listSpaces: async () => {
    const response = await pkFetch("/finances/spaces")
    const data = await response.json()
    return FinanceSpaceSchema.array().parse(data)
  }
}
