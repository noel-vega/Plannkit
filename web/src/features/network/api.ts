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
  }
}
