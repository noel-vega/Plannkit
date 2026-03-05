import { useRouter } from "@tanstack/react-router"
import { useEffect, useState } from "react"

let initialIndex: number | null = null
let maxIndex = 0

export function useNavigation() {
  const router = useRouter()
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)

  useEffect(() => {
    const currentIndex = router.history.location.state?.__TSR_index ?? 0

    if (initialIndex === null) {
      initialIndex = currentIndex
    }
    if (currentIndex > maxIndex) {
      maxIndex = currentIndex
    }

    return router.history.subscribe(({ action, location }) => {
      const idx = location.state?.__TSR_index ?? 0

      if (action.type === "PUSH" || action.type === "REPLACE") {
        maxIndex = idx
      } else if (idx > maxIndex) {
        maxIndex = idx
      }

      setCanGoBack(idx > initialIndex!)
      setCanGoForward(idx < maxIndex)
    })
  }, [router])

  const goBack = () => {
    if (canGoBack) router.history.back()
  }

  const goForward = () => {
    if (canGoForward) router.history.go(1)
  }

  return { canGoBack, canGoForward, goBack, goForward }
}
