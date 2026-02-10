import { pkFetch } from "@/lib/plannkit-api-client";
import z from "zod/v3";


export const MeSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string()
})

export type Me = z.infer<typeof MeSchema>

const SignUpParamsSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  password: z.string()
})

type SignUpParams = z.infer<typeof SignUpParamsSchema>

export async function signUp(params: SignUpParams) {
  const response = await pkFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify(params),
  })
  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("Email already registered")
    }
    throw new Error("Failed to signup")
  }

  const data = await response.json()

  return AuthenticationResponseSchema.parse(data)
}

const SignInParamsSchema = z.object({
  email: z.string(),
  password: z.string()
})

type SignInParams = z.infer<typeof SignInParamsSchema>

const AuthenticationResponseSchema = z.object({
  accessToken: z.string(),
  me: MeSchema
})

export async function signIn(params: SignInParams) {
  const response = await pkFetch("/auth/signin", {
    method: "POST",
    body: JSON.stringify(params),
  })
  if (!response.ok) {
    throw new Error("Failed to signin")
  }

  return AuthenticationResponseSchema.parse(await response.json())
}

export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string()
})

export async function refreshAccessToken() {
  const response = await fetch("/auth/refresh", {
    credentials: "include"
  })

  if (response.ok) {
    const { accessToken } = RefreshTokenResponseSchema.parse(await response.json())
    return { success: true, accessToken } as const
  }
  return { success: false } as const
}

export async function me() {
  const response = await pkFetch("/auth/me")

  if (response.ok) {
    const data = AuthenticationResponseSchema.parse(await response.json())
    return { success: true, data } as const
  }
  return { success: false } as const
}

export async function signOut() {
  await pkFetch("/auth/signout")
}
