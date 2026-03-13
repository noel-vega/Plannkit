import { api } from "@/lib/plannkit-api-client";
import { AuthenticationResponseSchema, MeSchema, type SignInParams, type SignUpParams } from "./types";
import z from "zod/v3";

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
  refreshAccessToken: async () => {
    const response = await fetch(`${api.baseURL}/auth/refresh`, {
      credentials: "include"
    })
    if (!response.ok) {
      return { success: false, accessToken: "" }
    }

    const { accessToken } = z.object({ accessToken: z.string() }).parse(await response.json())
    return { success: true, accessToken }

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
    return MeSchema.parse(await response.json())
  },
  signOut: async () => api.GET("/auth/signout")
}
