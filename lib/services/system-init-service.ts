"use server"

import { cookies } from "next/headers"
import { getRedisClient, testRedisConnection, safeRedisOperation } from "../db/redis-client"
import { logger } from "../logger"
import { getVersionInfo } from "../version"

interface SystemInitResult {
  isSetupComplete: boolean
  isLoggedIn: boolean
  databaseVersion?: string
  isRedisAvailable: boolean
}

export async function initializeSystem(): Promise<SystemInitResult> {
  try {
    // First, test if Redis is available
    const isRedisAvailable = await testRedisConnection()

    if (!isRedisAvailable) {
      logger.warn("Redis is not available, using fallback values")
      return {
        isSetupComplete: false,
        isLoggedIn: false,
        isRedisAvailable: false,
      }
    }

    const redis = getRedisClient()

    // Check if database is initialized using safe operation
    const isInitialized = await safeRedisOperation(
      () => redis.get("pos:system:initialized"),
      null,
      "Check if database is initialized",
    )

    // Get system metadata using safe operation
    const metadata = await safeRedisOperation(() => redis.hgetall("pos:system:metadata"), {}, "Get system metadata")

    const databaseVersion = metadata?.version || getVersionInfo().version

    // Check if setup is complete using safe operation
    const setupComplete = await safeRedisOperation(
      () => redis.get("pos:setup:complete"),
      null,
      "Check if setup is complete",
    )

    // Check session cookie for login status
    const sessionCookie = cookies().get("session_id")
    const isLoggedIn = !!sessionCookie

    // Set the setup status in a cookie for middleware
    cookies().set("system_setup_complete", setupComplete === "true" ? "true" : "false", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })

    return {
      isSetupComplete: setupComplete === "true",
      isLoggedIn,
      databaseVersion,
      isRedisAvailable: true,
    }
  } catch (error) {
    // Capture and log the full error details
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined

    logger.error("Failed to initialize system", {
      error: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    })

    // Return default values if initialization fails
    return {
      isSetupComplete: false,
      isLoggedIn: false,
      isRedisAvailable: false,
    }
  }
}

export async function quickSetup(): Promise<{
  success: boolean
  message?: string
}> {
  try {
    // First, test if Redis is available
    const isRedisAvailable = await testRedisConnection()

    if (!isRedisAvailable) {
      return {
        success: false,
        message: "Redis database is not available. Please check your connection settings.",
      }
    }

    const redis = getRedisClient()

    // Set system as initialized
    await redis.set("pos:system:initialized", "true")

    // Set setup as complete
    await redis.set("pos:setup:complete", "true")

    // Set system metadata
    const versionInfo = getVersionInfo()
    await redis.hset("pos:system:metadata", {
      version: versionInfo.version,
      buildNumber: versionInfo.build,
      setupDate: new Date().toISOString(),
    })

    // Set the setup status in a cookie for middleware
    cookies().set("system_setup_complete", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })

    logger.info("Quick setup completed successfully")

    return {
      success: true,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    logger.error("Quick setup failed", { error: errorMessage })

    return {
      success: false,
      message: `Failed to complete quick setup: ${errorMessage}`,
    }
  }
}

