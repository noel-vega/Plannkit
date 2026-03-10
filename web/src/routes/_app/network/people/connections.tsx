import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { useDiscoverUsersQuery } from '@/features/network/hooks'
import { createFileRoute, Link } from '@tanstack/react-router'
import { SearchIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebounce } from 'use-debounce'

export const Route = createFileRoute('/_app/network/people/connections')({
  component: RouteComponent,
})

function RouteComponent() {

  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [value] = useDebounce(search, 500)
  const users = useDiscoverUsersQuery({ search: value, filter: "connections" }, [])

  const handleSearchInput = (e: FormEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value)
  }
  return (

    <>
      <Field className="mb-4">
        <Input icon={SearchIcon} onInput={handleSearchInput} placeholder={t("Search connections...")} />
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
              </Item>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
