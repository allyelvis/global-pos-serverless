"use server"

// Define the Redis client interface
interface RedisClient {
  ping(): Promise<string>
  get(key: string): Promise<string | null>
  set(key: string, value: string, options?: { ex?: number }): Promise<string>
  del(key: string): Promise<number>
  hget(key: string, field: string): Promise<string | null>
  hset(key: string, field: string, value: string): Promise<number>
  hgetall(key: string): Promise<Record<string, string> | null>
  hdel(key: string, field: string): Promise<number>
  hlen(key: string): Promise<number>
  keys(pattern: string): Promise<string[]>
  exists(key: string): Promise<number>
  expire(key: string, seconds: number): Promise<number>
  incr(key: string): Promise<number>
  incrby(key: string, increment: number): Promise<number>
  sadd(key: string, ...members: string[]): Promise<number>
  smembers(key: string): Promise<string[]>
  srem(key: string, ...members: string[]): Promise<number>
  zadd(key: string, score: number, member: string): Promise<number>
  zrange(key: string, start: number, stop: number): Promise<string[]>
  zrem(key: string, ...members: string[]): Promise<number>
}

// In-memory Redis client implementation
class MemoryRedisClient implements RedisClient {
  private data: Map<string, any> = new Map()
  private hashData: Map<string, Map<string, string>> = new Map()
  private setData: Map<string, Set<string>> = new Map()
  private zsetData: Map<string, Map<string, number>> = new Map()
  private expirations: Map<string, number> = new Map()

  constructor() {
    console.log("Using in-memory Redis client")
    // Clean up expired keys periodically
    setInterval(() => this.cleanupExpiredKeys(), 1000)
  }

  private cleanupExpiredKeys() {
    const now = Date.now()
    for (const [key, expiry] of this.expirations.entries()) {
      if (expiry <= now) {
        this.data.delete(key)
        this.hashData.delete(key)
        this.setData.delete(key)
        this.zsetData.delete(key)
        this.expirations.delete(key)
      }
    }
  }

  async ping(): Promise<string> {
    return "PONG"
  }

  async get(key: string): Promise<string | null> {
    return this.data.get(key) || null
  }

  async set(key: string, value: string, options?: { ex?: number }): Promise<string> {
    this.data.set(key, value)
    if (options?.ex) {
      this.expirations.set(key, Date.now() + options.ex * 1000)
    }
    return "OK"
  }

  async del(key: string): Promise<number> {
    const deleted =
      this.data.delete(key) || this.hashData.delete(key) || this.setData.delete(key) || this.zsetData.delete(key)
    this.expirations.delete(key)
    return deleted ? 1 : 0
  }

  async hget(key: string, field: string): Promise<string | null> {
    const hash = this.hashData.get(key)
    if (!hash) return null
    return hash.get(field) || null
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    if (!this.hashData.has(key)) {
      this.hashData.set(key, new Map())
    }
    const hash = this.hashData.get(key)!
    const isNew = !hash.has(field)
    hash.set(field, value)
    return isNew ? 1 : 0
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    const hash = this.hashData.get(key)
    if (!hash) return null
    const result: Record<string, string> = {}
    hash.forEach((value, field) => {
      result[field] = value
    })
    return result
  }

  async hdel(key: string, field: string): Promise<number> {
    const hash = this.hashData.get(key)
    if (!hash) return 0
    return hash.delete(field) ? 1 : 0
  }

