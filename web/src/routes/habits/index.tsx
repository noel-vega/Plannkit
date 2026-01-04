import { createFileRoute } from '@tanstack/react-router'
import { CreateHabitDialog } from '@/components/HabitsForm'
import { HabitCardList } from '@/components/HabitCard'
import { Suspense } from 'react'
import { queryClient } from '@/lib/react-query'
import { getListHabitsQueryOptions } from '@/api'

export const Route = createFileRoute('/habits/')({
  beforeLoad: () => {
    const today = new Date();
    queryClient.ensureQueryData(getListHabitsQueryOptions())
    return { today }
  },
  component: RouteComponent,
})


function RouteComponent() {
  return <div>
    <div className="max-w-7xl mx-auto">
      <header className="flex justify-between py-8 border-b">
        <h1 className="text-2xl font-semibold">Habits</h1>
      </header>
      <div className="my-2">
        <CreateHabitDialog />
      </div>
      <Suspense fallback={"Loading habits..."}>
        <HabitCardList />
      </Suspense>
    </div>
  </div>
}

