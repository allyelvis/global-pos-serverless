"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Database, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function RedisStatus() {
  const [status, setStatus] = useState<string>("loading")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setStatus(data.redis)
    } catch (error) {
      console.error("Failed to fetch Redis status:", error)
      setStatus("error")
      toast({
        title: "Error",
        description: "Failed to fetch Redis status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const getStatusBadge = () => {
    switch (status) {
      case "connected-kv-rest":
      case "connected-kv":
      case "connected-redis":
        return <Badge className="bg-green-500">Connected</Badge>
      case "fallback-memory":
        return (
          <Badge variant="outline" className="bg-yellow-500 text-yellow-900">
            Fallback
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "loading":
      default:
        return <Badge variant="secondary">Loading</Badge>
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "connected-kv-rest":
      case "connected-kv":
      case "connected-redis":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "fallback-memory":
        return <Database className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />
      case "loading":
      default:
        return <RefreshCw className="h-5 w-5 animate-spin" />
    }
  }

  const getStatusDescription = () => {
    switch (status) {
      case "connected-kv-rest":
        return "Connected to Vercel KV via REST API"
      case "connected-kv":
        return "Connected to Vercel KV"
      case "connected-redis":
        return "Connected to Redis"
      case "fallback-memory":
        return "Using in-memory storage (data will not persist)"
      case "error":
        return "Failed to connect to database"
      case "loading":
      default:
        return "Checking database connection..."
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Status</CardTitle>
        <CardDescription>Current status of your database connection</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-md border p-4">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-medium">Redis Database</h3>
              <p className="text-sm text-muted-foreground">{getStatusDescription()}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={fetchStatus} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

