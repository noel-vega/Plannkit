import { useAuth } from "@/features/auth/store"
import { useTranslation } from "react-i18next"
import { useAcceptFollowMutation, useFollowMutation, useRemoveFollowMutation } from "../hooks"
import { NetworkButton } from "./network-button"
import type { UserProfile } from "../types"
import { Button } from "@/components/ui/button"
import { type MouseEvent } from "react"
import { ClockIcon } from "lucide-react"

export function FollowButton(props: { profile: UserProfile }) {
  const { me } = useAuth()
  const { user, follow } = props.profile
  const { t } = useTranslation()
  const requestFollow = useFollowMutation(user.username)
  const removeFollow = useRemoveFollowMutation(user.username)

  return (
    <NetworkButton
      confirm={user.isPrivate}
      confirmTitle="Responding to follow request"
      confirmDescription="Allow user view user profile and posts."
      status={follow?.status}
      isRequester={me.id === follow?.followerUserId}
      onRequest={() => requestFollow.mutate(user.id)}
      onRemove={() => removeFollow.mutate(user.id)}
      onAccept={() => console.log("not needed")}
      isPending={requestFollow.isPending || removeFollow.isPending}
      labels={{
        request: t("Follow"),
        accepted: t("Following"),
        requestPending: t("Follow Pending"),
        acceptPending: t("Accept Follow"),
      }}
    />
  )
}

// TODO: Create Accept Follow Endpoint
export function AcceptFollowButton(props: { userId: number; username: string }) {
  const accept = useAcceptFollowMutation(props.username)
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    accept.mutate(props.userId)
  }
  return (
    <Button variant="secondary" size="sm" onClick={handleClick}>
      <ClockIcon /> Accept Request
    </Button>
  )
}

export function PendingFollowButton(props: { userId: number; username: string }) {
  const removeFollow = useRemoveFollowMutation(props.username)
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    removeFollow.mutate(props.userId)
  }
  return (
    <Button variant="secondary" size="sm" onClick={handleClick}>
      <ClockIcon /> Request Pending
    </Button>
  )
}