  async hlen(key: string): Promise<number> {
    const hash = this.hashData.get(key)
    if (!hash) return 0
    return hash.size
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace("*", ".*"))
    const allKeys = [...this.data.keys(), ...this.hashData.keys(), ...this.setData.keys(), ...this.zsetData.keys()]
    return allKeys.filter((key) => regex.test(key))
  }

  async exists(key: string): Promise<number> {
    return this.data.has(key) || this.hashData.has(key) || this.setData.has(key) || this.zsetData.has(key) ? 1 : 0
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (this.data.has(key) || this.hashData.has(key) || this.setData.has(key) || this.zsetData.has(key)) {
      this.expirations.set(key, Date.now() + seconds * 1000)
      return 1
    }
    return 0
  }

  async incr(key: string): Promise<number> {
    const value = (Number.parseInt(this.data.get(key) || "0", 10) || 0) + 1
    this.data.set(key, value.toString())
    return value
  }

  async incrby(key: string, increment: number): Promise<number> {
    const value = (Number.parseInt(this.data.get(key) || "0", 10) || 0) + increment
    this.data.set(key, value.toString())
    return value
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    if (!this.setData.has(key)) {
      this.setData.set(key, new Set())
    }
    const set = this.setData.get(key)!
    let added = 0
    for (const member of members) {
      if (!set.has(member)) {
        set.add(member)
        added++
      }
    }
    return added
  }

  async smembers(key: string): Promise<string[]> {
    const set = this.setData.get(key)
    if (!set) return []
    return Array.from(set)
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    const set = this.setData.get(key)
    if (!set) return 0
    let removed = 0
    for (const member of members) {
      if (set.has(member)) {
        set.delete(member)
        removed++
      }
    }
    return removed
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    if (!this.zsetData.has(key)) {
      this.zsetData.set(key, new Map())
    }
    const zset = this.zsetData.get(key)!
    const isNew = !zset.has(member)
    zset.set(member, score)
    return isNew ? 1 : 0
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    const zset = this.zsetData.get(key)
    if (!zset) return []
    const sorted = Array.from(zset.entries()).sort((a, b) => a[1] - b[1])
    const end = stop === -1 ? sorted.length : stop + 1
    return sorted.slice(start, end).map(([member]) => member)
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    const zset = this.zsetData.get(key)
    if (!zset) return 0
    let removed = 0
    for (const member of members) {
      if (zset.has(member)) {
        zset.delete(member)
        removed++
      }
    }
    return removed
  }
}

// Vercel KV REST API client implementation with improved error handling
class VercelKVClient implements RedisClient {
  private apiUrl: string
  private token: string
  private readOnlyToken: string
  private connectionStatus: "connected" | "disconnected" | "error" = "disconnected"

  constructor(apiUrl: string, token: string, readOnlyToken: string) {
    this.apiUrl = apiUrl
    this.token = token
    this.readOnlyToken = readOnlyToken
    console.log("Using Vercel KV REST API client")

    // Try to establish connection
    this.ping()
      .then(() => {
        this.connectionStatus = "connected"
        console.log("Successfully connected to Vercel KV")
      })
      .catch((error) => {
        this.connectionStatus = "error"
        console.error("Failed to connect to Vercel KV:", error)
      })
  }

