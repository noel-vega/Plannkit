import { createFileRoute, Outlet, useMatch, useNavigate } from '@tanstack/react-router'
import { HabitCardList } from '@/components/HabitCard'
import { Suspense } from 'react'
import { queryClient } from '@/lib/react-query'
import { getListHabitsQueryOptions } from '@/api'
import { CreateHabitDialog } from '@/components/CreateHabitForm'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { useMediaQuery } from '@/hooks'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'

export const Route = createFileRoute('/habits')({
  beforeLoad: () => {
    const today = new Date();
    queryClient.ensureQueryData(getListHabitsQueryOptions())
    return { today }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const habitRouteMatch = useMatch({
    from: "/habits/$id",
    shouldThrow: false
  })
  return (
    <div className="px-3 xl:px-0">
      <div className="max-w-5xl mx-auto">
        {!habitRouteMatch && isDesktop && (
          <header className="flex justify-between items-center py-8">
            <h1 className="text-2xl font-semibold">Habits</h1>
            <CreateHabitDialog>
              <Button>
                <PlusIcon /><span>Add Habit</span>
              </Button>
            </CreateHabitDialog>
          </header>
        )}
        <Suspense fallback={"Loading habits..."}>

          {isDesktop ? (
            <>
              {!habitRouteMatch && (<HabitCardList />)}
              <Outlet />
            </>
          ) : (
            <>

              <header className="flex justify-between items-center py-8">
                <h1 className="text-2xl font-semibold">Habits</h1>
                <CreateHabitDialog>
                  <Button>
                    <PlusIcon /><span>Add Habit</span>
                  </Button>
                </CreateHabitDialog>
              </header>
              <HabitCardList />
            </>
          )}

          <Drawer open={habitRouteMatch && !isDesktop ? true : false} onClose={() => navigate({ to: "/habits" })}>
            <DrawerContent className="min-h-[75%]">
              <DrawerHeader>
                <DrawerTitle>Habit</DrawerTitle>
                <DrawerDescription className="hidden">Habit</DrawerDescription>
              </DrawerHeader>


            </DrawerContent>
          </Drawer>
        </Suspense>
      </div>
    </div >
  )
}

