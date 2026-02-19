import { useHeaderStore } from "@/hooks/use-header";
import { cn } from "@/lib/utils";
import { useEffect, type PropsWithChildren } from "react";

type PageProps = {
  title?: string
  className?: string
} & PropsWithChildren

export function Page(props: PageProps) {
  useEffect(() => {
    useHeaderStore.setState({ title: props.title })
  }, [])
  return (
    <div className={cn("p-4 xl:px-8 w-full h-full", props.className)}>
      {props.children}
    </div>

  )
}
