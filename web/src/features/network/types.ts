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
const RequestStatusSchema = z.literal("pending").or(z.literal("accepted"))
// type Connection struct {
// 	ID        int       `json:"id" db:"id"`
// 	User1ID   int       `json:"user1Id" db:"user_1_id"`
// 	User2ID   int       `json:"user2Id" db:"user_2_id"`
// 	Status    string    `json:"status" db:"status"`
// 	CreatedAt time.Time `json:"createdAt" db:"created_at"`
// 	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
// }
//
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
  followerUserId: z.number(),
  followingUserId: z.number(),
  status: RequestStatusSchema,
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
  followStatus: RequestStatusSchema,
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
