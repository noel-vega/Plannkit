import { useHeaderStore } from "@/hooks/use-header"
import { useTranslation } from "react-i18next"
import { SidebarTrigger } from "../ui/sidebar"
import { LogOutIcon, SettingsIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Link, useNavigate } from "@tanstack/react-router"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { useSignOut } from "@/features/auth/hooks"
import { queryClient } from "@/lib/react-query"


export function Header() {
  const navigate = useNavigate()
  const { title } = useHeaderStore()
  const { t } = useTranslation()

  const signOut = useSignOut()

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear()
        navigate({ to: "/auth/signin" })
      }
    })
  }

  return (
    <div className="h-16 border-b flex items-center px-4 xl:px-8 gap-4">
      <SidebarTrigger />
      <p className="font-bold text-2xl">{t(title)}</p>
      <div id="app-layout-header-portal" className="flex-1">
      </div>
      <div>
        <Button asChild variant="ghost" className="[&_svg:not([class*='size-'])]:size-4.5">
          <Link to="/app/settings">
            <SettingsIcon />
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="[&_svg:not([class*='size-'])]:size-4.5">
              <LogOutIcon />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign Out</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to sign out of your account?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleSignOut}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>)
}


