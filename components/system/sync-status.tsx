"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Check, AlertTriangle, Clock } from "lucide-react"
import { getSyncStatus, processPendingSyncOperations } from "@/lib/services/sync-service"
import { toast } from "@/components/ui/use-toast"

export function SyncStatus() {
  const [status, setStatus] = useState<{
    lastSyncAttempt: string | null
    lastSyncSuccess: boolean
    pendingOperations: number
  }>({
    lastSyncAttempt: null,
    lastSyncSuccess: true,
    pendingOperations: 0,
  })
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    loadSyncStatus()

    // Refresh status every minute
    const interval = setInterval(loadSyncStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadSyncStatus = async () => {
    try {
      const data = await getSyncStatus()
      setStatus(data)
    } catch (error) {
      console.error("Failed to load sync status:", error)
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      setProgress(10)

      // Process pending operations
      const result = await processPendingSyncOperations()
      setProgress(90)

      if (result.success) {
        toast({
          title: "Sync Completed",
          description: `Processed ${result.processed} operations. Failed: ${result.failed}`,
          variant: result.failed > 0 ? "destructive" : "default",
        })
      } else {
        toast({
          title: "Sync Failed",
          description: "Failed to process sync operations",
          variant: "destructive",
        })
      }

      // Refresh status
      await loadSyncStatus()
      setProgress(100)
    } catch (error) {
      toast({
        title: "Sync Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        setSyncing(false)
        setProgress(0)
      }, 1000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Data Synchronization
          <Badge variant={status.lastSyncSuccess ? "default" : "destructive"}>
            {status.lastSyncSuccess ? "Healthy" : "Issues Detected"}
          </Badge>
        </CardTitle>
        <CardDescription>Manage data synchronization between online and offline operations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {syncing && <Progress value={progress} className="mb-2" />}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Sync Attempt:</span>
            <span className="text-sm">
              {status.lastSyncAttempt ? new Date(status.lastSyncAttempt).toLocaleString() : "Never"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Sync Status:</span>
            <span className="text-sm flex items-center">
              {status.lastSyncSuccess ? (
                <Check className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="mr-1 h-4 w-4 text-amber-500" />
              )}
              {status.lastSyncSuccess ? "Successful" : "Failed"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pending Operations:</span>
            <span className="text-sm flex items-center">
              <Clock className="mr-1 h-4 w-4 text-blue-500" />
              {status.pendingOperations}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSync} disabled={syncing} className="w-full">
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Now"}
        </Button>
      </CardFooter>
    </Card>
  )
}

