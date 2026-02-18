import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDownIcon, PlusIcon, WalletIcon } from "lucide-react";
import type { FinanceSpace } from "../types";
import { CreateFinanceSpaceDialog } from "./create-finance-space";
import { useDialog } from "@/hooks";

type Props = {
  currentSpace: FinanceSpace,
  spaces: FinanceSpace[],
  onSpaceSelect: (space: FinanceSpace) => void,
  onCreate: (space: FinanceSpace) => void
  onSettings: (space: FinanceSpace) => void
}

export function FinanceSpaceSwitcher(props: Props) {
  const createSpaceDialog = useDialog()
  const popover = useDialog()
  return (
    <Popover {...popover}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9  w-full justify-start gap-2 border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm text-left"
        >
          <WalletIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate max-w-[180px]">
            {props.currentSpace.name ?? "Select space"}
          </span>
          <ChevronsUpDownIcon className=" h-3.5 w-3.5 shrink-0 text-muted-foreground ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command className="max-w-sm w-full rounded-lg border" onSelect={() => {
          popover.onOpenChange(false)
        }}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading={props.currentSpace.name}>
              <CommandItem
                onSelect={() => {
                  props.onSettings(props.currentSpace)
                  popover.close()
                }}>
                Settings
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Spaces">
              {props.spaces.map(space => (
                <CommandItem
                  key={space.id}
                  onSelect={() => {
                    props.onSpaceSelect(space)
                    popover.close()
                  }}>
                  <WalletIcon />{space.name}
                </CommandItem>
              ))}
              <CommandItem onSelect={createSpaceDialog.handleOpenDialog}><PlusIcon />Create Space</CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </CommandList>
        </Command>
      </PopoverContent>
      <CreateFinanceSpaceDialog {...createSpaceDialog} onSuccess={props.onCreate} />
    </Popover>
  )
}
