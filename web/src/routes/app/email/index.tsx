import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { format } from 'date-fns'
import z from 'zod/v3'

export const Route = createFileRoute('/app/email/')({
  component: RouteComponent,
})

const EmailSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  date: z.coerce.date(),
  snippet: z.string(),
  body: z.string()
})

async function getEmails() {
  const response = await fetch("/api/emails")
  const data = await response.json()
  return EmailSchema.array().parse(data)
}

function RouteComponent() {
  const { data } = useQuery({
    queryKey: ["emails"],
    queryFn: getEmails
  })

  const handleLogin = () => {
    window.location.href = "http://localhost:8080/auth/google/login"
  }
  return <div className="max-w-full overflow-hidden">
    <Button onClick={handleLogin}>Login</Button>
    <ul className="divide-y border">
      {data?.map(x => (
        <li className="p-2 min-w-0">
          <div className="flex justify-between gap-2 min-w-0">
            <p className="font-bold truncate">{x.from.split(" ")[0].replaceAll('"', '')}</p>
            <p className="shrink-0 text-xs">{format(x.date, "p")}</p>
          </div>

          <p className="text-xs truncate">{x.subject}</p>
        </li>
      ))}
    </ul>
  </div>
}
