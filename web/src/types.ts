import z from "zod/v3";

export const ContributionSchema = z.object({
  id: z.number(),
  habitId: z.number(),
  completions: z.number().min(0),
  date: z.coerce.date(),
})
export type Contribution = z.infer<typeof ContributionSchema>

export const HabitSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  description: z.string(),
  completionType: z.literal("step").or(z.literal("custom")),
  completionsPerDay: z.number().min(1)
})
export type Habit = z.infer<typeof HabitSchema>

export const HabitWithContributionsSchema = HabitSchema.merge(z.object({ contributions: ContributionSchema.array() }))
export type HabitWithContributions = z.infer<typeof HabitWithContributionsSchema>

export const CreateHabitSchema = HabitSchema.omit({ id: true })
export type CreateHabit = z.infer<typeof CreateHabitSchema>

