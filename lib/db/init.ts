"use server"

import { seedCategoriesIfEmpty } from "./categories"
import { seedProductsIfEmpty } from "./products"
import { seedCustomersIfEmpty } from "./customers"
import { seedOrdersIfEmpty } from "./orders"
import { seedUsersIfEmpty } from "./users"
import { seedDefaultBusiness } from "./business"
import redis from "./redis"

// Check if database is available with improved error handling
async function isDatabaseAvailable(): Promise<boolean> {
  try {
    // Set a timeout for the ping operation
    const pingPromise = redis.ping()
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error("Database connection timeout")), 3000)
    })

    // Race between ping and timeout
    await Promise.race([pingPromise, timeoutPromise])
    return true
  } catch (error) {
    console.error("Database connection check failed:", error)
    return false
  }
}

export async function initializeDatabase() {
  console.log("Initializing database...")

  // Check database availability
  const isAvailable = await isDatabaseAvailable()
  if (!isAvailable) {
    console.warn("Database is not available, using fallback storage")
  }

  // Maximum number of retries
  const maxRetries = 3
  let retryCount = 0
  let success = false

  while (!success && retryCount < maxRetries) {
    try {
      // Seed data in the correct order to maintain referential integrity
      await seedDefaultBusiness()
      await seedUsersIfEmpty()
      await seedCategoriesIfEmpty()
      await seedProductsIfEmpty()
      await seedCustomersIfEmpty()
      await seedOrdersIfEmpty()

      console.log("Database initialization complete")
      success = true
    } catch (error) {
      retryCount++
      console.error(`Database initialization error (attempt ${retryCount}/${maxRetries}):`, error)

      if (retryCount < maxRetries) {
        // Exponential backoff: wait longer between each retry
        const backoffTime = Math.pow(2, retryCount) * 1000
        console.log(`Retrying in ${backoffTime / 1000} seconds...`)
        await new Promise((resolve) => setTimeout(resolve, backoffTime))
      } else {
        console.error("Maximum retries reached. Falling back to critical components only.")

        // Try to recover critical components only
        try {
          await seedDefaultBusiness()
          await seedUsersIfEmpty()
          console.log("Successfully recovered critical components initialization")
        } catch (criticalError) {
          console.error("Failed to recover critical components:", criticalError)
        }
      }
    }
  }
}

