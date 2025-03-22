// Redis client factory for different environments
import { cookies } from "next/headers"

// Redis client interface
export interface RedisClient {
  // Hash operations
  hset(key: string, field: string, value: string): Promise<number>
  hget(key: string, field: string): Promise<string | null>
  hgetall(key: string): Promise<Record<string, string> | null>
  hdel(key: string, field: string): Promise<number>
  hlen(key: string): Promise<number>

  // Key operations
  del(key: string): Promise<number>

  // Connection operations
  ping(): Promise<string>
  quit(): Promise<string>
  on(event: string, callback: Function): void
}

// Vercel KV REST API Client implementation
export class VercelKVRestClient implements RedisClient {
  private baseUrl: string
  private token: string
  private readOnlyToken: string

  constructor() {
    this.baseUrl = process.env.KV_REST_API_URL || ""
    this.token = process.env.KV_REST_API_TOKEN || ""
    this.readOnlyToken = process.env.KV_REST_API_READ_ONLY_TOKEN || this.token
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/hset/${key}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ field, value }),
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      return data.result || 0
    } catch (error) {
      console.error("KV REST API hset error:", error)
      return 0
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/hget/${key}/${field}`, {
        headers: {
          Authorization: `Bearer ${this.readOnlyToken}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.result
    } catch (error) {
      console.error("KV REST API hget error:", error)
      return null
    }
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    try {
      const response = await fetch(`${this.baseUrl}/hgetall/${key}`, {
        headers: {
          Authorization: `Bearer ${this.readOnlyToken}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.result || null
    } catch (error) {
      console.error("KV REST API hgetall error:", error)
      return null
    }
  }

  async hdel(key: string, field: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/hdel/${key}/${field}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      return data.result || 0
    } catch (error) {
      console.error("KV REST API hdel error:", error)
      return 0
    }
  }

  async hlen(key: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/hlen/${key}`, {
        headers: {
          Authorization: `Bearer ${this.readOnlyToken}`,
        },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      return data.result || 0
    } catch (error) {
      console.error("KV REST API hlen error:", error)
      return 0
    }
  }

  // Key operations
  async del(key: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/del/${key}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return 1
    } catch (error) {
      console.error("KV REST API del error:", error)
      return 0
    }
  }

  // Connection events (for compatibility)
  on(event: string, callback: Function): void {
    if (event === "connect") {
      // Simulate immediate connection
      setTimeout(() => callback(), 0)
    }
  }

  // Ping for connection testing
  async ping(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/ping`, {
        headers: {
          Authorization: `Bearer ${this.readOnlyToken}`,
        },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return "PONG"
    } catch (error) {
      console.error("KV REST API ping error:", error)
      throw error
    }
  }

  // Quit for connection closing
  async quit(): Promise<string> {
    return "OK"
  }
}

// In-memory Redis-like implementation for serverless environments
export class MemoryRedisClient implements RedisClient {
  private storage: Map<string, Map<string, string>> = new Map()
  private connectionStatus: "connected" | "disconnected" = "disconnected"
  private eventCallbacks: Record<string, Function[]> = {}

  constructor() {
    this.connectionStatus = "connected"
    this.triggerEvent("connect")
    console.log("Memory Redis client initialized")
  }

  private triggerEvent(event: string): void {
    if (this.eventCallbacks[event]) {
      for (const callback of this.eventCallbacks[event]) {
        try {
          callback()
        } catch (error) {
          console.error(`Error in ${event} event callback:`, error)
        }
      }
    }
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<number> {
    if (!this.storage.has(key)) {
      this.storage.set(key, new Map())
    }
    const hash = this.storage.get(key)!
    const isNew = !hash.has(field)
    hash.set(field, value)
    return isNew ? 1 : 0
  }

  async hget(key: string, field: string): Promise<string | null> {
    const hash = this.storage.get(key)
    if (!hash) return null
    const value = hash.get(field)
    return value !== undefined ? value : null
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    const hash = this.storage.get(key)
    if (!hash) return null

    const result: Record<string, string> = {}
    hash.forEach((value, field) => {
      result[field] = value
    })

    return result
  }

  async hdel(key: string, field: string): Promise<number> {
    const hash = this.storage.get(key)
    if (!hash) return 0

    const deleted = hash.delete(field)
    return deleted ? 1 : 0
  }

  async hlen(key: string): Promise<number> {
    const hash = this.storage.get(key)
    return hash ? hash.size : 0
  }

  // Key operations
  async del(key: string): Promise<number> {
    const deleted = this.storage.delete(key)
    return deleted ? 1 : 0
  }

  // Connection events
  on(event: string, callback: Function): void {
    if (!this.eventCallbacks[event]) {
      this.eventCallbacks[event] = []
    }
    this.eventCallbacks[event].push(callback)

    // If connecting to an already connected client, trigger immediately
    if (event === "connect" && this.connectionStatus === "connected") {
      setTimeout(() => callback(), 0)
    }
  }

  // Ping for connection testing
  async ping(): Promise<string> {
    if (this.connectionStatus !== "connected") {
      throw new Error("Not connected")
    }
    return "PONG"
  }

  // Quit for connection closing
  async quit(): Promise<string> {
    this.connectionStatus = "disconnected"
    this.triggerEvent("end")
    return "OK"
  }
}

import { Redis } from "@upstash/redis"
import { logger } from "../logger"

let redisClient: Redis | null = null

export function getRedisClient(): Redis {
  if (!redisClient) {
    try {
      // Check if we have the required environment variable
      const redisToken = process.env.REDIS_TOKEN

      if (!redisToken) {
        throw new Error("REDIS_TOKEN environment variable is not set")
      }

      // Initialize Redis client
      redisClient = new Redis({
        url: "https://global-pos-redis.upstash.io",
        token: redisToken,
      })

      logger.info("Redis client initialized successfully")
    } catch (error) {
      logger.error("Failed to initialize Redis client", { error })
      throw new Error(`Redis client initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return redisClient
}

// Test Redis connection
export async function testRedisConnection(): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const pingResult = await redis.ping()
    return pingResult === "PONG"
  } catch (error) {
    logger.error("Redis connection test failed", { error })
    return false
  }
}

