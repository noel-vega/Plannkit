import { pkFetch } from "@/lib/plannkit-api-client"
import z from "zod/v3"
import { AvatarSchema } from "./types"

export const user = {
  updateAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append("avatar", file)
    const response = await pkFetch("/user/avatar", {
      method: "PUT",
      body: formData
    }, false)

    return z.object({ avatar: AvatarSchema }).parse(await response.json())
  }
}
