import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import type { Contribution, HabitWithContributions } from "@/types";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createContribution, deleteContribution, getListHabitsQueryOptions, invalidateListHabits } from "@/api";
import { CheckIcon } from "lucide-react";
import { Button } from "./ui/button";
import { getDayOfYear } from "date-fns";
import { Link } from "@tanstack/react-router";
import { ContributionsGrid } from "./ContributionsGrid";
import type { MouseEvent } from "react";


// the contributions map should not be the day of year
function HabitDailyContributionButton(props: { habitId: number, contributions: Map<number, Contribution> }) {
  const { contributions } = props
  const todaysContribution = contributions.get(getDayOfYear(new Date()))

  const createContributionMutation = useMutation({
    mutationFn: createContribution,
    onSuccess: invalidateListHabits
  })
  const deleteContributionMutation = useMutation({
    mutationFn: deleteContribution,
    onSuccess: invalidateListHabits
  })

  const handleToggleContribution = async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!todaysContribution) {
      createContributionMutation.mutate({
        habitId: props.habitId,
        date: new Date(),
        completions: 1,
      })
    } else {
      deleteContributionMutation.mutate({ id: todaysContribution.id })
    }

  }
  return (<Button variant="outline" onClick={handleToggleContribution}
    className={cn({
      "bg-blue-500 text-white hover:bg-blue-500 hover:text-white": !!todaysContribution
    })}>
    <CheckIcon />
  </Button>)
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
          <CardDescription>{habit.description}</CardDescription>
        </div>
        <HabitDailyContributionButton habitId={habit.id} contributions={contributions} />
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
