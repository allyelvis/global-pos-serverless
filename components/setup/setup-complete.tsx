"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export function SetupComplete() {
  const router = useRouter()

  const handleGoToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-center text-2xl">Setup Complete!</CardTitle>
        <CardDescription className="text-center">
          Your POS system has been successfully configured and is ready to use.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted p-4">
          <h3 className="font-medium">What's Next?</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            <li>Add your products and categories</li>
            <li>Set up your staff accounts</li>
            <li>Customize your business settings</li>
            <li>Start processing sales</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleGoToDashboard}>
          Go to Dashboard
        </Button>
      </CardFooter>
    </Card>
  )
}

