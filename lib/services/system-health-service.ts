"use server"

import { getRedisClient } from "../db/redis-client"
import { revalidatePath } from "next/cache"

// Types
export interface SystemHealth {
  status: "healthy" | "degraded" | "unhealthy"
  components: {
    database: ComponentHealth
    redis: ComponentHealth
    api: ComponentHealth
    storage: ComponentHealth
  }
  metrics: {
    responseTime: number
    uptime: number
    memoryUsage: number
    cpuUsage: number
  }
  lastChecked: string
}

export interface ComponentHealth {
  status: "healthy" | "degraded" | "unhealthy"
  latency: number
  message: string
  lastChecked: string
}

// Constants
const HEALTH_CHECK_KEY = "system:health"
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

// Check system health
export async function checkSystemHealth(): Promise<SystemHealth> {
  try {
    const startTime = Date.now()

    // Check Redis
    const redis = getRedisClient()
    let redisStatus: ComponentHealth

    try {
      const redisStartTime = Date.now()
      await redis.ping()
      const redisLatency = Date.now() - redisStartTime

      redisStatus = {
        status: redisLatency < 100 ? "healthy" : redisLatency < 500 ? "degraded" : "unhealthy",
        latency: redisLatency,
        message: "Redis is operational",
        lastChecked: new Date().toISOString(),
      }
    } catch (error) {
      redisStatus = {
        status: "unhealthy",
        latency: -1,
        message: `Redis error: ${error instanceof Error ? error.message : "Unknown error"}`,
        lastChecked: new Date().toISOString(),
      }
    }

    // Check Database (simulated)
    const dbStartTime = Date.now()
    await new Promise((resolve) => setTimeout(resolve, 50)) // Simulate DB query
    const dbLatency = Date.now() - dbStartTime

    const dbStatus: ComponentHealth = {
      status: dbLatency < 200 ? "healthy" : dbLatency < 1000 ? "degraded" : "unhealthy",
      latency: dbLatency,
      message: "Database is operational",
      lastChecked: new Date().toISOString(),
    }

    // Check API (simulated)
    const apiStartTime = Date.now()
    await new Promise((resolve) => setTimeout(resolve, 30)) // Simulate API call
    const apiLatency = Date.now() - apiStartTime

    const apiStatus: ComponentHealth = {
      status: apiLatency < 150 ? "healthy" : apiLatency < 500 ? "degraded" : "unhealthy",
      latency: apiLatency,
      message: "API is operational",
      lastChecked: new Date().toISOString(),
    }

    // Check Storage (simulated)
    const storageStartTime = Date.now()
    await new Promise((resolve) => setTimeout(resolve, 40)) // Simulate storage check
    const storageLatency = Date.now() - storageStartTime

    const storageStatus: ComponentHealth = {
      status: storageLatency < 100 ? "healthy" : storageLatency < 300 ? "degraded" : "unhealthy",
      latency: storageLatency,
      message: "Storage is operational",
      lastChecked: new Date().toISOString(),
    }

    // Calculate overall status
    const components = {
      database: dbStatus,
      redis: redisStatus,
      api: apiStatus,
      storage: storageStatus,
    }

    const componentStatuses = Object.values(components).map((c) => c.status)
    let overallStatus: SystemHealth["status"] = "healthy"

    if (componentStatuses.includes("unhealthy")) {
      overallStatus = "unhealthy"
    } else if (componentStatuses.includes("degraded")) {
      overallStatus = "degraded"
    }

    // Calculate metrics (simulated)
    const metrics = {
      responseTime: Date.now() - startTime,
      uptime: Math.floor(Math.random() * 30 * 24 * 60 * 60), // Random uptime up to 30 days in seconds
      memoryUsage: Math.floor(Math.random() * 70) + 20, // Random memory usage between 20-90%
      cpuUsage: Math.floor(Math.random() * 60) + 10, // Random CPU usage between 10-70%
    }

    // Create health report
    const healthReport: SystemHealth = {
      status: overallStatus,
      components,
      metrics,
      lastChecked: new Date().toISOString(),
    }

    // Store health report in Redis
    await redis.set(HEALTH_CHECK_KEY, JSON.stringify(healthReport))

    return healthReport
  } catch (error) {
    console.error("Failed to check system health:", error)

    // Return degraded status if health check fails
    return {
      status: "degraded",
      components: {
        database: {
          status: "unknown" as any,
          latency: -1,
          message: "Health check failed",
          lastChecked: new Date().toISOString(),
        },
        redis: {
          status: "unknown" as any,
          latency: -1,
          message: "Health check failed",
          lastChecked: new Date().toISOString(),
        },
        api: {
          status: "unknown" as any,
          latency: -1,
          message: "Health check failed",
          lastChecked: new Date().toISOString(),
        },
        storage: {
          status: "unknown" as any,
          latency: -1,
          message: "Health check failed",
          lastChecked: new Date().toISOString(),
        },
      },
      metrics: {
        responseTime: -1,
        uptime: -1,
        memoryUsage: -1,
        cpuUsage: -1,
      },
      lastChecked: new Date().toISOString(),
    }
  }
}

// Get system health
export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const redis = getRedisClient()
    const healthData = await redis.get(HEALTH_CHECK_KEY)

    if (!healthData) {
      // If no health data exists, perform a health check
      return checkSystemHealth()
    }

    const health: SystemHealth = JSON.parse(healthData)
    const lastCheckedTime = new Date(health.lastChecked).getTime()
    const now = Date.now()

    // If health check is older than the interval, perform a new check
    if (now - lastCheckedTime > HEALTH_CHECK_INTERVAL) {
      return checkSystemHealth()
    }

    return health
  } catch (error) {
    console.error("Failed to get system health:", error)
    return checkSystemHealth()
  }
}

// Force a system health check
export async function forceSystemHealthCheck(): Promise<SystemHealth> {
  const health = await checkSystemHealth()
  revalidatePath("/dashboard/system")
  return health
}

