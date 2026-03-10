export function PageHeader(props: { title: string }) {
  return (
    <div className="border-b py-4 px-8">
      <div className="flex items-center gap-6">
        <h2 className="font-semibold text-lg">{props.title}</h2>
      </div>
    </div>
  )
}
