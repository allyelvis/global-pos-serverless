"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, ExternalLink, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { VercelIntegrationStatus } from "../vercel-integration-status"

export function VercelIntegrationSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isKvEnabled, setIsKvEnabled] = useState(false)
  const [redisStatus, setRedisStatus] = useState("unknown")
  const { toast } = useToast()

  useEffect(() => {
    fetchRedisStatus()
  }, [])

  const fetchRedisStatus = async () => {
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setRedisStatus(data.redis)

      // Check if KV is enabled
      setIsKvEnabled(data.redis === "connected-kv" || data.redis === "connected-kv-rest")
    } catch (error) {
      console.error("Failed to fetch Redis status:", error)
    }
  }

  const handleRefreshStatus = async () => {
    setIsLoading(true)
    try {
      await fetchRedisStatus()
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Could not refresh integration status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <VercelIntegrationStatus />

      <Card>
        <CardHeader>
          <CardTitle>Vercel Integration Settings</CardTitle>
          <CardDescription>Configure your Vercel platform integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {redisStatus !== "connected-kv" && redisStatus !== "connected-kv-rest" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Vercel KV Not Detected</AlertTitle>
              <AlertDescription>
                For optimal performance, we recommend adding the Vercel KV integration to your project.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Vercel KV (Redis)</h3>
                <p className="text-sm text-muted-foreground">Use Vercel KV for data storage</p>
              </div>
              <Switch
                checked={isKvEnabled}
                onCheckedChange={setIsKvEnabled}
                disabled={redisStatus !== "connected-kv" && redisStatus !== "connected-kv-rest"}
              />
            </div>

            <div className="rounded-md border p-4">
              <h4 className="font-medium">Connection Information</h4>
              <div className="mt-2 space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="kv-status">Status</Label>
                  <Input
                    id="kv-status"
                    value={
                      redisStatus === "connected-kv"
                        ? "Connected (Native)"
                        : redisStatus === "connected-kv-rest"
                          ? "Connected (REST API)"
                          : redisStatus === "fallback-memory"
                            ? "Using Memory Fallback"
                            : redisStatus === "error"
                              ? "Connection Error"
                              : "Not Connected"
                    }
                    readOnly
                    disabled
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="kv-region">Region</Label>
                  <Input
                    id="kv-region"
                    value={redisStatus === "connected-kv" || redisStatus === "connected-kv-rest" ? "Global" : "N/A"}
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium">Environment Variables</h3>
            <p className="text-sm text-muted-foreground">Required environment variables for your application</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-mono text-sm">KV_URL</p>
                  <p className="text-xs text-muted-foreground">Vercel KV connection URL</p>
                </div>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                  {redisStatus === "connected-kv" ? "✓" : "×"}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-mono text-sm">KV_REST_API_TOKEN</p>
                  <p className="text-xs text-muted-foreground">Vercel KV REST API token</p>
                </div>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                  {redisStatus === "connected-kv-rest" ? "✓" : "×"}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-mono text-sm">KV_REST_API_URL</p>
                  <p className="text-xs text-muted-foreground">Vercel KV REST API URL</p>
                </div>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                  {redisStatus === "connected-kv-rest" ? "✓" : "×"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleRefreshStatus} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Status
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="gap-1"
            onClick={() => window.open("https://vercel.com/dashboard/stores", "_blank")}
          >
            <span>Manage in Vercel</span>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

