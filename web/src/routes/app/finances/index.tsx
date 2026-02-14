import { Page } from '@/components/layout/page'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpensesTabContent } from '@/features/auth/finances/components/expenses-tab-content'
import { OverviewTabContent } from '@/features/auth/finances/components/overview-tab-content'
import { createFileRoute } from '@tanstack/react-router'



export const Route = createFileRoute('/app/finances/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Page title="Finances">
      <div className="max-w-6xl">
        <Tabs defaultValue="overview">
          <TabsList variant="line" className='-ml-5 -mt-1'>
            <TabsTrigger value="overview" className="p-4">Overview</TabsTrigger>
            <TabsTrigger value="expenses" className=" p-4">Expenses</TabsTrigger>
          </TabsList>

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





