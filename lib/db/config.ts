"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createUser } from "./users"
import { createBusiness as createBusinessRecord } from "./business"

// Store configuration in cookies
const CONFIG_COOKIE_NAME = "pos_config"
const CONFIG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

// Test database connection
export async function testDatabaseConnection(
  dbType: "redis" | "upstash" | "vercel-kv",
  dbUrl?: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    // If using Vercel KV, check for environment variables
    if (dbType === "vercel-kv") {
      if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        return {
          success: false,
          message: "Vercel KV environment variables are not configured. Please add the Vercel KV integration.",
        }
      }

      // Test connection using fetch
      const response = await fetch(`${process.env.KV_REST_API_URL}/ping`, {
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to connect to Vercel KV: ${response.statusText}`)
      }

      return { success: true }
    }

    // For other database types, use the provided URL
    if (!dbUrl) {
      return { success: false, message: "Database URL is required" }
    }

    // Test connection using fetch for simplicity
    const response = await fetch(dbUrl, {
      method: "HEAD",
    })

    if (!response.ok) {
      throw new Error(`Failed to connect to database: ${response.statusText}`)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Database connection test failed:", error)
    return { success: false, message: error.message || "Failed to connect to database" }
  }
}

// Save database configuration
export async function saveDatabaseConfig(
  dbType: "redis" | "upstash" | "vercel-kv",
  dbUrl?: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    // Test connection first
    const testResult = await testDatabaseConnection(dbType, dbUrl)
    if (!testResult.success) {
      return testResult
    }

    // Save configuration in cookie
    const config = {
      dbType,
      dbUrl: dbType === "vercel-kv" ? process.env.KV_REST_API_URL : dbUrl,
      setupComplete: false,
    }

    cookies().set(CONFIG_COOKIE_NAME, JSON.stringify(config), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: CONFIG_COOKIE_MAX_AGE,
      path: "/",
    })

    return { success: true }
  } catch (error: any) {
    console.error("Failed to save database configuration:", error)
    return { success: false, message: error.message || "Failed to save configuration" }
  }
}

// Create admin user
export async function createAdminUser({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}): Promise<{ success: boolean; message?: string }> {
  try {
    // Create admin user
    const user = await createUser({
      name,
      email,
      password,
      role: "admin",
      businessId: "default", // Will be updated later
    })

    if (!user) {
      return { success: false, message: "Failed to create admin user" }
    }

    // Update configuration
    const configStr = cookies().get(CONFIG_COOKIE_NAME)?.value
    if (configStr) {
      const config = JSON.parse(configStr)
      config.adminUserId = user.id

      cookies().set(CONFIG_COOKIE_NAME, JSON.stringify(config), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: CONFIG_COOKIE_MAX_AGE,
        path: "/",
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error("Failed to create admin user:", error)
    return { success: false, message: error.message || "Failed to create admin user" }
  }
}

// Create business
export async function createBusiness({
  name,
  type,
  currency,
}: {
  name: string
  type: "retail" | "restaurant" | "salon" | "hotel" | "grocery"
  currency: string
}): Promise<{ success: boolean; message?: string }> {
  try {
    // Create business
    const business = await createBusinessRecord({
      name,
      type,
      address: "",
      phone: "",
      email: "",
      currency,
      taxRate: 0,
      timeZone: "UTC",
    })

    if (!business) {
      return { success: false, message: "Failed to create business" }
    }

    // Update configuration
    const configStr = cookies().get(CONFIG_COOKIE_NAME)?.value
    if (configStr) {
      const config = JSON.parse(configStr)
      config.businessId = business.id
      config.setupComplete = true

      cookies().set(CONFIG_COOKIE_NAME, JSON.stringify(config), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: CONFIG_COOKIE_MAX_AGE,
        path: "/",
      })
    }

    // Revalidate paths
    revalidatePath("/dashboard")
    revalidatePath("/login")

    return { success: true }
  } catch (error: any) {
    console.error("Failed to create business:", error)
    return { success: false, message: error.message || "Failed to create business" }
  }
}

// Get configuration
export async function getConfig() {
  const configStr = cookies().get(CONFIG_COOKIE_NAME)?.value
  return configStr ? JSON.parse(configStr) : null
}

// Check if setup is complete
export async function isSetupComplete() {
  const config = await getConfig()
  return config?.setupComplete === true
}

