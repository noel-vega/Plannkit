import { SidebarTrigger } from "../ui/sidebar"
import { ArrowLeftIcon, ArrowRightIcon, LogOutIcon, SearchIcon, SettingsIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Link, useNavigate } from "@tanstack/react-router"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { useSignOut } from "@/features/auth/hooks"
import { queryClient } from "@/lib/react-query"
import { ButtonGroup } from "../ui/button-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { useNavigation } from "@/hooks/use-navigation"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"


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

  const { canGoBack, canGoForward, goBack, goForward } = useNavigation()

  return (
    <div className="h-12 border-b flex items-center px-4 xl:px-6 gap-4 bg-sidebar">
      <SidebarTrigger />
      <ButtonGroup>
        <Button variant="ghost" size="sm" disabled={!canGoBack} onClick={goBack} >
          <ArrowLeftIcon />
        </Button>
        <Button variant="ghost" size="sm" disabled={!canGoForward} onClick={goForward}>
          <ArrowRightIcon />
        </Button>
      </ButtonGroup>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="max-w-xl w-full">
            <InputGroup>
              <InputGroupInput placeholder="Search Plannkit..." />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
            </InputGroup>
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


