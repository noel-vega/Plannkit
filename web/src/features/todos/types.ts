import z from "zod/v3";

export const TodoSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  status: z.literal("todo").or(z.literal("in-progress")).or(z.literal("done"))
})

export type Todo = z.infer<typeof TodoSchema>
