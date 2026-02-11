import z from "zod/v3";

export const TodoStatusSchema = z.literal("todo").or(z.literal("in-progress")).or(z.literal("done"))
export type TodoStatus = z.infer<typeof TodoStatusSchema>


export const TodoSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  description: z.string(),
  position: z.string(),
  status: TodoStatusSchema
})
export type Todo = z.infer<typeof TodoSchema>

export const CreateTodoParamsSchema = TodoSchema.omit({ id: true, position: true })
export type CreateTodoParams = z.infer<typeof CreateTodoParamsSchema>


export const DraggableTodoSchema = z.object({
  type: z.literal("todo"),
  todo: TodoSchema,
  index: z.number()
})

export const DroppableLaneSchema = z.object({
  type: z.literal("lane"),
  status: TodoStatusSchema
})

export const DroppableTodoSchema = z.object({
  type: z.literal("todo"),
  todo: TodoSchema,
  index: z.number(),
  position: z.enum(["before", "after"])
})

export const OverSchema = z.discriminatedUnion("type", [DroppableTodoSchema, DroppableLaneSchema])

export type MoveTodoParams = {
  id: number;
  status: TodoStatus;
  afterPosition: string;
  beforePosition: string;
  targetIndex?: number; // Optional - used for optimistic update only
}


export const BoardSchema = z.record(TodoStatusSchema, TodoSchema.array())
export type Board = z.infer<typeof BoardSchema>
