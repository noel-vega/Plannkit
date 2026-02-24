import { pkFetch } from "@/lib/plannkit-api-client"

export const users = {
  list: async () => {
    const response = await pkFetch("/users?search=Noel")
  }
}
