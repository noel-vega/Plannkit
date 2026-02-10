import { BackButton } from '@/components/back-button'
import { ContributionsGrid } from '@/features/habits/components/contributions-grid'
import { EditHabitDialog } from '@/features/habits/components/edit-habit-form'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { getDayOfYear } from 'date-fns/getDayOfYear'
import { CheckIcon, EditIcon, Trash2Icon } from 'lucide-react'
import z from 'zod/v3'

import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import { CustomContributionCompletionsDialog } from '@/features/habits/components/habit-card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Contribution, HabitWithContributions } from '@/features/habits/types'
import { DeleteHabitDialog } from '@/features/habits/components/delete-habit-dialog'
import { useDialog } from '@/hooks'
import { Page } from '@/components/layout/page'
import { getHabitByIdQueryOptions, useCreateContribution, useUpdateContribution } from '@/features/habits/hooks'

export const Route = createFileRoute('/app/habits/$id')({
  params: {
    parse: z.object({ id: z.coerce.number() }).parse
  },
  loader: async ({ context: { queryClient }, params }) => {
    return await queryClient.ensureQueryData(getHabitByIdQueryOptions(params))
  },
  component: RouteComponent,
})


function RouteComponent() {
  const routeParams = Route.useParams()
  const initialHabit = Route.useLoaderData()
  const { data: habit } = useQuery({
    ...getHabitByIdQueryOptions(routeParams),
    initialData: initialHabit
  })

  const contributions = new Map(habit.contributions.map(contrib => [getDayOfYear(contrib.date), contrib]));

  return (
    <Page title="Habits">
      <div className="max-w-5xl">
        <Header habit={habit} />
        <p>{!habit.description ? "No Description" : habit.description}</p>
        <div className="py-4 mb-4 overflow-x-auto">
          <ContributionsGrid habit={habit} contributions={contributions} />
        </div>
        <HabitCalendar habit={habit} />
      </div>
    </Page>
  )
}

function Header({ habit }: { habit: HabitWithContributions }) {
  const deleteDialog = useDialog()
  const editDialog = useDialog()
  const handleOpenDeleteDialog = () =>
    deleteDialog.onOpenChange(true)

  const handleOpenEditDialog = () =>
    editDialog.onOpenChange(true)
  return (
    <>
      <header className="flex gap-8 items-center mb-8">
        <BackButton to="/app/habits" />
        <h2 className="text-2xl font-semibold">{habit.name}</h2>
        <div className='space-x-2 ml-auto'>

          <Button className="ml-auto" onClick={handleOpenEditDialog}>
            <EditIcon /> <span>Edit</span>
          </Button>
          <Button variant="secondary" onClick={handleOpenDeleteDialog}>
            <Trash2Icon /><span>Delete</span>
          </Button>
        </div>
      </header>

      <EditHabitDialog habit={habit} {...editDialog} />
      <DeleteHabitDialog id={habit.id} {...deleteDialog} />
    </>
  )
}

export function HabitCalendar(props: { habit: HabitWithContributions }) {
  const { today } = useRouteContext({ from: "__root__" })
  const { habit } = props
  const [day, setDay] = useState<Date>(new Date())

  const createContribution = useCreateContribution()
  const updateContribution = useUpdateContribution()

  const handleContribution = async (params: { contribution: Contribution } | { contribution: undefined, date: Date }) => {
    if (habit.completionType === "custom") {
      // setOpen(true)
      return
    }
    if (!params.contribution) {
      createContribution.mutate({
        habitId: habit.id,
        date: params.date,
        completions: 1,
      })
      return
    }

    const isDone = params.contribution.completions === habit.completionsPerDay
    const completions = isDone ? 0 : params.contribution.completions + 1
    updateContribution.mutate({ habitId: habit.id, contributionId: params.contribution.id, completions })
  }
  const contributions = new Map(props.habit.contributions.map(contrib => [getDayOfYear(contrib.date), contrib]));
  const [open, setOpen] = useState(false)
  return (
    <>
      <Calendar
        className="rounded-lg border shadow-sm w-full [--cell-size:--spacing(16)]"
        classNames={{
          weeks: "gap-2"
        }}
        components={{
          DayButton: ({ day }) => {
            const dayOfYear = getDayOfYear(day.date)
            const contribution = contributions.get(dayOfYear)
            const progress = !contribution ? 0 : contribution.completions / habit.completionsPerDay * 100
            return <>
              <button disabled={day.date > today} className={cn("hover:bg-secondary hover:border-border gap-2 rounded border border-transparent h-full w-full flex flex-col cursor-pointer", {
                "cursor-default": day.date > today
              })} onClick={
                () => {
                  if (habit.completionType === 'custom') {
                    setDay(day.date)
                    setOpen(true)
                    return
                  }
                  if (dayOfYear > getDayOfYear(new Date())) return

                  if (!contribution) {
                    handleContribution({ contribution, date: day.date })
                  } else {
                    handleContribution({ contribution })
                  }
                }
              }>
                <div className="flex-1 flex justify-center items-end">{day.date.getDate()}</div>
                <div className="flex-1">
                  {progress > 0 && (
                    <>
                      {progress === 100 ? (
                        <div className="text-center">
                          {contribution?.completions === habit.completionsPerDay && <CheckIcon className="text-green-500 mx-auto" />}
                        </div>
                      ) : (
                        <div className="h-6 flex items-center">
                          <Progress value={progress} className="w-3/4 mx-auto" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </button>

            </>
          }
        }}
      />

      <CustomContributionCompletionsDialog
        habit={props.habit}
        date={day}
        contribution={contributions.get(getDayOfYear(day))}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}

