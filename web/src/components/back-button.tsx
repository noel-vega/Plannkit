import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { MoveLeftIcon } from "lucide-react";

export function BackButton({ to }: { to: string }) {
  return (

    <Link to={to}>
      <Button variant="outline" size="icon">
        <MoveLeftIcon />
      </Button>
    </Link>
  )
}
