import z from "zod/v3";

export const TodoStatusSchema = z.literal("todo").or(z.literal("in-progress")).or(z.literal("done"))
export type TodoStatus = z.infer<typeof TodoStatusSchema>


export const TodoSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  description: z.string(),
  status: TodoStatusSchema
})
export type Todo = z.infer<typeof TodoSchema>

export const CreateTodoSchema = TodoSchema.omit({ id: true })
export type CreateTodo = z.infer<typeof CreateTodoSchema>

