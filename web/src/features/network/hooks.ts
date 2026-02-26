import { queryOptions, useQuery } from "@tanstack/react-query";
import type { DiscoverUsersParams, User } from "./types";
import { network } from "./api";


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

export function useUserProfile(username: string, initialData: User) {
  return useQuery({ ...getUseUserProfileQueryOptions(username), initialData })
}
