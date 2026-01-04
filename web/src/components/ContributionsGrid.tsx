import { cn } from "@/lib/utils"
import type { Contribution } from "@/types"
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


export function ContributionsGrid(props: { contributions: Map<number, Contribution> }) {
  const cells = generateCells()
  return (
    <>
      <Tooltip id="contrib-tooltip" delayShow={500} />
      <ul className="gap-1 grid grid-rows-7 grid-flow-col">
        {cells.map((cell) => (
          <li
            data-tooltip-id="contrib-tooltip"
            data-tooltip-content={format(setDayOfYear(new Date(), cell.day), "MMMM do")}
            data-tooltip-place="top"
            className={cn("size-4 cursor-pointer rounded border text-xs bg-blue-500/10", "hover:border-blue-500",
              {
                "bg-blue-500": props.contributions.has(cell.day)
              }
            )} key={cell.day}></li>
        ))}
      </ul>
    </>
  )
}
