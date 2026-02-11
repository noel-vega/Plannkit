import { useMutation } from "@tanstack/react-query"
import { auth } from "./api"

export function useSignUp() {
  return useMutation({
    mutationFn: auth.signUp,
  })
}

export function useSignIn() {
  return useMutation({
    mutationFn: auth.signIn,
  })
}

export function useSignOut() {
  return useMutation({
    mutationFn: auth.signOut
  })
}
