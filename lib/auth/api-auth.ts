"use server"

import type { NextRequest } from "next/server"
import redis from "../db/redis"
import { logger } from "../logger"

export interface ApiKey {
  id: string
  key: string
  name: string
  businessId: string
  permissions: string[]
  createdAt: string
  expiresAt?: string
  lastUsedAt?: string
}

const API_KEYS_KEY = "api_keys"

/**
 * Verify API key from request
 */
export async function verifyApiKey(
  request: NextRequest,
): Promise<{ success: boolean; message?: string; apiKey?: ApiKey }> {
  try {
    // Get API key from header
    const apiKeyHeader = request.headers.get("X-API-Key")

    if (!apiKeyHeader) {
      return { success: false, message: "API key is required" }
    }

    // Get API key from database
    const apiKeysData = await redis.hgetall(API_KEYS_KEY)

    if (!apiKeysData) {
      return { success: false, message: "Invalid API key" }
    }

    // Find matching API key
    let matchingApiKey: ApiKey | null = null

    for (const keyData of Object.values(apiKeysData)) {
      const apiKey = JSON.parse(keyData as string) as ApiKey

      if (apiKey.key === apiKeyHeader) {
        matchingApiKey = apiKey
        break
      }
    }

    if (!matchingApiKey) {
      return { success: false, message: "Invalid API key" }
    }

    // Check if API key is expired
    if (matchingApiKey.expiresAt && new Date(matchingApiKey.expiresAt) < new Date()) {
      return { success: false, message: "API key has expired" }
    }

    // Update last used timestamp
    await updateApiKeyLastUsed(matchingApiKey.id)

    return { success: true, apiKey: matchingApiKey }
  } catch (error) {
    logger.error("API key verification error:", error)
    return { success: false, message: "API key verification failed" }
  }
}

/**
 * Update API key last used timestamp
 */
async function updateApiKeyLastUsed(id: string): Promise<void> {
  try {
    const apiKeyData = await redis.hget(API_KEYS_KEY, id)

    if (apiKeyData) {
      const apiKey = JSON.parse(apiKeyData) as ApiKey
      apiKey.lastUsedAt = new Date().toISOString()

      await redis.hset(API_KEYS_KEY, id, JSON.stringify(apiKey))
    }
  } catch (error) {
    logger.error(`Failed to update API key last used timestamp for ${id}:`, error)
  }
}

/**
 * Create a new API key
 */
export async function createApiKey(
  name: string,
  businessId: string,
  permissions: string[] = ["read"],
  expiresInDays?: number,
): Promise<ApiKey> {
  try {
    // Generate a random API key
    const key = Array.from(Array(30), () => Math.floor(Math.random() * 36).toString(36)).join("")

    const id = `apikey_${Date.now()}`

    const apiKey: ApiKey = {
      id,
      key,
      name,
      businessId,
      permissions,
      createdAt: new Date().toISOString(),
      expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString() : undefined,
    }

    await redis.hset(API_KEYS_KEY, id, JSON.stringify(apiKey))

    return apiKey
  } catch (error) {
    logger.error("Failed to create API key:", error)
    \
    throw error
    error
  }
}

/**
 * Get all API keys for a business
 */
export async function getApiKeysByBusinessId(businessId: string): Promise<ApiKey[]> {
  try {
    const apiKeysData = await redis.hgetall(API_KEYS_KEY)

    if (!apiKeysData) {
      return []
    }

    return Object.values(apiKeysData)
      .map((data) => JSON.parse(data as string) as ApiKey)
      .filter((apiKey) => apiKey.businessId === businessId)
  } catch (error) {
    logger.error(`Failed to get API keys for business ${businessId}:`, error)
    return []
  }
}

/**
 * Delete an API key
 */
export async function deleteApiKey(id: string): Promise<boolean> {
  try {
    await redis.hdel(API_KEYS_KEY, id)
    return true
  } catch (error) {
    logger.error(`Failed to delete API key ${id}:`, error)
    return false
  }
}

