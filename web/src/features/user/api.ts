import { api } from "@/lib/plannkit-api-client"
import z from "zod/v3"

export const user = {
  updateAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append("avatar", file)
    const response = await api.PUT("/user/avatar", formData)
    return z.object({ avatar: z.string().nullable() }).parse(await response.json())
  }
}
