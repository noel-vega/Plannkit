import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import type { DiscoverUsersParams, NetworkUser, UserProfile } from "./types";
import { network } from "./api";
import { queryClient } from "@/lib/react-query";


export function getUseDiscoverUsersQueryOptions(params?: DiscoverUsersParams) {
  return queryOptions({
    queryKey: ['discover', params?.filter, params?.search],
    queryFn: () => network.users.list(params)
  })
}

export function invalidateFollowing() {
  return queryClient.invalidateQueries({ queryKey: ["discover", "following"] })
}

export function invalidateFollowers() {
  return queryClient.invalidateQueries({ queryKey: ["discover", "followers"] })
}

export function invalidateConnections() {
  return queryClient.invalidateQueries({ queryKey: ["discover", "connections"] })
}

export function useDiscoverUsersQuery(params: DiscoverUsersParams, initialData: NetworkUser[]) {
  return useQuery({ ...getUseDiscoverUsersQueryOptions(params), initialData })
}


export function getUseUserProfileQueryOptions(username: string) {
  return queryOptions({
    queryKey: ['profile', username],
    queryFn: () => network.profile(username)
  })
}

export function invalidateUserProfile(username: string) {
  return queryClient.invalidateQueries(getUseUserProfileQueryOptions(username))
}

export function useUserProfile(username: string, initialData: UserProfile) {
  return useQuery({ ...getUseUserProfileQueryOptions(username), initialData })
}

export function useFollowMutation(username: string) {
  return useMutation({
    mutationFn: network.users.requestFollow,
    onSuccess: async () => {
      return invalidateUserProfile(username)
    }
  })
}


export function useRemoveFollowMutation(username: string) {
  return useMutation({
    mutationFn: network.users.removeFollow,
    onSuccess: async () => {
      invalidateUserProfile(username)
      invalidateFollowing()
    }
  })
}

export function useAcceptFollowMutation(username: string) {
  return useMutation({
    mutationFn: network.users.acceptFollow,
    onSuccess: async () => {
      invalidateUserProfile(username)
      invalidateFollowing()
      invalidateFollowers()
    }
  })
}

export function useRequestConnectionMutation(username: string) {
  return useMutation({
    mutationFn: network.users.requestConnection,
    onSuccess: async () => {
      return invalidateUserProfile(username)
    }
  })
}

export function useAcceptConnectionMutation(username: string) {
  return useMutation({
    mutationFn: network.users.acceptConnection,
    onSuccess: async () => {
      return invalidateUserProfile(username)
    }
  })
}

export function useRemoveConnectionMutation(username: string) {
  return useMutation({
    mutationFn: network.users.removeConnection,
    onSuccess: async () => {
      return invalidateUserProfile(username)
    }
  })
}
