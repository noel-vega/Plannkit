import { Item, ItemContent } from "@/components/ui/item"

export function AuthErrorMessage({ message }: { message?: string }) {
  if (!message) return
  return (
    <Item variant="outline" className="border-red-500 text-red-500 bg-red-100/30">
      <ItemContent>
        * {message}
      </ItemContent>
    </Item>
  )
}
