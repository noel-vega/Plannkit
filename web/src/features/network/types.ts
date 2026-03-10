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

export const RequestStatusSchema = z.literal("pending").or(z.literal("accepted"))
export type RequestStatus = z.infer<typeof RequestStatusSchema>

export const FollowSchema = z.object({
  id: z.number(),
  followerUserId: z.number(),
  followingUserId: z.number(),
  status: RequestStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Follow = z.infer<typeof FollowSchema>

export const ConnectionSchema = z.object({
  id: z.number(),
  user1Id: z.number(),
  user2Id: z.number(),
  status: RequestStatusSchema,
  requestedByUserId: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Connection = z.infer<typeof ConnectionSchema>

export const NetworkUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  avatar: AvatarSchema,
  isPrivate: z.boolean(),
  followStatus: RequestStatusSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type NetworkUser = z.infer<typeof NetworkUserSchema>

export const UserProfileSchema = z.object({
  user: UserSchema,
  follow: FollowSchema.nullable(),
  connection: ConnectionSchema.nullable()
})
export type UserProfile = z.infer<typeof UserProfileSchema>
