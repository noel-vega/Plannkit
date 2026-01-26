import { SignUpForm } from '@/features/auth/components/sign-up-form'
import { createFileRoute } from '@tanstack/react-router'
import { NotebookTabsIcon } from 'lucide-react'

export const Route = createFileRoute('/(auth)/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="h-full flex flex-col">
    <div className="flex gap-4 items-center w-full p-4 sm:p-8">
      <NotebookTabsIcon className="size-6 sm:size-10" />
      <h1 className="text-xl sm:text-3xl font-bold ">Plannkit</h1>
    </div>
    <div className="flex-1 flex items-center justify-center relative p-6 pt-2">
      <div className="max-w-lg w-full space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-medium">Get Organized Now</h1>
          <p className="text-muted-foreground">Create your account below to get started</p>
        </div>
        <SignUpForm />
      </div>
    </div>
    {/* <div className="flex-1 p-4 pl-0"> */}
    {/*   <div className="bg-indigo-600 h-full w-full rounded-3xl" /> */}
    {/* </div> */}
  </div>
}
