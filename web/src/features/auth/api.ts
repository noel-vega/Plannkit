import { pkFetch } from "@/lib/plannkit-api-client";
import { AuthenticationResponseSchema, type SignInParams, type SignUpParams } from "./types";

export const auth = {
  signUp: async (params: SignUpParams) => {
    const response = await pkFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(params),
    })

    if (response.ok) {
      const data = await response.json()
      return AuthenticationResponseSchema.parse(data)
    }
    if (response.status === 409) {
      throw new Error("Email already registered")
    }
    throw new Error("Failed to signup")
  },
  signIn: async (params: SignInParams) => {
    const response = await pkFetch("/auth/signin", {
      method: "POST",
      body: JSON.stringify(params),
    })
    if (!response.ok) {
      throw new Error("Failed to signin")
    }
    return AuthenticationResponseSchema.parse(await response.json())
  },
  getMe: async () => {
    const response = await pkFetch("/auth/me")

    if (!response.ok) return { success: false } as const

    const data = AuthenticationResponseSchema.parse(await response.json())
    return { success: true, data } as const
  },
  signOut: async () => pkFetch("/auth/signout")
}
