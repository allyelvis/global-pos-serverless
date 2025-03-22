import { Suspense } from "react"
import { SetupOptions } from "@/components/setup/setup-options"
import { SetupSkeleton } from "@/components/setup/setup-skeleton"

export default function SetupPage() {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex items-center justify-center space-x-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          1
        </div>
        <div className="h-0.5 w-12 bg-muted-foreground/30"></div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">2</div>
        <div className="h-0.5 w-12 bg-muted-foreground/30"></div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">3</div>
        <div className="h-0.5 w-12 bg-muted-foreground/30"></div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">4</div>
      </div>
      <Suspense fallback={<SetupSkeleton />}>
        <SetupOptions />
      </Suspense>
    </div>
  )
}

