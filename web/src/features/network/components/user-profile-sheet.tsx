import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useUserProfile } from "../hooks"
import type { DialogProps } from "@/types"

export function UserProfileSheet(props: { username: string } & DialogProps) {
  const { username, ...sheet } = props

  const profile = useUserProfile(props.username)
  return (
    <Sheet {...sheet}>
      <SheetContent className="sm:max-w-xl">
        {profile.isLoading && "Loading..."}

        {profile.data && (
          <>
            <div>Email: {profile.data.user.email}</div>
          </>

        )}

      </SheetContent>
    </Sheet>

  )
}
