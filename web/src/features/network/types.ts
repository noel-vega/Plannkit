import z from "zod/v3";
import { AvatarSchema } from "../user/types";

export const DiscoverUsersParamsSchema = z.object({
  search: z.string().trim().nullable(),
  filter: z.literal("following").or(z.literal("followers")).or(z.literal("all")).optional()
})

export type DiscoverUsersParams = z.infer<typeof DiscoverUsersParamsSchema>

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  avatar: AvatarSchema,
  isPrivate: z.boolean()
})
export type User = z.infer<typeof UserSchema>
const FollowStatusSchema = z.literal("pending").or(z.literal("accepted")).nullable()

export const NetworkUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  avatar: AvatarSchema,
  isPrivate: z.boolean(),
  followStatus: FollowStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type NetworkUser = z.infer<typeof NetworkUserSchema>

export const UserProfileSchema = z.object({
  user: UserSchema,
  isFollowing: z.boolean(),
  followStatus: z.literal("pending").or(z.literal("accepted")).nullable()
})
export type UserProfile = z.infer<typeof UserProfileSchema>
