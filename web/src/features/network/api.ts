import { pkFetch } from "@/lib/plannkit-api-client"
import { NetworkUserSchema, UserProfileSchema, type DiscoverUsersParams } from "./types"

export const network = {
  profile: async (username: string) => {
    const response = await pkFetch(`/network/profile/${username}`)
    const data = await response.json()
    return UserProfileSchema.parse(data)
  },
  users: {
    list: async (params?: DiscoverUsersParams) => {
      const searchParams = new URLSearchParams()
      if (params?.search) {
        searchParams.set("search", params.search)
      }
      const response = await pkFetch("/network/users?" + searchParams)
      const data = await response.json()
      return NetworkUserSchema.array().parse(data)
    },
    follow: async (userId: number) => {
      await pkFetch(`/network/users/${userId}/follow`, { method: "POST" })
    },
    unfollow: async (userId: number) => {
      await pkFetch(`/network/users/${userId}/follow`, { method: "DELETE" })
    },
    acceptFollow: async (userId: number) => {
      await pkFetch(`/network/users/${userId}/follow`, { method: "PATCH" })
    }
  }
}
