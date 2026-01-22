import { useHeaderStore } from "@/hooks/use-header";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

type PageProps = {
  title?: string
  className?: string
} & PropsWithChildren
export function Page(props: PageProps) {
  useHeaderStore.setState({ title: props.title })
  return (
    <div className={cn("p-8 w-full h-full", props.className)}>
      {props.children}
    </div>

  )
}
