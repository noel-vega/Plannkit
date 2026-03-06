import { api } from "@/lib/plannkit-api-client"
import z from "zod/v3"
import { AvatarSchema } from "./types"

export const user = {
  updateAvatar: async (file: File) => {
    const formData = new FormData().append("avatar", file)
    const response = await api.PUT("/user/avatar", formData)
    return z.object({ avatar: AvatarSchema }).parse(await response.json())
  }
}
