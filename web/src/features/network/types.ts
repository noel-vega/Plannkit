import z from "zod/v3";
import { AvatarSchema } from "../auth/types";

export const DiscoverUsersParamsSchema = z.object({
  search: z.string().trim().nullable()
})

export type DiscoverUsersParams = z.infer<typeof DiscoverUsersParamsSchema>

export const UserSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  avatar: AvatarSchema
})
export type User = z.infer<typeof UserSchema>
