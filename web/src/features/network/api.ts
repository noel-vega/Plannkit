import { pkFetch } from "@/lib/plannkit-api-client"
import { UserSchema, type DiscoverUsersParams } from "./types"

export const network = {
  discover: async (params?: DiscoverUsersParams) => {
    const searchParams = new URLSearchParams()
    if (params?.search) {
      searchParams.set("search", params.search)
    }
    const response = await pkFetch("/users?" + searchParams)
    const data = await response.json()
    return UserSchema.array().parse(data)
  }
}
