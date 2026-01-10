import { cn } from "@/lib/utils"
import type { Contribution, Habit } from "@/types"
import { format, setDayOfYear } from "date-fns"
import { Tooltip } from 'react-tooltip'

type Cell = {
  checked: boolean
  day: number
}

export function generateCells() {
  const cells: Cell[] = []
  for (let day = 1; day <= 365; day++) {
    cells.push({ checked: false, day })
  }
  return cells
}


export function ContributionsGrid(props: { habit: Habit; contributions: Map<number, Contribution> }) {
  const cells = generateCells()
  return (
    <>
      <Tooltip id="contrib-tooltip" delayShow={500} />
      <ul className="gap-1 grid grid-rows-7 grid-flow-col">
        {cells.map((cell) => {
          const completions = props.contributions.get(cell.day)?.completions ?? 0
          const progress = completions / props.habit.completionsPerDay * 100
          return <li
            data-tooltip-id="contrib-tooltip"
            data-tooltip-content={format(setDayOfYear(new Date(), cell.day), "MMMM do")}
            data-tooltip-place="top"
            className={cn("h-[12px] w-[12px] rounded-[.18rem] border text-xs bg-secondary overflow-clip",
              {
                "bg-[#c6e48b] border-[#c6e48b]": progress > 0,
                "bg-[#7bc96f] border-[#7bc96f]": progress > 25,
                "bg-[#239a3b] border-[#239a3b]": progress > 75,
                "bg-[#196127] border-[#196127]": progress === 100,
              }
            )} key={cell.day}></li>
        })}
      </ul>
    </>
  )
}
