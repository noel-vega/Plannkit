import { useEffect, useState } from "react";

export function useDialog() {
  const [isOpen, setIsOpen] = useState(false)

  const close = () => setIsOpen(false)
  return {
    isOpen, setIsOpen, close
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
