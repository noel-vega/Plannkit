import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";

let maxIndex = 0;

export function useCanGoForward() {
  const router = useRouter();
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    const currentIndex = router.history.location.state?.__TSR_index ?? 0;
    if (currentIndex > maxIndex) {
      maxIndex = currentIndex;
    }

    return router.history.subscribe(({ action, location }) => {
      const idx = location.state?.__TSR_index ?? 0;

      if (action.type === "PUSH" || action.type === "REPLACE") {
        maxIndex = idx;
      } else if (idx > maxIndex) {
        maxIndex = idx;
      }

      setCanGoForward(idx < maxIndex);
    });
  }, [router]);

  return canGoForward;
}
