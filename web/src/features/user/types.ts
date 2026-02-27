import z from "zod/v3"

export const AvatarSchema = z.string().nullable().transform(filename => {
  return filename ? `${import.meta.env.VITE_PLANNKIT_API_URL}/public/avatars/${filename}` : null
})
