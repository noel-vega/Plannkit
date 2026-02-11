import z from "zod/v3"

export const MeSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string()
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
