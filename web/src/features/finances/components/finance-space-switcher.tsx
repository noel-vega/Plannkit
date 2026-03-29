import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDownIcon, DollarSignIcon, MoreVerticalIcon, PlusIcon, SearchIcon, SettingsIcon, UsersIcon, WalletIcon } from "lucide-react";
import type { FinanceSpace, SpaceMember, SpaceWithMembership } from "../types";
import { CreateSpaceDialog } from "./create-finance-space-form";
import { useDialog } from "@/hooks";
import { useTranslation } from "react-i18next";
import { ManageIncomesSheet } from "./manage-incomes-sheet";
import type { DialogProps } from "@/types";
import { useDeleteSpaceMemberMutation, useInviteToSpaceMutation, useListSpaceMembersQuery } from "../hooks";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useListNetworkConnections } from "@/features/network/hooks";
import { Item, ItemActions, ItemContent, ItemMedia } from "@/components/ui/item";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, type FormEvent } from "react";
import type { User } from "@/features/network/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { UserProfileSheet } from "@/features/network/components/user-profile-sheet";

type Props = {
  currentSpace: FinanceSpace,
  spaces: SpaceWithMembership[],
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
            className="h-9  max-w-96 w-full justify-start gap-2 border-border px-3 text-sm font-medium text-foreground text-left bg-card"
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

              <CommandGroup heading={"Current Space"}>

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
                  <DollarSignIcon />{t("Incomes")}
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    popover.close()
                    manageMembersSheet.handleOpenDialog()
                  }}>
                  <UsersIcon />{t("Members")}
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading={t("Other Spaces")}>
                {props.spaces.map(space => {
                  if (props.currentSpace.id === space.id) {
                    return null
                  }
                  return <CommandItem
                    key={space.id}
                    onSelect={() => {
                      props.onSpaceSelect(space)
                      popover.close()
                    }}>
                    <WalletIcon />{space.name}
                  </CommandItem>
                })}
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
  const memberUserIds = new Set(members.data?.map(x => x.userId) ?? [])
  const [member, setMember] = useState<SpaceMember>()
  const confirmRemoveDialog = useDialog()
  const [search, setSearch] = useState("")
  const connections = useListNetworkConnections("", [])
  const filteredConnections = connections.data.filter(user => !memberUserIds.has(user.id) && `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase()))

  const deleteMember = useDeleteSpaceMemberMutation()

  const handleConfirmRemove = () => {
    if (!member) return
    deleteMember.mutate(member)
    confirmRemoveDialog.onOpenChange(false)
  }

  const handleRemove = (member: SpaceMember) => {
    setMember(member)
    confirmRemoveDialog.onOpenChange(true)
  }

  const handleSearchInput = (e: FormEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value)
  }


  return (
    <>
      <Dialog open={dialog.open} onOpenChange={(open) => {
        dialog.onOpenChange(open)
        setSearch("")
      }}>
        <DialogContent className="max-h-5/6 h-full sm:max-w-xl w-full grid-rows-[auto_1fr] pb-0">
          <DialogHeader>
            <DialogTitle>Members</DialogTitle>
            <DialogDescription>View and manage members and invite connections</DialogDescription>
          </DialogHeader>
          <Tabs className="-mx-6 flex flex-col overflow-hidden gap-0.5">
            <TabsList variant="line" defaultValue="members" className="gap-4 px-6 py-0 w-full justify-start border-b">
              <TabsTrigger value="members" className="px-0 w-fit flex-0">Members {members.data?.length}</TabsTrigger>
              <TabsTrigger value="connections" className="px-0 w-fit flex-0">Connections {connections.data?.length}</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="pb-0 relative flex flex-col overflow-hidden">
              <div className="py-4 px-6 border-b ">
                <InputGroup>
                  <InputGroupInput placeholder="Search..." onChange={handleSearchInput} />
                  <InputGroupAddon>
                    <SearchIcon />
                  </InputGroupAddon>
                </InputGroup>
              </div>
              <ul className="flex-1 overflow-y-auto">
                {members.data?.map(member => (
                  <MemberItem key={member.id} member={member} onRemove={handleRemove} />
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="connections" className="pb-0 relative flex flex-col overflow-hidden">
              <div className="py-4 px-6 border-b ">
                <InputGroup>
                  <InputGroupInput placeholder="Search..." onChange={handleSearchInput} />
                  <InputGroupAddon>
                    <SearchIcon />
                  </InputGroupAddon>
                </InputGroup>
              </div>

              <ul className="flex-1 overflow-y-auto">
                {filteredConnections.map(user => (
                  <ConnectionItem key={user.id} spaceId={spaceId} user={user} />
                ))}
              </ul>
            </TabsContent>

          </Tabs>

        </DialogContent>
      </Dialog>

      <AlertDialog {...confirmRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-medium text-foreground">{member?.user.firstName} {member?.user.lastName}</span> from this space? They will lose access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  )
}

function MemberItem({ member, onRemove }: { member: SpaceMember, onRemove: (member: SpaceMember) => void }) {
  const sheet = useDialog()

  return (
    <>
      <UserProfileSheet username={member.user.username} {...sheet} />

      <Item className="hover:bg-accent px-6 cursor-pointer" onClick={() => sheet.onOpenChange(true)}>
        <ItemMedia>
          <Avatar className="size-12">
            {member.user.avatar && (
              <AvatarImage src={member.user.avatar} alt="@shadcn" />
            )}
            <AvatarFallback>{member.user.firstName[0]} {member.user.lastName[0]}</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          {member.user.firstName} {member.user.lastName}
          <div className="flex gap-1">
            <Badge variant="secondary">{member.role}</Badge>
            {member.status === "pending" && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">Pending</Badge>
            )}
          </div>
        </ItemContent>
        <ItemActions>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" onClick={(e) => e.stopPropagation()}>
                <MoreVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onRemove(member)
              }} >Remove</DropdownMenuItem>
              <DropdownMenuItem>Permissions</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ItemActions>
      </Item>
    </>
  )
}

function ConnectionItem({ spaceId, user }: { spaceId: number, user: User }) {
  const inviteToSpace = useInviteToSpaceMutation()
  const handleInviteToSpace = () => {
    inviteToSpace.mutate({ spaceId, userId: user.id, role: "viewer" })
  }

  const btnText = inviteToSpace.isPending ? "Inviting..." : inviteToSpace.isSuccess ? "Sent" : "Invite"
  const isDisabled = inviteToSpace.isPending || inviteToSpace.isSuccess
  return (
    <Item className="hover:bg-accent px-6">
      <ItemMedia>
        <Avatar className="size-12">
          {user.avatar && (
            <AvatarImage src={user.avatar} alt="@shadcn" />
          )}
          <AvatarFallback>{user.firstName[0]} {user.lastName[0]}</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        {user.firstName} {user.lastName}
      </ItemContent>
      <ItemActions>
        <Button variant="secondary" disabled={isDisabled} onClick={handleInviteToSpace}><PlusIcon />
          {btnText}
        </Button>
      </ItemActions>
    </Item>
  )
}
