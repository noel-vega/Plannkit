import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-dvh w-full gap-4">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
      </div>
      <Button asChild>
        <Link to="/habits">Go Home</Link>
      </Button>
    </div>
  )
}
