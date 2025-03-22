"use client"

import { useEffect, useState } from "react"
import { initializeDatabase } from "@/lib/db/init"
import { useToast } from "@/hooks/use-toast"
import { seedDefaultBusiness } from "../lib/db/business"

export function DbInitializer() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isError, setIsError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeDatabase()
        setIsInitialized(true)
        console.log("Database initialized successfully")
        await seedDefaultBusiness()
      } catch (error) {
        console.error("Failed to initialize database:", error)
        setIsError(true)

        // Only show toast for the first error
        if (retryCount === 0) {
          toast({
            title: "Database Initialization",
            description: "Using fallback data storage. Some features may be limited.",
            variant: "default",
          })
        }

        // Retry up to 3 times with increasing delay
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
          console.log(`Retrying database initialization in ${delay}ms (attempt ${retryCount + 1}/3)`)
          setTimeout(() => {
            setRetryCount((prev) => prev + 1)
          }, delay)
        }
      }
    }

    if (!isInitialized && (retryCount === 0 || (isError && retryCount < 3))) {
      initialize()
    }
  }, [toast, isInitialized, isError, retryCount])

  // This component doesn't render anything visible
  return null
}

