import { useAuth } from "@/features/auth/store"

export async function pkFetch(path: string, options?: RequestInit) {
  const { accessToken } = useAuth.getState()
  const url = new URL(path, import.meta.env.VITE_PLANNKIT_API_URL)
  return await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...options?.headers,
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
  })
}
