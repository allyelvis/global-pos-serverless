"use server"

import { revalidatePath } from "next/cache"
import redis from "../db/redis"
import logger from "../logger"
import { generateId } from "../utils"

// Types for sync operations
type SyncOperation = {
  id: string
  type: "create" | "update" | "delete"
  entity: string
  data: any
  timestamp: string
  status: "pending" | "completed" | "failed"
  error?: string
  retryCount: number
}

// Redis keys
const SYNC_OPERATIONS_KEY = "sync_operations"
const SYNC_STATUS_KEY = "sync_status"

// Add a sync operation
export async function addSyncOperation(
  type: "create" | "update" | "delete",
  entity: string,
  data: any,
): Promise<SyncOperation> {
  try {
    const id = generateId()
    const now = new Date().toISOString()

    const operation: SyncOperation = {
      id,
      type,
      entity,
      data,
      timestamp: now,
      status: "pending",
      retryCount: 0,
    }

    await redis.hset(SYNC_OPERATIONS_KEY, id, JSON.stringify(operation))
    return operation
  } catch (error) {
    logger.error("Failed to add sync operation", error as Error)
    throw error
  }
}

// Get pending sync operations
export async function getPendingSyncOperations(): Promise<SyncOperation[]> {
  try {
    const operationsMap = (await redis.hgetall(SYNC_OPERATIONS_KEY)) || {}
    const operations = Object.values(operationsMap)
      .map((op) => JSON.parse(op as string) as SyncOperation)
      .filter((op) => op.status === "pending")
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return operations
  } catch (error) {
    logger.error("Failed to get pending sync operations", error as Error)
    return []
  }
}

// Update sync operation status
export async function updateSyncOperationStatus(
  id: string,
  status: "completed" | "failed",
  error?: string,
): Promise<boolean> {
  try {
    const operationJson = await redis.hget(SYNC_OPERATIONS_KEY, id)
    if (!operationJson) return false

    const operation = JSON.parse(operationJson) as SyncOperation
    operation.status = status

    if (status === "failed") {
      operation.error = error
      operation.retryCount += 1
    }

    await redis.hset(SYNC_OPERATIONS_KEY, id, JSON.stringify(operation))
    return true
  } catch (error) {
    logger.error(`Failed to update sync operation status for ${id}`, error as Error)
    return false
  }
}

// Process pending sync operations
export async function processPendingSyncOperations(): Promise<{
  success: boolean
  processed: number
  failed: number
}> {
  try {
    const pendingOperations = await getPendingSyncOperations()
    let processed = 0
    let failed = 0

    for (const operation of pendingOperations) {
      try {
        // Skip operations that have been retried too many times
        if (operation.retryCount >= 5) {
          logger.warn(`Skipping sync operation ${operation.id} after ${operation.retryCount} retries`)
          continue
        }

        // Process the operation based on type and entity
        // This is a simplified implementation - in a real system you'd have more complex logic
        switch (operation.entity) {
          case "product":
            // Process product operations
            await processProductOperation(operation)
            break
          case "order":
            // Process order operations
            await processOrderOperation(operation)
            break
          case "customer":
            // Process customer operations
            await processCustomerOperation(operation)
            break
          default:
            throw new Error(`Unknown entity type: ${operation.entity}`)
        }

        // Mark as completed
        await updateSyncOperationStatus(operation.id, "completed")
        processed++
      } catch (error) {
        logger.error(`Failed to process sync operation ${operation.id}`, error as Error)
        await updateSyncOperationStatus(
          operation.id,
          "failed",
          error instanceof Error ? error.message : "Unknown error",
        )
        failed++
      }
    }

    // Update sync status
    await updateSyncStatus({
      lastSyncAttempt: new Date().toISOString(),
      pendingOperations: pendingOperations.length - processed,
      lastSyncSuccess: failed === 0,
    })

    // Revalidate relevant paths
    revalidatePath("/dashboard/products")
    revalidatePath("/dashboard/orders")
    revalidatePath("/dashboard/customers")

    return { success: true, processed, failed }
  } catch (error) {
    logger.error("Failed to process pending sync operations", error as Error)
    return { success: false, processed: 0, failed: 0 }
  }
}

// Process product operation (simplified)
async function processProductOperation(operation: SyncOperation): Promise<void> {
  // Implementation would depend on your product data structure
  // This is a placeholder
  logger.info(`Processing product operation: ${operation.type}`, { productId: operation.data.id })
}

// Process order operation (simplified)
async function processOrderOperation(operation: SyncOperation): Promise<void> {
  // Implementation would depend on your order data structure
  // This is a placeholder
  logger.info(`Processing order operation: ${operation.type}`, { orderId: operation.data.id })
}

// Process customer operation (simplified)
async function processCustomerOperation(operation: SyncOperation): Promise<void> {
  // Implementation would depend on your customer data structure
  // This is a placeholder
  logger.info(`Processing customer operation: ${operation.type}`, { customerId: operation.data.id })
}

// Get sync status
export async function getSyncStatus(): Promise<{
  lastSyncAttempt: string | null
  lastSyncSuccess: boolean
  pendingOperations: number
}> {
  try {
    const statusJson = await redis.get(SYNC_STATUS_KEY)

    if (!statusJson) {
      return {
        lastSyncAttempt: null,
        lastSyncSuccess: true,
        pendingOperations: 0,
      }
    }

    return JSON.parse(statusJson)
  } catch (error) {
    logger.error("Failed to get sync status", error as Error)
    return {
      lastSyncAttempt: null,
      lastSyncSuccess: true,
      pendingOperations: 0,
    }
  }
}

// Update sync status
export async function updateSyncStatus(
  status: Partial<{
    lastSyncAttempt: string
    lastSyncSuccess: boolean
    pendingOperations: number
  }>,
): Promise<boolean> {
  try {
    const currentStatus = await getSyncStatus()
    const updatedStatus = { ...currentStatus, ...status }

    await redis.set(SYNC_STATUS_KEY, JSON.stringify(updatedStatus))
    return true
  } catch (error) {
    logger.error("Failed to update sync status", error as Error)
    return false
  }
}

