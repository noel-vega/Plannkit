import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDownIcon, PlusIcon, WalletIcon } from "lucide-react";
import type { FinanceSpace } from "../types";
import { CreateFinanceSpaceDialog } from "./create-finance-space-dialog";
import { useDialog } from "@/hooks";

export function FinanceSpaceSwitcher({ value, spaces, onValueChange }: { value: FinanceSpace, spaces: FinanceSpace[], onValueChange: (val: FinanceSpace) => void }) {
  const createSpaceDialog = useDialog()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 max-w-72 w-full justify-start gap-2 border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm text-left"
        >
          <WalletIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate max-w-[180px]">
            {value?.name ?? "Select space"}
          </span>
          <ChevronsUpDownIcon className=" h-3.5 w-3.5 shrink-0 text-muted-foreground ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command className="max-w-sm w-full rounded-lg border">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Spaces">
              {spaces.map(space => (
                <CommandItem><WalletIcon />{space.name}</CommandItem>
              ))}
              <CommandItem onSelect={createSpaceDialog.handleOpenDialog}><PlusIcon />Create Space</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>Profile</CommandItem>
              <CommandItem>Billing</CommandItem>
              <CommandItem>Settings</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
      <CreateFinanceSpaceDialog {...createSpaceDialog} />
    </Popover>
  )
}
