import { Page } from '@/components/layout/page'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpensesTabContent } from '@/features/auth/finances/components/expenses-tab-content'
import { OverviewTabContent } from '@/features/auth/finances/components/overview-tab-content'
import { getUseListFinanceSpacesQueryOptions, useListFinanceSpaces } from '@/features/finances/hooks'
import { queryClient } from '@/lib/react-query'
import { createFileRoute } from '@tanstack/react-router'



export const Route = createFileRoute('/app/finances/')({
  beforeLoad: async () => {
    const spaces = await queryClient.ensureQueryData(getUseListFinanceSpacesQueryOptions())
    return { spaces }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const rtContext = Route.useRouteContext()
  const spaces = useListFinanceSpaces({ initialData: rtContext.spaces })
  console.log(spaces.data)

  return (
    <Page title="Finances">
      <div className="max-w-6xl">
        <Tabs defaultValue="overview">
          <div className="flex gap-2">
            <div className="max-w-[18rem] w-full">
              <Select defaultValue={spaces.data[0].id.toString()} >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {spaces.data.map(x => (
                      <SelectItem key={x.id} value={x.id.toString()}>{x.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <TabsList className=''>
              <TabsTrigger value="overview" className="">Overview</TabsTrigger>
              <TabsTrigger value="expenses" className=" ">Expenses</TabsTrigger>
            </TabsList>
          </div>
          <Separator className="my-2" />

          <TabsContent value="overview" className='pb-4'>
            <OverviewTabContent />
          </TabsContent>

          <TabsContent value="expenses" className="pb-4">
            <ExpensesTabContent />
          </TabsContent>
        </Tabs>
      </div>
    </Page>
  )
}





