import { useEffect, useState, type ChangeEvent, type MouseEvent } from "react";
import type { Contribution, Habit, HabitWithContributions } from "@/features/habits/types";
import { useMutation } from "@tanstack/react-query";
import { createContribution, invalidateHabitById, invalidateListHabits, updateContributionCompletions } from "@/features/habits/api";
import { CalendarIcon, CheckIcon, DotIcon, FlameIcon, MinusIcon, PlusIcon } from "lucide-react";
import { format, getDayOfYear } from "date-fns";
import { Tooltip } from "react-tooltip";
import { useDialog } from "@/hooks";
import { useDebouncedCallback } from 'use-debounce';
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circle-progress";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { DialogProps } from "@/types";
import { DynamicIcon } from "@/components/ui/dynamic-icon"

// TODO: the contributions map should not be the day of year
function HabitContributionButton(props: { habit: Habit, contributions: Map<number, Contribution> }) {
  const contributionsDialog = useDialog()
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
      contributionsDialog.onOpenChange(true)
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
          <CheckIcon className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 stroke-green-600" />
        )}
        <CircularProgress progress={progress} size={60} strokeWidth={5} showPercentage={false} />
      </button>
      <CustomContributionCompletionsDialog
        date={new Date()}
        habit={props.habit}
        {...contributionsDialog}
        contribution={todaysContribution}
      />
    </>
  )
}

export function CustomContributionCompletionsDialog(props: { date: Date; contribution?: Contribution; habit: Habit; } & DialogProps) {
  const [completions, setCompletions] = useState(props.contribution?.completions ?? 0)
  const [incrementBy, setIncremetBy] = useState(1)

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

  useEffect(() => {
    setCompletions(props.contribution?.completions ?? 0)
  }, [props.contribution])

  const debounce = useDebouncedCallback((completions: number) => {
    if (!props.contribution) {
      createContributionMutation.mutate({ habitId: props.habit.id, date: props.date, completions })

    } else {
      updateCompletionsMutation.mutate({ contributionId: props.contribution.id, completions })
    }
  }, 250)
  const progress = !props.contribution ? 0 : props.contribution.completions / props.habit.completionsPerDay * 100

  const handleChange = (completions: number) => {
    setCompletions(completions)
    debounce(completions)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    handleChange(e.currentTarget.valueAsNumber)

  const handleComplete = () =>
    handleChange(props.habit.completionsPerDay)

  const handleReset = () =>
    handleChange(0)

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="outline">
              <CalendarIcon />
              {getDayOfYear(new Date()) === getDayOfYear(props.date) ? "Today" : format(props.date, "MMMM do")}
            </Badge>
            <Badge variant="outline">{props.habit.name}</Badge>
          </DialogTitle>
          <DialogDescription className="hidden">
            Todays Completions
          </DialogDescription>
          <Progress value={progress} className="h-3" />
        </DialogHeader>
        <FieldLabel>Completions</FieldLabel>

        <ButtonGroup className="w-full" >
          <Button variant="secondary" onClick={() => {
            const newValue = completions - incrementBy
            const value = newValue < 0 ? 0 : newValue
            handleChange(value)
          }}>
            <MinusIcon />
          </Button>
          <Input type="number" className="text-center" value={completions} onChange={handleInputChange} />
          <Button variant="secondary"
            onClick={() => {
              const newValue = completions + incrementBy
              const value = newValue > props.habit.completionsPerDay ? props.habit.completionsPerDay : newValue
              handleChange(value)
            }}>
            <PlusIcon />
          </Button>
        </ButtonGroup>

        <ToggleGroup type="single" className="w-full border divide-x" defaultValue={incrementBy.toString()} onValueChange={(val) => setIncremetBy(Number(val))}>
          <ToggleGroupItem value="1" className="flex-1">1</ToggleGroupItem>
          <ToggleGroupItem value="5" className="flex-1">5</ToggleGroupItem>
          <ToggleGroupItem value="10" className="flex-1">10</ToggleGroupItem>
          <ToggleGroupItem value="25" className="flex-1">25</ToggleGroupItem>
          <ToggleGroupItem value="50" className="flex-1">50</ToggleGroupItem>
          <ToggleGroupItem value="100" className="flex-1">100</ToggleGroupItem>
        </ToggleGroup>

        <DialogFooter>
          <Button variant="secondary" className="flex-1" onClick={handleReset}>Reset</Button>
          <Button variant="secondary" className="flex-1" onClick={handleComplete}>Complete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

}

export function HabitCard(props: { habit: HabitWithContributions }) {
  const { habit } = props
  const contributions = new Map(props.habit.contributions.map(contrib => [getDayOfYear(contrib.date), contrib]));
  return (
    <Card>
      <CardHeader className="flex">
        <CardTitle className="font-normal flex-1">
          <div className="flex gap-4">
            <div className="size-14 border-2 rounded-lg grid place-content-center shrink-0">
              <DynamicIcon className="size-8" name={habit.icon} />
            </div>
            <div>
              <p className="font-bold text-lg">{habit.name}</p>
              <CardDescription>{habit.description}</CardDescription>
            </div>
          </div>
        </CardTitle>
        <HabitContributionButton habit={habit} contributions={contributions} />
      </CardHeader>
      {/* <CardFooter> */}
      {/*   <div className="flex gap-2 items-center text-sm"> */}
      {/*     <p>3 / 7 this week</p> */}
      {/*     <DotIcon /> */}
      {/*     <div className="flex items-center gap-1.5"> */}
      {/*       <FlameIcon size={16} /> */}
      {/*       <p>3 day streak</p> */}
      {/*     </div> */}
      {/*   </div> */}
      {/* </CardFooter> */}
    </Card>
  )
}