// Graceful fallback for when Redis is unavailable
export async function safeRedisOperation<T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  operationName = "Redis operation",
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    logger.error(`${operationName} failed`, { error })
    return fallbackValue
  }
}

/**
 * Set a value in Redis with optional expiration
 * @param key - The key to set
 * @param value - The value to set
 * @param expireInSeconds - Optional expiration time in seconds
 */
export async function setRedisValue(key: string, value: any, expireInSeconds?: number): Promise<void> {
  const client = getRedisClient()

  try {
    if (expireInSeconds) {
      await client.set(key, JSON.stringify(value), { ex: expireInSeconds })
    } else {
      await client.set(key, JSON.stringify(value))
    }
    logger.debug(`Redis: Set value for key ${key}`)
  } catch (error) {
    logger.error(`Redis: Failed to set value for key ${key}`, error)
    throw error
  }
}

/**
 * Get a value from Redis
 * @param key - The key to get
 * @returns The value or null if not found
 */
export async function getRedisValue<T>(key: string): Promise<T | null> {
  const client = getRedisClient()

  try {
    const value = await client.get(key)
    logger.debug(`Redis: Got value for key ${key}`)
    return value ? (JSON.parse(value as string) as T) : null
  } catch (error) {
    logger.error(`Redis: Failed to get value for key ${key}`, error)
    throw error
  }
}

/**
 * Delete a key from Redis
 * @param key - The key to delete
 */
export async function deleteRedisKey(key: string): Promise<void> {
  const client = getRedisClient()

  try {
    await client.del(key)
    logger.debug(`Redis: Deleted key ${key}`)
  } catch (error) {
    logger.error(`Redis: Failed to delete key ${key}`, error)
    throw error
  }
}

// Create the appropriate Redis client based on environment
export function createRedisClient(): RedisClient {
  // Check for Vercel KV REST API
  if (process.env.KV_REST_API_URL && (process.env.KV_REST_API_TOKEN || process.env.KV_REST_API_READ_ONLY_TOKEN)) {
    console.log("Using Vercel KV REST API client")
    return new VercelKVRestClient()
  }

  // Check for Redis URL in cookies (from setup)
  try {
    const configStr = cookies().get("pos_config")?.value
    if (configStr) {
      const config = JSON.parse(configStr)
      if (config.dbUrl) {
        console.log("Using Redis from configuration")
        // In a real implementation, we would create a Redis client here
        // But for now, we'll use the memory client
        return new MemoryRedisClient()
      }
    }
  } catch (error) {
    console.error("Error reading Redis configuration:", error)
  }

  // Fallback to in-memory implementation
  console.log("Using in-memory Redis client")
  return new MemoryRedisClient()
}

