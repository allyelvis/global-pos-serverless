"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { saveDatabaseConfig } from "@/lib/db/config"
import { Loader2, Zap, Settings } from "lucide-react"

export function SetupOptions() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState<"quick" | "custom" | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleQuickSetup = async () => {
    setSelectedOption("quick")
    setIsLoading(true)
    try {
      // Use Vercel KV as the default database
      const result = await saveDatabaseConfig("vercel-kv")
      if (result.success) {
        toast({
          title: "Quick setup successful",
          description: "Default database has been configured successfully",
        })
        router.push("/setup/admin")
      } else {
        toast({
          title: "Setup failed",
          description: result.message || "Failed to configure default database",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Setup failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setSelectedOption(null)
    }
  }

  const handleCustomSetup = () => {
    setSelectedOption("custom")
    router.push("/setup/database")
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="relative overflow-hidden">
        {selectedOption === "quick" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg font-medium">Setting up your system...</p>
            </div>
          </div>
        )}
        <CardHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Get started quickly with our recommended settings</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Uses Vercel KV for database
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Default configuration
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Ready in seconds
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Can be customized later
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleQuickSetup} disabled={isLoading}>
            {isLoading && selectedOption === "quick" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Quick Setup"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="relative overflow-hidden">
        {selectedOption === "custom" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg font-medium">Redirecting to custom setup...</p>
            </div>
          </div>
        )}
        <CardHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Custom Setup</CardTitle>
          <CardDescription>Configure your system with custom settings</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Choose your database provider
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Custom configuration options
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Advanced settings
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Complete control over setup
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={handleCustomSetup} disabled={isLoading}>
            Custom Setup
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

