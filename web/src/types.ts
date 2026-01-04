import z from "zod/v3";

export const ContributionSchema = z.object({
  id: z.number(),
  habitId: z.number(),
  date: z.coerce.date(),
})
export type Contribution = z.infer<typeof ContributionSchema>

export const HabitSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  description: z.string(),
  completionType: z.literal("step").or(z.literal("custom")),
  contributions: ContributionSchema.array(),
})
export type Habit = z.infer<typeof HabitSchema>

export const CreateHabitSchema = HabitSchema.omit({ id: true, contributions: true })
export type CreateHabit = z.infer<typeof CreateHabitSchema>

