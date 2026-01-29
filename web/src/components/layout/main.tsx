import type { PropsWithChildren } from "react";

export function Main(props: PropsWithChildren) {
  return (
    <div className="flex-1 flex">
      {props.children}
    </div>
  )
}
