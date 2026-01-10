import { useEffect, useState } from "react";

export function useDialog() {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)
  return {
    open, setOpen, close
  }
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
