import { Page } from '@/components/layout/page'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { AddItemForm, type AddItemFormData } from '@/features/groceries/components/add-item-form'
import { GroceryListitem } from '@/features/groceries/components/grocery-list-item'
import type { GroceryListItem } from '@/features/groceries/types'
import { createFileRoute } from '@tanstack/react-router'
import { BookTextIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/app/groceries/')({
  component: RouteComponent,
})


function RouteComponent() {
  const { t } = useTranslation()
  const [items, setItems] = useState<GroceryListItem[]>([])

  const handleAddItem = (item: AddItemFormData) => {
    setItems(prev => [{ id: Math.random(), inCart: false, ...item }, ...prev])
  }

  const toggleItemInCart = (item: GroceryListItem) => {
    setItems(prev => prev.map(x => {
      if (x.id !== item.id) return x
      return { ...x, inCart: !item.inCart }
    }))
  }

  const handleCheckout = () => {
    setItems(prev => prev.filter(x => !x.inCart))
  }

  const handleClear = () => {
    setItems([])
  }

  const handleDelete = (item: GroceryListItem) => {
    setItems(prev => prev.filter(x => x.id !== item.id))
  }

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setItems(prev => prev.map(x => x.id === itemId ? { ...x, quantity } : x))
  }

  return (
    <Page title="Groceries">
      <div className="max-w-5xl h-full flex flex-col pb-2">

        <h2 className="text-xl font-medium mb-4">{t("Shopping List")} ({items.length})</h2>
        <div className="flex gap-2 items-end mb-4">
          <AddItemForm className='flex-1' onSubmit={handleAddItem} />
          {/* <Button variant="secondary"> */}
          {/*   <BookTextIcon /> */}
          {/*   {t("Catalog")} */}
          {/* </Button> */}
        </div>



        <div className="flex-1">
          {items.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              {t("Add some groceries to your list.")}
            </p>
          ) : (
            <ul className="flex-1 divide-y border rounded-lg">
              {items.map(x => (
                <li key={x.id} className="hover:bg-secondary/30">
                  <GroceryListitem item={x} onClick={() => toggleItemInCart(x)} onDelete={() => handleDelete(x)} onQuantityChange={handleQuantityChange} />
                </li>
              ))}
            </ul>
          )}
        </div>


        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="secondary" className="flex-1" size="lg" disabled={items.length === 0}>{t("Clear")}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("Are you want to clear items?")}</AlertDialogTitle>
                <AlertDialogDescription>{t("This will clear all items from your list.")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleClear}>{t("Proceed")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="secondary" className="flex-1" size="lg" disabled={items.filter(x => x.inCart).length === 0}>{t("Checkout")}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("Are you want to checkout?")}</AlertDialogTitle>
                <AlertDialogDescription>{t("This will clear all checked items. Checkouts can be viewd in your groceries history.")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleCheckout}>{t("Proceed")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Page>
  )
}
