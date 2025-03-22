import { SetupComplete } from "@/components/setup/setup-complete"

export default function SetupCompletePage() {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex items-center justify-center space-x-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">✓</div>
        <div className="h-0.5 w-12 bg-primary"></div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">✓</div>
        <div className="h-0.5 w-12 bg-primary"></div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">✓</div>
        <div className="h-0.5 w-12 bg-primary"></div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          4
        </div>
      </div>
      <SetupComplete />
    </div>
  )
}

