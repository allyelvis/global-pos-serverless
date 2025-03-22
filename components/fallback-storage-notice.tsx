"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function FallbackStorageNotice() {
  const [isUsingFallback, setIsUsingFallback] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkRedisStatus = async () => {
      try {
        const response = await fetch("/api/health")
        const data = await response.json()
        setIsUsingFallback(data.redis === "fallback-memory" || data.redis === "error")
      } catch (error) {
        console.error("Failed to check Redis status:", error)
        setIsUsingFallback(true)
      } finally {
        setIsLoading(false)
      }
    }

    checkRedisStatus()
  }, [])

  if (isLoading || !isUsingFallback) {
    return null
  }

  return (
    <Alert variant="warning" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Using Fallback Storage</AlertTitle>
      <AlertDescription>
        Your application is currently using in-memory storage. Data will not persist between sessions or deployments.
        Consider adding Vercel KV or Redis for persistent storage.
      </AlertDescription>
    </Alert>
  )
}

