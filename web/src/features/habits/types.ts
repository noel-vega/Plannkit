import { IconNameSchema } from "@/components/ui/dynamic-icon";
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
  icon: IconNameSchema,
  name: z.string().min(1),
  description: z.string(),
  completionType: z.literal("step").or(z.literal("custom")),
  completionsPerDay: z.number().min(1)
})
export type Habit = z.infer<typeof HabitSchema>

export const HabitWithContributionsSchema = HabitSchema.merge(z.object({ contributions: ContributionSchema.array() }))
export type HabitWithContributions = z.infer<typeof HabitWithContributionsSchema>

export const CreateHabitParamsSchema = HabitSchema.omit({ id: true })
export type CreateHabitParams = z.infer<typeof CreateHabitParamsSchema>

export type CreateContributionParams = {
  habitId: number,
  date: Date,
  completions: number
}
export type UpdateContributionParams = {
  habitId: number;
  contributionId: number,
  completions: number
}

export type ByIdParams = { id: number }
