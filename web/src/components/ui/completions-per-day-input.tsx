import type { ChangeEvent } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { MinusIcon, PlusIcon } from "lucide-react";

export function CompletionsPerDayInput(props: { value: number; onChange: (val: number) => void }) {
  const handleMinus = () => {
    if (props.value <= 1) return
    props.onChange(props.value - 1)
  }

  const handlePlus = () => props.onChange(props.value + 1)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    props.onChange(e.currentTarget.valueAsNumber)
  }
  return (
    <div className="flex gap-4">
      <Input type="number" className="max-w-[75px] outline-none" min={1} value={props.value} onChange={handleInputChange} />
      <div className="space-x-2">
        <Button type="button" variant="secondary" size="icon" className="border" onClick={handleMinus}><MinusIcon /></Button>
        <Button type="button" variant="secondary" size="icon" className="border" onClick={handlePlus}><PlusIcon /></Button>
      </div>
    </div>
  )
}
