import { Page } from '@/components/layout/page'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
          <div className="flex justify-between">
            <TabsList variant="line" className='-ml-5 -mt-1'>
              <TabsTrigger value="overview" className="p-4">Overview</TabsTrigger>
              <TabsTrigger value="expenses" className=" p-4">Expenses</TabsTrigger>
            </TabsList>
            <div className="max-w-lg w-full">
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
          </div>

          <TabsContent value="overview" className='py-8'>
            <OverviewTabContent />
          </TabsContent>

          <TabsContent value="expenses" className="py-8">
            <ExpensesTabContent />
          </TabsContent>
        </Tabs>
      </div>
    </Page>
  )
}





