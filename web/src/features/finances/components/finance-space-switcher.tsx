import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDownIcon, DollarSignIcon, PlusIcon, SettingsIcon, UsersIcon, WalletIcon } from "lucide-react";
import type { FinanceSpace } from "../types";
import { CreateSpaceDialog } from "./create-finance-space-form";
import { useDialog } from "@/hooks";
import { useTranslation } from "react-i18next";
import { ManageIncomesSheet } from "./manage-incomes-sheet";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { DialogProps } from "@/types";
import { useListSpaceMembersQuery } from "../hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiscoverUsersQuery } from "@/features/network/hooks";

type Props = {
  currentSpace: FinanceSpace,
  spaces: FinanceSpace[],
  onSpaceSelect: (space: FinanceSpace) => void,
  onCreate: (space: FinanceSpace) => void
  onSettings: (space: FinanceSpace) => void
}

export function FinanceSpaceSwitcher(props: Props) {
  const { t } = useTranslation()
  const createSpaceDialog = useDialog()
  const manageIncomeSourcesSheet = useDialog()
  const manageMembersSheet = useDialog()
  const popover = useDialog()
  return (
    <>
      <Popover {...popover}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9  max-w-96 w-full justify-start gap-2 border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm text-left"
          >
            <WalletIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate max-w-45">
              {props.currentSpace.name ?? t("Select space")}
            </span>
            <ChevronsUpDownIcon className=" h-3.5 w-3.5 shrink-0 text-muted-foreground ml-auto" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start" style={{ width: "var(--radix-popover-trigger-width)" }} >
          <Command className="w-full rounded-lg border" onSelect={() => {
            popover.onOpenChange(false)
          }}>
            <CommandInput placeholder={t("Type a command or search...")} />
            <CommandList>
              <CommandEmpty>{t("No results found.")}</CommandEmpty>

              <CommandGroup heading={props.currentSpace.name}>

                <CommandItem
                  onSelect={() => {
                    props.onSettings(props.currentSpace)
                    popover.close()
                  }}>
                  <SettingsIcon />{t("Settings")}
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    popover.close()
                    manageIncomeSourcesSheet.handleOpenDialog()
                  }}>
                  <DollarSignIcon />{t("Incomes Sources")}
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    popover.close()
                    manageMembersSheet.handleOpenDialog()
                  }}>
                  <UsersIcon />{t("Members")}
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading={t("Spaces")}>
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
                <CommandItem onSelect={createSpaceDialog.handleOpenDialog}><PlusIcon />{t("Create Space")}</CommandItem>
              </CommandGroup>
              <CommandSeparator />
            </CommandList>
          </Command>
        </PopoverContent>
        <CreateSpaceDialog {...createSpaceDialog} onSuccess={props.onCreate} />
      </Popover>

      <ManageIncomesSheet spaceId={props.currentSpace.id} {...manageIncomeSourcesSheet} />
      <ManageMembersDialog spaceId={props.currentSpace.id} {...manageMembersSheet} />
    </>
  )
}

function ManageMembersDialog({ spaceId, ...dialog }: { spaceId: number } & DialogProps) {
  const members = useListSpaceMembersQuery({ spaceId })
  const connections = useDiscoverUsersQuery({ search: "", filter: "connections" }, [])

  return (
    <Dialog {...dialog}>
      <DialogContent className="max-h-5/6 h-full grid-rows-[auto_1fr]">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
        </DialogHeader>
        <Tabs className="overflow-hidden">
          <TabsList variant="line" defaultValue="members">
            <TabsTrigger value="members">Members {members.data?.length}</TabsTrigger>
            <TabsTrigger value="connections">Connections {connections.data?.length}</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <ul>
              {members.data?.map(member => (
                <li>{member.user.firstName} {member.user.lastName} {member.role}</li>
              ))}
            </ul>
          </TabsContent>


          <TabsContent value="connections">
            <ul>
              {members.data?.map(member => (
                <li>{member.user.firstName} {member.user.lastName} {member.role}</li>
              ))}
            </ul>
          </TabsContent>

        </Tabs>

      </DialogContent>
    </Dialog>
  )
}
