import { SignUpForm } from '@/features/auth/components/sign-up-form'
import { createFileRoute } from '@tanstack/react-router'
import { NotebookTabsIcon } from 'lucide-react'

export const Route = createFileRoute('/(auth)/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="h-full flex">
    <div className="fixed top-10 left-10 flex gap-4 items-center">
      <NotebookTabsIcon size={40} />
      <h1 className="text-3xl font-bold">Plannkit</h1>
    </div>
    <div className="flex-1 flex items-center justify-center relative">
      <div className="max-w-lg w-full space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Get Organized Now</h1>
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
