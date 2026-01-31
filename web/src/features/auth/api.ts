import z from "zod/v3";

const SignUpParamsSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  password: z.string()
})

type SignUpParams = z.infer<typeof SignUpParamsSchema>

export async function signUp(params: SignUpParams) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json"
    }
  })
  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("Email already registered")
    }
    throw new Error("Failed to signup")
  }
}

const SignInParamsSchema = z.object({
  email: z.string(),
  password: z.string()
})

type SignInParams = z.infer<typeof SignInParamsSchema>

const SignInResponseSchema = z.object({
  accessToken: z.string()
})

export async function signIn(params: SignInParams) {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json"
    }
  })
  if (!response.ok) {
    throw new Error("Failed to signup")
  }

  return SignInResponseSchema.parse(await response.json())
}

export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string()
})

export async function refreshAccessToken() {
  const response = await fetch("/api/auth/refresh", {
    credentials: "include"
  })

  if (response.ok) {
    const { accessToken } = RefreshTokenResponseSchema.parse(await response.json())
    return { success: true, accessToken } as const
  }
  return { success: false } as const
}

export const MeSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string()
})

const MeResponseSchema = z.object({
  accessToken: z.string(),
  me: MeSchema
})

export async function me() {
  const response = await fetch("/api/auth/me", {
    credentials: "include"
  })

  if (response.ok) {
    const data = MeResponseSchema.parse(await response.json())
    return { success: true, data } as const
  }
  return { success: false } as const
}
