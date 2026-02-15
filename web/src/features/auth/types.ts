import z from "zod/v3"


export const AvatarSchema = z.string().nullable().transform(filename => {
  return filename ? `${import.meta.env.VITE_PLANNKIT_API_URL}/public/avatars/${filename}` : null
})

export const MeSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  avatar: AvatarSchema
})

export type Me = z.infer<typeof MeSchema>

export const SignUpParamsSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  password: z.string()
})

export type SignUpParams = z.infer<typeof SignUpParamsSchema>

export type SignInParams = z.infer<typeof SignInParamsSchema>


export const SignInParamsSchema = z.object({
  email: z.string(),
  password: z.string()
})

export const AuthenticationResponseSchema = z.object({
  accessToken: z.string(),
  me: MeSchema
})
export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string()
})

export const SignUpDataSchema = z.object({
  firstName: z.string().min(1, { message: "Required" }),
  lastName: z.string().min(1, { message: "Required" }),
  email: z.string().min(1, { message: "Required" }),
  password: z.string().min(6, { message: "Too short, 6 characters required" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type SignUpFormData = z.infer<typeof SignUpDataSchema>
