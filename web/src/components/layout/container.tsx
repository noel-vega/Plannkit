import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

export function Container({ children, className }: { className?: string } & PropsWithChildren) {
  return (
    <div className={cn("@container", className)}>
      {children}
    </div>
  )
}
