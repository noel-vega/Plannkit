import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CreateGoalContributionParamsSchema, type GoalIdent } from "../types"
import type { FormEvent } from "react"
import { useCreateGoalContributionMutation } from "../hooks"

export function CreateGoalContributionForm(props: GoalIdent) {
  const createGoalContribution = useCreateGoalContributionMutation()
  const form = useForm({
    resolver: zodResolver(CreateGoalContributionParamsSchema)
  })

  const handleSubmit = (e: FormEvent) => {
    form.handleSubmit(data => {
      createGoalContribution.mutate({
        spaceId: props.spaceId,
        goalId: props.goalId,
        data
      })

    })(e)
  }
  return (
    <form onSubmit={handleSubmit}>
    </form>
  )
}