  private async request(method: string, path: string, body?: any, readOnly = false): Promise<any> {
    try {
      const token = readOnly ? this.readOnlyToken : this.token
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(`${this.apiUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`KV API error: ${response.status} ${error}`)
      }

      if (response.status === 204) {
        return null
      }

      return await response.json()
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout")
      }
      throw error
    }
  }

  async ping(): Promise<string> {
    try {
      await this.request("GET", "/ping", undefined, true)
      return "PONG"
    } catch (error) {
      console.error("KV ping error:", error)
      throw error
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const result = await this.request("GET", `/get/${encodeURIComponent(key)}`, undefined, true)
      return result?.result
    } catch (error) {
      console.error("KV get error:", error)
      return null
    }
  }

  async set(key: string, value: string, options?: { ex?: number }): Promise<string> {
    try {
      const body: any = { value }
      if (options?.ex) {
        body.ex = options.ex
      }
      await this.request("POST", `/set/${encodeURIComponent(key)}`, body)
      return "OK"
    } catch (error) {
      console.error("KV set error:", error)
      return "ERROR"
    }
  }

  async del(key: string): Promise<number> {
    try {
      await this.request("DELETE", `/del/${encodeURIComponent(key)}`)
      return 1
    } catch (error) {
      console.error("KV del error:", error)
      return 0
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      const result = await this.request(
        "GET",
        `/hget/${encodeURIComponent(key)}/${encodeURIComponent(field)}`,
        undefined,
        true,
      )
      return result?.result
    } catch (error) {
      console.error("KV hget error:", error)
      return null
    }
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    try {
      // The Vercel KV REST API expects an array of field-value pairs
      const result = await this.request("POST", `/hset/${encodeURIComponent(key)}`, {
        fields: [{ field, value }],
      })
      return result?.result || 0
    } catch (error) {
      console.error("KV hset error:", error)
      return 0
    }
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    try {
      const result = await this.request("GET", `/hgetall/${encodeURIComponent(key)}`, undefined, true)
      return result?.result
    } catch (error) {
      console.error("KV hgetall error:", error)
      return null
    }
  }

  async hdel(key: string, field: string): Promise<number> {
    try {
      const result = await this.request("DELETE", `/hdel/${encodeURIComponent(key)}/${encodeURIComponent(field)}`)
      return result?.result
    } catch (error) {
      console.error("KV hdel error:", error)
      return 0
    }
  }

  async hlen(key: string): Promise<number> {
    try {
      const result = await this.request("GET", `/hlen/${encodeURIComponent(key)}`, undefined, true)
      return result?.result
    } catch (error) {
      console.error("KV hlen error:", error)
      return 0
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      const result = await this.request("GET", `/keys/${encodeURIComponent(pattern)}`, undefined, true)
      return result?.result || []
    } catch (error) {
      console.error("KV keys error:", error)
      return []
    }
  }

  async exists(key: string): Promise<number> {
    try {
      const result = await this.request("GET", `/exists/${encodeURIComponent(key)}`, undefined, true)
      return result?.result
    } catch (error) {
      console.error("KV exists error:", error)
      return 0
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    try {
      const result = await this.request("POST", `/expire/${encodeURIComponent(key)}`, { seconds })
      return result?.result
    } catch (error) {
      console.error("KV expire error:", error)
      return 0
    }
  }

  async incr(key: string): Promise<number> {
    try {
      const result = await this.request("POST", `/incr/${encodeURIComponent(key)}`)
      return result?.result
    } catch (error) {
      console.error("KV incr error:", error)
      return 0
    }
  }

  async incrby(key: string, increment: number): Promise<number> {
    try {
      const result = await this.request("POST", `/incrby/${encodeURIComponent(key)}`, { increment })
      return result?.result
    } catch (error) {
      console.error("KV incrby error:", error)
      return 0
    }
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      const result = await this.request("POST", `/sadd/${encodeURIComponent(key)}`, { members })
      return result?.result
    } catch (error) {
      console.error("KV sadd error:", error)
      return 0
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      const result = await this.request("GET", `/smembers/${encodeURIComponent(key)}`, undefined, true)
      return result?.result || []
    } catch (error) {
      console.error("KV smembers error:", error)
      return []
    }
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      const result = await this.request("POST", `/srem/${encodeURIComponent(key)}`, { members })
      return result?.result
    } catch (error) {
      console.error("KV srem error:", error)
      return 0
    }
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      const result = await this.request("POST", `/zadd/${encodeURIComponent(key)}`, { score, member })
      return result?.result
    } catch (error) {
      console.error("KV zadd error:", error)
      return 0
    }
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      const result = await this.request("GET", `/zrange/${encodeURIComponent(key)}/${start}/${stop}`, undefined, true)
      return result?.result || []
    } catch (error) {
      console.error("KV zrange error:", error)
      return []
    }
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    try {
      const result = await this.request("POST", `/zrem/${encodeURIComponent(key)}`, { members })
      return result?.result
    } catch (error) {
      console.error("KV zrem error:", error)
      return 0
    }
  }
}

import { cookies } from "next/headers"

// Create the appropriate Redis client based on environment with better fallback handling
function createRedisClient(): RedisClient {
  try {
    // Check for Vercel KV environment variables - prioritize this
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN && process.env.KV_REST_API_READ_ONLY_TOKEN) {
      console.log("Using Vercel KV REST API client")
      return new VercelKVClient(
        process.env.KV_REST_API_URL,
        process.env.KV_REST_API_TOKEN,
        process.env.KV_REST_API_READ_ONLY_TOKEN,
      )
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
    } catch (cookieError) {
      console.error("Error reading Redis configuration from cookies:", cookieError)
    }
  } catch (error) {
    console.error("Error creating Redis client:", error)
  }

  // Fall back to in-memory Redis
  console.log("Using in-memory Redis client as fallback")
  return new MemoryRedisClient()
}

// Export a singleton Redis client
const redis = createRedisClient()
export default redis

