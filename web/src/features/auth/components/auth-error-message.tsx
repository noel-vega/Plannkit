
export function AuthErrorMessage({ message }: { message?: string }) {
  if (!message) return
  return (
    <div className="p-4 bg-red-100/50 border border-destructive rounded-lg font-medium text-red-700">
      * {message}
    </div>
  )
}
