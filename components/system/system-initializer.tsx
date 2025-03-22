"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { initializeSystem } from "@/lib/services/system-init-service"
import { Loader2, AlertTriangle } from "lucide-react"

export function SystemInitializer() {
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [redisUnavailable, setRedisUnavailable] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const initialize = async () => {
      try {
        const result = await initializeSystem()

        // Check if Redis is available
        if (!result.isRedisAvailable) {
          setRedisUnavailable(true)
          setError("Database connection unavailable. Please check your Redis configuration.")
          setIsInitializing(false)
          return
        }

        // If we're on a public path, don't redirect
        const isPublicPath = ["/", "/login", "/register", "/forgot-password"].includes(pathname)

        // If setup is not complete and we're not already on a setup path, redirect to setup
        if (!result.isSetupComplete && !pathname.startsWith("/setup") && !isPublicPath) {
          router.push("/setup")
        }

        // If setup is complete but we're not logged in, and we're not on a public path, redirect to login
        if (result.isSetupComplete && !result.isLoggedIn && !isPublicPath && !pathname.startsWith("/login")) {
          router.push("/login")
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        console.error("Failed to initialize system:", error)
        setError(errorMessage)
      } finally {
        setIsInitializing(false)
      }
    }

    initialize()
  }, [router, pathname])

  if (isInitializing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">Initializing system...</p>
        </div>
      </div>
    )
  }

  if (error || redisUnavailable) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold">System Initialization Error</h2>
          </div>
          <p className="mb-4 text-gray-700 dark:text-gray-300">{error}</p>
          {redisUnavailable && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md mb-4">
              <p className="text-sm text-red-800 dark:text-red-300">
                The Redis database connection is unavailable. Please check your Redis configuration and ensure the
                REDIS_TOKEN environment variable is set correctly.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Retry
            </button>
            {redisUnavailable && (
              <button
                onClick={() => router.push("/setup/database")}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Configure Database
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}

