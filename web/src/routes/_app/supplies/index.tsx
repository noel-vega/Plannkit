import { Container } from '@/components/layout/container'
import { Page } from '@/components/layout/page'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CatalogView } from '@/features/supplies/components/catalog-view'
import { InventoryView } from '@/features/supplies/components/inventory-view'
import { ListsView } from '@/features/supplies/components/lists-view'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_app/supplies/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  return (
    <Page>
      <Container>
        <Tabs defaultValue="inventory" className="@container">
          <TabsList>
            <TabsTrigger value="inventory">{t('Inventory')}</TabsTrigger>
            <TabsTrigger value="lists">{t('Lists')}</TabsTrigger>
            <TabsTrigger value="catalog">{t('Catalog')}</TabsTrigger>
          </TabsList>
          <TabsContent value="inventory" className="mt-4">
            <InventoryView />
          </TabsContent>
          <TabsContent value="lists" className="mt-4">
            <ListsView />
          </TabsContent>
          <TabsContent value="catalog" className="mt-4">
            <CatalogView />
          </TabsContent>
        </Tabs>
      </Container>
    </Page>
  )
}
