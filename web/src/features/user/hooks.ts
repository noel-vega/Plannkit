import { useMutation } from "@tanstack/react-query";
import { user } from "./api";

export function useUpdateAvatarMutation() {
  return useMutation({
    mutationFn: user.updateAvatar
  })
}
