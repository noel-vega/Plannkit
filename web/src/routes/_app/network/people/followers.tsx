import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { AcceptFollowButton } from '@/features/network/components/follow-button'
import { useDiscoverUsersQuery } from '@/features/network/hooks'
import { createFileRoute, Link } from '@tanstack/react-router'
import { SearchIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebounce } from 'use-debounce'

export const Route = createFileRoute('/_app/network/people/followers')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [value] = useDebounce(search, 500)
  const users = useDiscoverUsersQuery({ search: value, filter: "followers" }, [])

  const handleSearchInput = (e: FormEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value)
  }
  return (
    <>
      <Field className="mb-4">
        <Input icon={SearchIcon} onInput={handleSearchInput} placeholder={t("Search followers...")} />
      </Field>
      <ul className="divide-y">
        {users.data.map(user => (
          <li key={user.id} >
            <Link to="/u/$username" params={{ username: user.username }} className="p-4 block">
              <Item>
                <ItemMedia>
                  <Avatar className="size-16">
                    {user.avatar && (
                      <AvatarImage src={user.avatar} alt="@shadcn" />
                    )}
                    <AvatarFallback>{user.firstName[0]} {user.lastName[0]}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {user.firstName} {user.lastName}
                  </ItemTitle>
                </ItemContent>
                <ItemActions>
                  {user.followStatus === "pending" && <AcceptFollowButton />}
                </ItemActions>
              </Item>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
