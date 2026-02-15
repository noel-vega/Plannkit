import { cn, getCompletedHabits, getDaysAround } from "@/lib/utils"
import { format, getDayOfYear } from "date-fns"
import { CheckIcon, TriangleIcon } from "lucide-react"
import type { HabitWithContributions } from "../types"


export function WeekdayIndicatorInternal(props: { habits: HabitWithContributions[], day: Date, around: number, className?: string }) {
  const days = getDaysAround(props.day, props.around)
  return (
    <ul className={cn("flex gap-3 relative", props.className)}>
      {days.map((day, i) => {
        const { isDone } = getCompletedHabits({ day, habits: props.habits })
        return (
          <li key={i} className="flex-1">
            <div className={cn("p-4 rounded-lg hover:bg-secondary/30 flex flex-col items-center gap-3 border", {
              "bg-secondary hover:bg-secondary": getDayOfYear(day) === getDayOfYear(new Date())
            })}>
              {day.getDate() === new Date().getDate() && (
                <TriangleIcon className="rotate-180 absolute top-1 -translate-y-3/4 fill-blue-500 stroke-blue-500" size={16} />
              )}
              <p>{format(day, 'EEE')}</p>
              <p>{day.getDate()}</p>
              <div className={cn("size-10 rounded-full bg-white border-2 flex items-center justify-center", {
                "bg-green-600 text-white border-green-600": isDone
              })}>
                {isDone && (
                  <CheckIcon />
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function WeekDayIndicator({ habits }: { habits: HabitWithContributions[] }) {
  return (
    <div className="@container">
      <div className="@xl:hidden">
        <WeekdayIndicatorInternal habits={habits} day={new Date()} around={1} />
      </div>
      <div className="hidden @xl:block @4xl:hidden">
        <WeekdayIndicatorInternal habits={habits} day={new Date()} around={2} />
      </div>
      <div className="hidden @4xl:block">
        <WeekdayIndicatorInternal habits={habits} day={new Date()} around={3} />
      </div>
    </div>
  )
}
