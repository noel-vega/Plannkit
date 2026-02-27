import z from "zod/v3";
import { AvatarSchema } from "../user/types";

export const DiscoverUsersParamsSchema = z.object({
  search: z.string().trim().nullable()
})

export type DiscoverUsersParams = z.infer<typeof DiscoverUsersParamsSchema>

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  avatar: AvatarSchema
})
export type User = z.infer<typeof UserSchema>
