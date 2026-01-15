import { createContribution, getHabitByIdQueryOptions, getListHabitsQueryOptions, invalidateHabitById, invalidateListHabits, updateContributionCompletions, useDeleteHabit } from '@/features/habits/api'
import { BackButton } from '@/components/BackButton'
import { ContributionsGrid } from '@/features/habits/components/ContributionsGrid'
import { EditHabitDialog } from '@/features/habits/components/EditHabitForm'
import { Button, buttonVariants } from '@/components/ui/button'
import { queryClient } from '@/lib/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useRouteContext } from '@tanstack/react-router'
import { getDayOfYear } from 'date-fns/getDayOfYear'
import { CheckIcon, EditIcon, Trash2Icon } from 'lucide-react'
import z from 'zod/v3'

import { Calendar } from '@/components/ui/calendar'
import { useState, type PropsWithChildren } from 'react'
import { CustomContributionCompletionsDialog } from '@/features/habits/components/HabitCard'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/spinner'
import type { Contribution, HabitWithContributions } from '@/features/habits/types'

export const Route = createFileRoute('/habits/$id')({
  params: {
    parse: z.object({ id: z.coerce.number() }).parse
  },
  beforeLoad: async ({ params }) => {
    const habit = await queryClient.ensureQueryData(getHabitByIdQueryOptions(params))
    return { habit }
  },
  component: RouteComponent,
})

function DeleteHabitDialog(props: { habitId: number } & PropsWithChildren) {
  const navigate = useNavigate()
  const deleteHabit = useDeleteHabit()

  const handleDelete = () => {
    deleteHabit.mutate(props.habitId, {
      onSuccess: async () => {
        queryClient.setQueryData(getListHabitsQueryOptions().queryKey, (oldData) => {
          return !oldData ? oldData : oldData.filter(x => x.id !== props.habitId)
        })
        await invalidateListHabits()
        navigate({ to: "/habits" })
      }
    })
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Habit</AlertDialogTitle>
          <AlertDialogDescription>Permenantley delete this habit</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={handleDelete}>
            {deleteHabit.isPending ? <Spinner /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function RouteComponent() {
  const params = Route.useParams()
  const rtContext = Route.useRouteContext()

  const { data: habit } = useQuery({ ...getHabitByIdQueryOptions(params), initialData: rtContext.habit })

  const contributions = new Map(habit.contributions.map(contrib => [getDayOfYear(contrib.date), contrib]));
  return (
    <div className="px-3 max-w-6xl w-full mx-auto">
      <div>
        <div className="flex gap-8 items-center py-8">
          <BackButton to="/habits" />
          <h2 className="text-2xl font-semibold">{habit.name}</h2>
          <div className='space-x-2 ml-auto'>
            <EditHabitDialog habit={habit}>
              <Button className="ml-auto">
                <EditIcon /> <span>Edit</span>
              </Button>
            </EditHabitDialog>
            <DeleteHabitDialog habitId={habit.id}>
              <Button variant="secondary" size="icon"><Trash2Icon /></Button>
            </DeleteHabitDialog>
          </div>
        </div>
        <p>{!habit.description ? "No Description" : habit.description}</p>
      </div>

      <div className="py-4 mb-4 overflow-x-auto">
        <ContributionsGrid habit={habit} contributions={contributions} />
      </div>
      <HabitCalendar habit={habit} />
    </div>
  )
}

export function HabitCalendar(props: { habit: HabitWithContributions }) {
  const { today } = useRouteContext({ from: "__root__" })
  const { habit } = props
  const [day, setDay] = useState<Date>(new Date())

  const createContributionMutation = useMutation({
    mutationFn: createContribution,
    onSuccess: () => {
      invalidateListHabits()
      invalidateHabitById(props.habit.id)
    }
  })

  const updateCompletionsMutation = useMutation({
    mutationFn: updateContributionCompletions,
    onSuccess: () => {
      invalidateListHabits()
      invalidateHabitById(props.habit.id)
    }
  })

  const handleContribution = async (params: { contribution: Contribution } | { contribution: undefined, date: Date }) => {
    if (habit.completionType === "custom") {
      // setOpen(true)
      return
    }
    if (!params.contribution) {
      createContributionMutation.mutate({
        habitId: habit.id,
        date: params.date,
        completions: 1,
      })
      return
    }

    if (params.contribution.completions === habit.completionsPerDay) {
      updateCompletionsMutation.mutate({ contributionId: params.contribution.id, completions: 0 })
    } else {
      updateCompletionsMutation.mutate({ contributionId: params.contribution.id, completions: params.contribution.completions + 1 })
    }
  }
  const contributions = new Map(props.habit.contributions.map(contrib => [getDayOfYear(contrib.date), contrib]));
  const [open, setOpen] = useState(false)
  return (
    <>
      <Calendar
        className="rounded-lg border shadow-sm w-full [--cell-size:theme(spacing.16)]"
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

