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
