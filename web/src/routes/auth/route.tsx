import { createFileRoute, Outlet } from '@tanstack/react-router'
import { NotebookTabsIcon } from 'lucide-react'

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="h-dvh flex items-center justify-center">
      <div className="flex gap-4 items-center w-full p-4 sm:p-8 fixed top-0">
        <NotebookTabsIcon className="size-6 sm:size-10 stroke-2" />
        <h1 className="text-xl sm:text-3xl font-bold ">Plannkit</h1>
      </div>

      <Outlet />
    </div>
  )
}
