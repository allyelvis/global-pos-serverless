import { NextResponse } from "next/server"
import redis from "@/lib/db/redis"

export async function GET() {
  let redisStatus = "unknown"
  let redisDetails = {}

  try {
    // Set a timeout for the ping operation
    const pingPromise = redis.ping()
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error("Database connection timeout")), 3000)
    })

    // Race between ping and timeout
    const pong = await Promise.race([pingPromise, timeoutPromise])

    if (pong === "PONG") {
      // Determine which Redis implementation is being used
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        redisStatus = "connected-kv-rest"
        redisDetails = {
          type: "vercel-kv-rest",
          url: process.env.KV_REST_API_URL,
        }
      } else if (process.env.KV_URL) {
        redisStatus = "connected-kv"
        redisDetails = {
          type: "vercel-kv",
        }
      } else if (process.env.REDIS_URL) {
        redisStatus = "connected-redis"
        redisDetails = {
          type: "redis",
        }
      } else {
        redisStatus = "fallback-memory"
        redisDetails = {
          type: "memory",
        }
      }
    } else {
      redisStatus = "error"
      redisDetails = {
        error: "Unexpected response from Redis",
      }
    }
  } catch (error) {
    console.error("Health check Redis error:", error)
    redisStatus = "error"
    redisDetails = {
      error: error.message || "Unknown error",
      fallback: "Using in-memory storage",
    }
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    redis: redisStatus,
    redisDetails,
    environment: process.env.NODE_ENV || "development",
  })
}

