import { useCanGoBack, useRouter } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { MoveLeftIcon } from "lucide-react";

export function BackButton({ to }: { to?: string }) {
  const canGoBack = useCanGoBack()
  const router = useRouter()
  const handleClick = () => {
    if (to) {
      router.navigate({ to })
      return
    }

    if (canGoBack) {
      router.history.back()
    } else {
      router.navigate({ to: "/app/dashboard" })
    }


  }

  return (
    <Button variant="outline" size="icon" onClick={handleClick}>
      <MoveLeftIcon />
    </Button>
  )
}
