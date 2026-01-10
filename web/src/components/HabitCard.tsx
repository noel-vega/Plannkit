import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import type { Contribution, Habit, HabitWithContributions } from "@/types";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createContribution, deleteContribution, getListHabitsQueryOptions, invalidateListHabits, updateContributionCompletions } from "@/api";
import { CalendarIcon, CheckIcon, MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { getDayOfYear } from "date-fns";
import { Link } from "@tanstack/react-router";
import { ContributionsGrid } from "./ContributionsGrid";
import { useState, type MouseEvent } from "react";
import { CircularProgress } from "./ui/circle-progress";
import { Tooltip } from "react-tooltip";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { FieldLabel } from "./ui/field";
import { useDialog } from "@/hooks";
import { Progress } from "./ui/progress";
import { ButtonGroup } from "./ui/button-group";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Controller, useForm } from "react-hook-form";
import { useDebouncedCallback } from 'use-debounce';


// the contributions map should not be the day of year
function HabitContributionButton(props: { habit: Habit, contributions: Map<number, Contribution> }) {
  const { open, setOpen } = useDialog()
  const { habit, contributions } = props
  const todaysContribution = contributions.get(getDayOfYear(new Date()))

  const createContributionMutation = useMutation({
    mutationFn: createContribution,
    onSuccess: invalidateListHabits
  })

  const updateCompletionsMutation = useMutation({
    mutationFn: updateContributionCompletions,
    onSuccess: invalidateListHabits
  })

  const handleContribution = async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (habit.completionType === "custom") {
      console.log("custom dialog")
      setOpen(true)
      return
    }
    if (!todaysContribution) {
      createContributionMutation.mutate({
        habitId: habit.id,
        date: new Date(),
        completions: 1,
      })
      return
    }

    if (todaysContribution.completions === habit.completionsPerDay) {
      updateCompletionsMutation.mutate({ contributionId: todaysContribution.id, completions: 0 })
    } else {
      updateCompletionsMutation.mutate({ contributionId: todaysContribution.id, completions: todaysContribution.completions + 1 })
    }
  }


  if (habit.completionsPerDay > 1) {
    const progress = !todaysContribution ? 0 : todaysContribution.completions / habit.completionsPerDay * 100
    const tooltipId = `completions-habit-${habit.id}`
    const tooltipContent = `${todaysContribution?.completions ?? 0} / ${habit.completionsPerDay}`
    return (
      <>
        <Tooltip id={tooltipId} delayShow={500} />
        <button
          data-tooltip-id={tooltipId}
          data-tooltip-content={tooltipContent}
          data-tooltip-place="top"
          className="cursor-pointer relative h-fit grid place-content-center" onClick={handleContribution}>
          {progress !== 100 ? (
            <PlusIcon className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />
          ) : (
            <CheckIcon className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-green-500" />
          )}
          <CircularProgress progress={progress} size={50} strokeWidth={5} showPercentage={false} />
        </button>

        <CustomContributionCompletionsDialog habit={props.habit} contribution={todaysContribution} open={open} onOpenChange={setOpen} progress={progress} />
      </>
    )
  }
  return (<Button variant="outline" onClick={handleContribution}
    className={cn({
      "bg-green-500 text-white hover:bg-green-500 hover:text-white": todaysContribution?.completions === habit.completionsPerDay
    })}>
    <CheckIcon />
  </Button>)
}

function CustomContributionCompletionsDialog(props: { contribution?: Contribution; habit: Habit; progress: number; open: boolean; onOpenChange: (open: boolean) => void }) {
  const debounce = useDebouncedCallback(() => { }, 500,)
  const [progress, setProgress] = useState(props.progress)
  const [incrementBy, setIncremetBy] = useState(1)

  const createContributionMutation = useMutation({
    mutationFn: createContribution,
    onSuccess: invalidateListHabits
  })

  const updateCompletionsMutation = useMutation({
    mutationFn: updateContributionCompletions,
    onSuccess: invalidateListHabits
  })
  const form = useForm({
    defaultValues: {
      completions: props.contribution?.completions ?? 0
    }
  })

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="outline">
              <CalendarIcon />
              Today
            </Badge>
            <Badge variant="outline">{props.habit.name}</Badge>
          </DialogTitle>
          <Progress value={props.progress} className="h-3" />
        </DialogHeader>
        <FieldLabel>Completions</FieldLabel>

        <Controller control={form.control} name="completions" render={({ field }) => (
          <ButtonGroup className="w-full" >
            <Button variant="secondary" onClick={() => {
              const newValue = field.value - incrementBy
              if (newValue < 0) {
                field.onChange(0)
              } else {
                field.onChange(newValue)
              }
            }}><MinusIcon /></Button>
            <Input type="number" className="text-center" {...field} />
            <Button variant="secondary"
              onClick={() => {
                const newValue = field.value + incrementBy
                if (newValue > props.habit.completionsPerDay) {
                  field.onChange(props.habit.completionsPerDay)
                } else {
                  field.onChange(newValue)
                }
              }}>
              <PlusIcon />
            </Button>
          </ButtonGroup>
        )} />

        <ToggleGroup type="single" className="w-full border divide-x" defaultValue={incrementBy.toString()} onValueChange={(val) => setIncremetBy(Number(val))}>
          <ToggleGroupItem value="1" className="flex-1">1</ToggleGroupItem>
          <ToggleGroupItem value="5" className="flex-1">5</ToggleGroupItem>
          <ToggleGroupItem value="10" className="flex-1">10</ToggleGroupItem>
          <ToggleGroupItem value="25" className="flex-1">25</ToggleGroupItem>
          <ToggleGroupItem value="50" className="flex-1">50</ToggleGroupItem>
          <ToggleGroupItem value="100" className="flex-1">100</ToggleGroupItem>
        </ToggleGroup>

        <DialogFooter>
          <Button variant="secondary" className="flex-1">Reset</Button>
          <Button variant="secondary" className="flex-1">Complete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

}

function HabitCard(props: { habit: HabitWithContributions }) {
  const { habit } = props
  const contributions = new Map(props.habit.contributions.map(contrib => [getDayOfYear(contrib.date), contrib]));
  return (
    <Card className="pb-0 pt-4 xl:py-6 gap-3 xl:gap-6">
      <CardHeader className="flex px-3 xl:px-6">
        <div className="flex-1 space-y-2">
          <CardTitle>
            {habit.name}
          </CardTitle>
          <Badge>{habit.completionType}</Badge>
          <CardDescription>{habit.description}</CardDescription>
        </div>
        <HabitContributionButton habit={habit} contributions={contributions} />
      </CardHeader>
      <CardContent className="px-3 xl:px-6">
        <div className="overflow-x-auto pb-4">
          <ContributionsGrid contributions={contributions} />
        </div>
      </CardContent>
    </Card>
  )
}


export function HabitCardList() {
  const { data: habits } = useSuspenseQuery(getListHabitsQueryOptions())
  if (habits.length === 0) {
    return <div>No Habits</div>
  }
  return (
    <ul className="space-y-4">
      {habits.map(habit => <li key={habit.id}>
        <Link key={habit.id} to="/habits/$id" params={{ id: habit.id }}>
          <HabitCard habit={habit} />
        </Link>
      </li>)}
    </ul>
  )

}
