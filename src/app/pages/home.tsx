import { env } from '@/config/env'

export default function HomePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
      <h1 className="text-2xl font-semibold">{env.VITE_APP_NAME}</h1>
      <p className="text-muted-foreground">Welcome to {env.VITE_APP_NAME} HRMS.</p>
    </div>
  )
}
