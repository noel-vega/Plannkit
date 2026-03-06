import { api } from "@/lib/plannkit-api-client";
import { AuthenticationResponseSchema, type SignInParams, type SignUpParams } from "./types";

export const auth = {
  signUp: async (params: SignUpParams) => {
    const response = await api.POST("/auth/signup", params)

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
    const response = await api.POST("/auth/signin", params)
    if (response.status === 401) {
      throw new Error("Invalid credentials")
    }
    if (!response.ok) {
      throw new Error("Failed to signin")
    }
    return AuthenticationResponseSchema.parse(await response.json())
  },
  getMe: async () => {
    const response = await api.GET("/auth/me")

    if (!response.ok) return { success: false } as const

    const data = AuthenticationResponseSchema.parse(await response.json())
    return { success: true, data } as const
  },
  signOut: async () => api.GET("/auth/signout")
}
