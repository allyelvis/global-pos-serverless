"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { saveDatabaseConfig, testDatabaseConnection } from "@/lib/db/config"
import { Loader2 } from "lucide-react"

export function DatabaseSetup() {
  const [dbType, setDbType] = useState<"vercel-kv" | "redis" | "upstash">("vercel-kv")
  const [dbUrl, setDbUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      const result = await testDatabaseConnection(dbType, dbType !== "vercel-kv" ? dbUrl : undefined)
      if (result.success) {
        toast({
          title: "Connection successful",
          description: "Successfully connected to the database",
        })
      } else {
        toast({
          title: "Connection failed",
          description: result.message || "Failed to connect to the database",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await saveDatabaseConfig(dbType, dbType !== "vercel-kv" ? dbUrl : undefined)
      if (result.success) {
        toast({
          title: "Database configured",
          description: "Database has been configured successfully",
        })
        router.push("/setup/admin")
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to configure database",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Database Setup</CardTitle>
        <CardDescription>Configure your database connection</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Database Type</Label>
            <RadioGroup value={dbType} onValueChange={(value) => setDbType(value as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vercel-kv" id="vercel-kv" />
                <Label htmlFor="vercel-kv" className="cursor-pointer">
                  Vercel KV (Recommended)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="redis" id="redis" />
                <Label htmlFor="redis" className="cursor-pointer">
                  Redis
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upstash" id="upstash" />
                <Label htmlFor="upstash" className="cursor-pointer">
                  Upstash
                </Label>
              </div>
            </RadioGroup>
          </div>

          {dbType !== "vercel-kv" && (
            <div className="space-y-2">
              <Label htmlFor="dbUrl">Database URL</Label>
              <Input
                id="dbUrl"
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                placeholder={dbType === "redis" ? "redis://username:password@host:port" : "https://upstash-url"}
                required={dbType !== "vercel-kv"}
              />
            </div>
          )}

          {dbType === "vercel-kv" && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p>Using Vercel KV integration. Make sure you have added the Vercel KV integration to your project.</p>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleTestConnection}
            disabled={isTesting || (dbType !== "vercel-kv" && !dbUrl)}
          >
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading || (dbType !== "vercel-kv" && !dbUrl)}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Configuration"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

