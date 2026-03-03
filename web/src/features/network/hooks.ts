import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import type { DiscoverUsersParams, User, UserProfile } from "./types";
import { network } from "./api";
import { queryClient } from "@/lib/react-query";


export function getUseDiscoverUsersQueryOptions(params?: DiscoverUsersParams) {
  return queryOptions({
    queryKey: ['discover', params],
    queryFn: () => network.discover(params)
  })
}

export function useDiscoverUsersQuery(params: DiscoverUsersParams, initialData: User[]) {
  return useQuery({ ...getUseDiscoverUsersQueryOptions(params), initialData })
}


export function getUseUserProfileQueryOptions(username: string) {
  return queryOptions({
    queryKey: ['profile', username],
    queryFn: () => network.profile(username)
  })
}

export function useUserProfile(username: string, initialData: UserProfile) {
  return useQuery({ ...getUseUserProfileQueryOptions(username), initialData })
}

export function useFollowMutation(username: string) {
  return useMutation({
    mutationFn: network.users.follow,
    onSuccess: async () => {
      await queryClient.invalidateQueries(getUseUserProfileQueryOptions(username))
    }
  })
}


export function useUnFollowMutation(username: string) {
  return useMutation({
    mutationFn: network.users.unfollow,
    onSuccess: async () => {
      await queryClient.invalidateQueries(getUseUserProfileQueryOptions(username))
    }
  })
}
