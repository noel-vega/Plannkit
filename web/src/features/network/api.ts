import { api } from "@/lib/plannkit-api-client"
import { NetworkUserSchema, UserProfileSchema, type DiscoverUsersParams } from "./types"

export const network = {
  profile: async (username: string) => {
    const response = await api.GET(`/network/profile/${username}`)
    const data = await response.json()
    return UserProfileSchema.parse(data)
  },
  users: {
    list: async (params?: DiscoverUsersParams) => {
      const searchParams = new URLSearchParams()
      if (params?.search) {
        searchParams.set("search", params.search)
      }
      if (params?.filter) {
        searchParams.set("filter", params.filter)
      }
      const response = await api.GET("/network/users?" + searchParams)
      const data = await response.json()
      return NetworkUserSchema.array().parse(data)
    },
    requestFollow: async (userId: number) => {
      await api.POST(`/network/users/${userId}/follow`)
    },
    removeFollow: async (userId: number) => {
      await api.DELETE(`/network/users/${userId}/follow`)
    },
    acceptFollow: async (userId: number) => {
      await api.PATCH(`/network/users/${userId}/follow`)
    },
    requestConnection: async (userId: number) => {
      await api.POST(`/network/users/${userId}/connection`)
    },
    removeConnection: async (userId: number) => {
      await api.DELETE(`/network/users/${userId}/connection`)
    },
    acceptConnection: async (userId: number) => {
      await api.PATCH(`/network/users/${userId}/connection`)
    },
  }
}
