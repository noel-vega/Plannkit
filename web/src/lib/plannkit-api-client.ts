import { useAuth } from "@/features/auth/store"

export async function pkFetch(path: string, options?: RequestInit, json: boolean = true) {
  const { accessToken } = useAuth.getState()
  const url = new URL(path, import.meta.env.VITE_PLANNKIT_API_URL)
  let headers = {
    "Authorization": `Bearer ${accessToken}`,
    ...options?.headers,
  }

  console.log("HEADERS", headers)
  return await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  })
}
