import { pkFetch } from "@/lib/plannkit-api-client"
import { UserSchema, type DiscoverUsersParams } from "./types"

export const network = {
  profile: async (username: string) => {
    const response = await pkFetch(`/network/profile/${username}`)
    const data = await response.json()
    return UserSchema.parse(data)
  },
  discover: async (params?: DiscoverUsersParams) => {
    const searchParams = new URLSearchParams()
    if (params?.search) {
      searchParams.set("search", params.search)
    }
    const response = await pkFetch("/network/discover?" + searchParams)
    const data = await response.json()
    return UserSchema.array().parse(data)
  },
  follow: async (userId: number) => {
    await pkFetch(`/network/follow/${userId}`, { method: "POST" })
  },
  unfollow: async (userId: number) => {
    await pkFetch(`/network/follow/${userId}`, { method: "DELETE" })
  },
  acceptFollow: async (userId: number) => {
    await pkFetch(`/network/follow/${userId}`, { method: "PATCH" })
  }
}
