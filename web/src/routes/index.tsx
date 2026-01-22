import { DynamicIcon, type IconName } from '@/components/ui/dynamic-icon';
import { IconPicker, icons } from '@/components/ui/icon-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const today = new Date();
    return { today }
  },
  component: RouteComponent,
})


function RouteComponent() {
  const [selectedIcon, setSelectedIcon] = useState<string>("Activity")

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Icon Picker Demo</h1>

      <div className="mb-6 p-4 border rounded-lg bg-card">
        <p className="text-sm text-muted-foreground mb-2">Selected Icon:</p>
        <div className="flex items-center gap-3">
          <DynamicIcon name={selectedIcon as IconName} className="size-8" />
          <code className="text-sm bg-muted px-2 py-1 rounded">{selectedIcon}</code>
        </div>
      </div>


      <Popover>
        <PopoverTrigger>
          Icon picker
        </PopoverTrigger>
        <PopoverContent className="h-96 overflow-auto">
          <IconPicker
            value={selectedIcon}
            onChange={setSelectedIcon}
            icons={icons}
          />
        </PopoverContent>

      </Popover>
    </div>
  )
}

