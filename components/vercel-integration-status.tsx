"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Database, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface IntegrationStatus {
  name: string
  status: "connected" | "not-connected" | "error"
  message?: string
}

export function VercelIntegrationStatus() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    { name: "Vercel KV (Redis)", status: "not-connected" },
    { name: "Environment Variables", status: "not-connected" },
  ])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const checkIntegrations = async () => {
      try {
        // Check health endpoint
        const healthResponse = await fetch("/api/health")
        const healthData = await healthResponse.json()

        // Update KV status
        const updatedIntegrations = [...integrations]

        // Check KV status
        if (healthData.redis === "connected") {
          updatedIntegrations[0] = {
            ...updatedIntegrations[0],
            status: "connected",
            message: "Connected to Vercel KV",
          }
        } else if (healthData.redis === "fallback") {
          updatedIntegrations[0] = {
            ...updatedIntegrations[0],
            status: "not-connected",
            message: "Using fallback storage",
          }
        } else {
          updatedIntegrations[0] = {
            ...updatedIntegrations[0],
            status: "error",
            message: "Connection error",
          }
        }

        // Check environment variables
        if (healthData.env === "configured") {
          updatedIntegrations[1] = {
            ...updatedIntegrations[1],
            status: "connected",
            message: "Environment variables configured",
          }
        } else {
          updatedIntegrations[1] = {
            ...updatedIntegrations[1],
            status: "not-connected",
            message: "Missing required environment variables",
          }
        }

        setIntegrations(updatedIntegrations)
      } catch (error) {
        console.error("Failed to check integrations:", error)
        toast({
          title: "Integration Check Failed",
          description: "Could not verify integration status",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkIntegrations()
  }, [integrations, toast])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-500">Connected</Badge>
      case "not-connected":
        return <Badge variant="outline">Not Connected</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "not-connected":
        return <Database className="h-5 w-5 text-muted-foreground" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />
      default:
        return <Database className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vercel Integrations</CardTitle>
        <CardDescription>Status of your Vercel platform integrations</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <p>Checking integration status...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.name} className="flex items-center justify-between rounded-md border p-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(integration.status)}
                  <div>
                    <h3 className="font-medium">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground">{integration.message}</p>
                  </div>
                </div>
                {getStatusBadge(integration.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Status
        </Button>
        <Button
          variant="outline"
          className="gap-1"
          onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
        >
          <span>Vercel Dashboard</span>
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

