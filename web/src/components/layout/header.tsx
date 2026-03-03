import { SidebarTrigger } from "../ui/sidebar"
import { ArrowLeftIcon, ArrowRightIcon, LogOutIcon, SearchIcon, SettingsIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { useSignOut } from "@/features/auth/hooks"
import { queryClient } from "@/lib/react-query"
import { Input } from "../ui/input"
import { ButtonGroup } from "../ui/button-group"
import { useCanGoForward } from "@/hooks/use-can-go-forward"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"


export function Header() {
  const navigate = useNavigate()

  const signOut = useSignOut()

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear()
        navigate({ to: "/auth/signin" })
      }
    })
  }

  const router = useRouter()

  const canGoBack = useCanGoBack()
  const canGoForward = useCanGoForward()

  const handleBackClick = () => canGoBack && router.history.back()
  const handleForwardClick = () => canGoForward && router.history.go(1)

  return (
    <div className="h-12 border-b flex items-center px-4 xl:px-6 gap-4 bg-sidebar">
      <SidebarTrigger />
      <ButtonGroup>
        <Button variant="ghost" size="sm" disabled={!canGoBack} onClick={handleBackClick} >
          <ArrowLeftIcon />
        </Button>
        <Button variant="ghost" size="sm" disabled={!canGoForward} onClick={handleForwardClick}>
          <ArrowRightIcon />
        </Button>
      </ButtonGroup>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="max-w-xl w-full">
            <Input disabled icon={SearchIcon} placeholder="Search Plannkit..." />
          </TooltipTrigger>

          <TooltipContent>
            Coming soon
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* <p className="font-bold text-2xl">{t(title)}</p> */}
      <div className="ml-auto">
        <Button asChild variant="ghost" className="[&_svg:not([class*='size-'])]:size-4.5">
          <Link to="/settings">
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


