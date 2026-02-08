import { pkFetch } from "@/lib/plannkit-api-client"
import z from "zod/v3"

export const FlagsSchema = z.object({
  habits: z.boolean(),
  todos: z.boolean(),
  documents: z.boolean(),
  groceries: z.boolean(),
  email: z.boolean(),
  users: z.boolean(),
  finances: z.boolean(),
  dashboard: z.boolean()

})

export type Flags = z.infer<typeof FlagsSchema>

export async function getFlags() {
  const response = await pkFetch("/flags")
  const data = await response.json()
  return FlagsSchema.parse(data)
}
