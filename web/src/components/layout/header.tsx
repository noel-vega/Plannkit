import { useHeaderStore } from "@/hooks/use-header"
import { useTranslation } from "react-i18next"
import { SidebarTrigger } from "../ui/sidebar"
import { LogOutIcon } from "lucide-react"
import { Button } from "../ui/button"
import { useMutation } from "@tanstack/react-query"
import { signOut } from "@/features/auth/api"
import { useNavigate } from "@tanstack/react-router"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"

export function Header() {
  const navigate = useNavigate()
  const { title } = useHeaderStore()
  const { t } = useTranslation()

  const signOutMutation = useMutation({
    mutationFn: signOut
  })

  const handleSignOut = () => {
    signOutMutation.mutate()
    navigate({ to: "/auth/signin" })
  }

  return (
    <div className="h-16 border-b flex items-center px-4 gap-4">
      <SidebarTrigger>Menu</SidebarTrigger>
      <p className="font-bold text-2xl">{t(title)}</p>
      <div className="ml-auto">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="" size="icon-sm" variant="ghost">
              <LogOutIcon size={10} />
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
