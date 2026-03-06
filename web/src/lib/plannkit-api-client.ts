import { useAuth } from "@/features/auth/store"

type Method = "GET" | "POST" | "PATCH" | "DELETE"

export async function pkFetch(baseURL: string, path: string, options?: RequestInit & { method: Method }, json: boolean = true) {
  const { accessToken } = useAuth.getState()
  const url = new URL(path, baseURL)
  let headers = new Headers({
    "Authorization": `Bearer ${accessToken}`,
    ...options?.headers
  })

  if (json) {
    headers.set("Content-Type", "application/json")
  }

  return await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  })
}

class Client {
  private baseURL: string
  constructor(baseURL: string) {
    this.baseURL = baseURL
  }
  GET(path: string) {
    return pkFetch(this.baseURL, path)
  }
  PATCH(path: string, data?: unknown) {
    let options = {}
    if (data instanceof FormData) {
      options = { body: data }
    } else if (data !== undefined) {
      options = { body: JSON.stringify(data) }
    }
    return pkFetch(this.baseURL, path, { ...options, method: "PATCH", })
  }
  POST(path: string, data?: unknown) {
    let options = {}
    if (data instanceof FormData) {
      options = { body: data }
    } else if (data !== undefined) {
      options = { body: JSON.stringify(data) }
    }
    return pkFetch(this.baseURL, path, { ...options, method: "POST" })
  }
  DELETE(path: string) {
    return pkFetch(this.baseURL, path, { method: "DELETE" })
  }
  PUT(path: string, data?: unknown) {
    let options = {}
    if (data instanceof FormData) {
      options = { body: data }
    } else if (data !== undefined) {
      options = { body: JSON.stringify(data) }
    }
    return pkFetch(this.baseURL, path, { ...options, method: "PATCH" })
  }
}

export const api = new Client(import.meta.env.VITE_PLANNKIT_API_URL)
