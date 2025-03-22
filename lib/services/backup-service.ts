"use server"

import { getRedisClient } from "../db/redis-client"
import { getCurrentUser } from "../db/users"
import { getBusinessById } from "../db/business"
import { revalidatePath } from "next/cache"
import { createHash } from "crypto"

// Types
export interface BackupMetadata {
  id: string
  businessId: string
  createdBy: string
  createdAt: string
  size: number
  checksum: string
  description: string
  version: string
  dataTypes: string[]
}

// Constants
const BACKUP_KEY_PREFIX = "backup:"
const BACKUP_METADATA_KEY = "backup_metadata"
const MAX_BACKUPS = 10

// Create a backup of the business data
export async function createBackup(description = ""): Promise<BackupMetadata | null> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("User not authenticated")
    }

    const business = await getBusinessById(user.businessId)
    if (!business) {
      throw new Error("Business not found")
    }

    const redis = getRedisClient()

    // Collect data to backup
    const dataToBackup: Record<string, any> = {}

    // Get all keys for this business
    const keys = await redis.keys(`*:${user.businessId}:*`)

    // Add each data type to the backup
    const dataTypes: string[] = []
    for (const key of keys) {
      const value = await redis.get(key)
      if (value) {
        dataToBackup[key] = value

        // Extract data type from key
        const dataType = key.split(":")[0]
        if (!dataTypes.includes(dataType)) {
          dataTypes.push(dataType)
        }
      }
    }

    // Create backup data
    const backupData = JSON.stringify(dataToBackup)
    const backupId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const backupKey = `${BACKUP_KEY_PREFIX}${user.businessId}:${backupId}`

    // Calculate checksum
    const checksum = createHash("sha256").update(backupData).digest("hex")

    // Create backup metadata
    const metadata: BackupMetadata = {
      id: backupId,
      businessId: user.businessId,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      size: backupData.length,
      checksum,
      description: description || `Backup created on ${new Date().toLocaleString()}`,
      version: "1.0",
      dataTypes,
    }

    // Store backup data and metadata
    await redis.set(backupKey, backupData)

    // Get existing metadata
    const metadataKey = `${BACKUP_METADATA_KEY}:${user.businessId}`
    const existingMetadataStr = await redis.get(metadataKey)
    let existingMetadata: BackupMetadata[] = []

    if (existingMetadataStr) {
      existingMetadata = JSON.parse(existingMetadataStr)
    }

    // Add new metadata and limit to MAX_BACKUPS
    existingMetadata.unshift(metadata)
    if (existingMetadata.length > MAX_BACKUPS) {
      // Remove oldest backups
      const toRemove = existingMetadata.splice(MAX_BACKUPS)

      // Delete the backup data for removed backups
      for (const oldBackup of toRemove) {
        const oldBackupKey = `${BACKUP_KEY_PREFIX}${user.businessId}:${oldBackup.id}`
        await redis.del(oldBackupKey)
      }
    }

    // Save updated metadata
    await redis.set(metadataKey, JSON.stringify(existingMetadata))

    revalidatePath("/dashboard/settings/backups")
    return metadata
  } catch (error) {
    console.error("Failed to create backup:", error)
    return null
  }
}

// Get all backups for the current business
export async function getBackups(): Promise<BackupMetadata[]> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("User not authenticated")
    }

    const redis = getRedisClient()
    const metadataKey = `${BACKUP_METADATA_KEY}:${user.businessId}`
    const metadataStr = await redis.get(metadataKey)

    if (!metadataStr) {
      return []
    }

    return JSON.parse(metadataStr)
  } catch (error) {
    console.error("Failed to get backups:", error)
    return []
  }
}

// Restore from a backup
export async function restoreBackup(backupId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("User not authenticated")
    }

    const redis = getRedisClient()

    // Get backup metadata
    const metadataKey = `${BACKUP_METADATA_KEY}:${user.businessId}`
    const metadataStr = await redis.get(metadataKey)

    if (!metadataStr) {
      throw new Error("No backups found")
    }

    const metadata: BackupMetadata[] = JSON.parse(metadataStr)
    const backupMetadata = metadata.find((b) => b.id === backupId)

    if (!backupMetadata) {
      throw new Error("Backup not found")
    }

    // Get backup data
    const backupKey = `${BACKUP_KEY_PREFIX}${user.businessId}:${backupId}`
    const backupDataStr = await redis.get(backupKey)

    if (!backupDataStr) {
      throw new Error("Backup data not found")
    }

    // Verify checksum
    const checksum = createHash("sha256").update(backupDataStr).digest("hex")
    if (checksum !== backupMetadata.checksum) {
      throw new Error("Backup data is corrupted")
    }

    // Parse backup data
    const backupData = JSON.parse(backupDataStr)

    // Restore each key
    for (const [key, value] of Object.entries(backupData)) {
      await redis.set(key, value as string)
    }

    revalidatePath("/dashboard")
    return true
  } catch (error) {
    console.error("Failed to restore backup:", error)
    return false
  }
}

// Delete a backup
export async function deleteBackup(backupId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("User not authenticated")
    }

    const redis = getRedisClient()

    // Get backup metadata
    const metadataKey = `${BACKUP_METADATA_KEY}:${user.businessId}`
    const metadataStr = await redis.get(metadataKey)

    if (!metadataStr) {
      throw new Error("No backups found")
    }

    const metadata: BackupMetadata[] = JSON.parse(metadataStr)
    const updatedMetadata = metadata.filter((b) => b.id !== backupId)

    if (metadata.length === updatedMetadata.length) {
      throw new Error("Backup not found")
    }

    // Delete backup data
    const backupKey = `${BACKUP_KEY_PREFIX}${user.businessId}:${backupId}`
    await redis.del(backupKey)

    // Update metadata
    await redis.set(metadataKey, JSON.stringify(updatedMetadata))

    revalidatePath("/dashboard/settings/backups")
    return true
  } catch (error) {
    console.error("Failed to delete backup:", error)
    return false
  }
}

