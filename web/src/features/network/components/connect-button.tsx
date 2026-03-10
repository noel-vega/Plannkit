import { useAuth } from "@/features/auth/store"
import { useTranslation } from "react-i18next"
import { useAcceptConnectionMutation, useRemoveConnectionMutation, useRequestConnectionMutation } from "../hooks"
import type { UserProfile } from "../types"
import { NetworkButton } from "./network-button"

export function ConnectButton(props: { profile: UserProfile }) {
  const { me } = useAuth()
  const { user, connection } = props.profile
  const { t } = useTranslation()
  const requestConnection = useRequestConnectionMutation(user.username)
  const removeConnection = useRemoveConnectionMutation(user.username)
  const acceptConnection = useAcceptConnectionMutation(user.username)

  return (
    <NetworkButton
      confirm={true}
      confirmTitle="Responding to connection request"
      confirmDescription="Connecting allows users to invite each other to workspaces"
      isRequester={connection?.requestedByUserId === me.id}
      status={connection?.status}
      onRequest={() => requestConnection.mutate(user.id)}
      onRemove={() => removeConnection.mutate(user.id)}
      onAccept={() => acceptConnection.mutate(user.id)}
      isPending={requestConnection.isPending || removeConnection.isPending}
      labels={{
        request: t("Connect"),
        accepted: t("Connected"),
        requestPending: t("Connection Pending"),
        acceptPending: t("Accept Connection"),
      }}
    />
  )
}
