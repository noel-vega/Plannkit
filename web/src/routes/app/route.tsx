import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '@/components/layout';

export const Route = createFileRoute('/app')({
  component: AppLayout,
})

