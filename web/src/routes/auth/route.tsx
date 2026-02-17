import { createFileRoute, Outlet } from '@tanstack/react-router'
import { NotebookTabsIcon } from 'lucide-react'

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-4 items-center w-full p-4 sm:p-8 fixed top-0">
        <NotebookTabsIcon className="size-6 sm:size-10 stroke-2" />
        <h1 className="text-xl sm:text-3xl font-bold ">Plannkit</h1>
      </div>

      <div className="flex-1 flex items-center justify-center relative px-4 pt-2">
        <Outlet />
      </div>
    </div>
  )
}
