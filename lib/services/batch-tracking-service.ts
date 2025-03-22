"use server"

import { revalidatePath } from "next/cache"
import redis from "../db/redis"
import { generateId } from "../utils"
import { logger } from "../logger"

export interface ProductBatch {
  id: string
  productId: string
  batchNumber: string
  expiryDate: string
  manufacturingDate?: string
  quantity: number
  cost: number
  locationId: string
  receivedDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

const PRODUCT_BATCHES_KEY = "product_batches"
const PRODUCT_BATCHES_BY_PRODUCT_KEY = "product_batches_by_product"

export class BatchTrackingService {
  /**
   * Create a new product batch
   */
  static async createBatch(batchData: Omit<ProductBatch, "id" | "createdAt" | "updatedAt">): Promise<ProductBatch> {
    try {
      const id = generateId()
      const batch: ProductBatch = {
        id,
        ...batchData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Store batch in main batches hash
      await redis.hset(PRODUCT_BATCHES_KEY, id, JSON.stringify(batch))

      // Store batch ID in product's batches set
      await redis.sadd(`${PRODUCT_BATCHES_BY_PRODUCT_KEY}:${batchData.productId}`, id)

      revalidatePath(`/dashboard/products/${batchData.productId}`)
      revalidatePath("/dashboard/inventory")

      return batch
    } catch (error) {
      logger.error("Failed to create product batch:", error)
      throw error
    }
  }

  /**
   * Get a batch by ID
   */
  static async getBatchById(id: string): Promise<ProductBatch | null> {
    try {
      const batchData = await redis.hget(PRODUCT_BATCHES_KEY, id)
      return batchData ? (JSON.parse(batchData) as ProductBatch) : null
    } catch (error) {
      logger.error(`Failed to get batch ${id}:`, error)
      return null
    }
  }

  /**
   * Get all batches for a product
   */
  static async getBatchesByProductId(productId: string): Promise<ProductBatch[]> {
    try {
      const batchIds = await redis.smembers(`${PRODUCT_BATCHES_BY_PRODUCT_KEY}:${productId}`)

      if (!batchIds.length) {
        return []
      }

      const batchesData = await Promise.all(batchIds.map((id) => redis.hget(PRODUCT_BATCHES_KEY, id)))

      return batchesData.filter((data) => data !== null).map((data) => JSON.parse(data as string) as ProductBatch)
    } catch (error) {
      logger.error(`Failed to get batches for product ${productId}:`, error)
      return []
    }
  }

  /**
   * Update a batch
   */
  static async updateBatch(id: string, batchData: Partial<ProductBatch>): Promise<ProductBatch | null> {
    try {
      const existingBatch = await this.getBatchById(id)

      if (!existingBatch) {
        return null
      }

      const updatedBatch: ProductBatch = {
        ...existingBatch,
        ...batchData,
        updatedAt: new Date().toISOString(),
      }

      await redis.hset(PRODUCT_BATCHES_KEY, id, JSON.stringify(updatedBatch))

      revalidatePath(`/dashboard/products/${existingBatch.productId}`)
      revalidatePath("/dashboard/inventory")

      return updatedBatch
    } catch (error) {
      logger.error(`Failed to update batch ${id}:`, error)
      return null
    }
  }

  /**
   * Delete a batch
   */
  static async deleteBatch(id: string): Promise<boolean> {
    try {
      const batch = await this.getBatchById(id)

      if (!batch) {
        return false
      }

      // Remove batch from main batches hash
      await redis.hdel(PRODUCT_BATCHES_KEY, id)

      // Remove batch ID from product's batches set
      await redis.srem(`${PRODUCT_BATCHES_BY_PRODUCT_KEY}:${batch.productId}`, id)

      revalidatePath(`/dashboard/products/${batch.productId}`)
      revalidatePath("/dashboard/inventory")

      return true
    } catch (error) {
      logger.error(`Failed to delete batch ${id}:`, error)
      return false
    }
  }

  /**
   * Get soon-to-expire batches
   */
  static async getSoonToExpireBatches(daysThreshold = 30): Promise<ProductBatch[]> {
    try {
      const allBatchesData = await redis.hgetall(PRODUCT_BATCHES_KEY)

      if (!allBatchesData) {
        return []
      }

      const now = new Date()
      const thresholdDate = new Date()
      thresholdDate.setDate(now.getDate() + daysThreshold)

      return Object.values(allBatchesData)
        .map((data) => JSON.parse(data as string) as ProductBatch)
        .filter((batch) => {
          const expiryDate = new Date(batch.expiryDate)
          return expiryDate > now && expiryDate <= thresholdDate && batch.quantity > 0
        })
    } catch (error) {
      logger.error("Failed to get soon-to-expire batches:", error)
      return []
    }
  }

  /**
   * Get expired batches
   */
  static async getExpiredBatches(): Promise<ProductBatch[]> {
    try {
      const allBatchesData = await redis.hgetall(PRODUCT_BATCHES_KEY)

      if (!allBatchesData) {
        return []
      }

      const now = new Date()

      return Object.values(allBatchesData)
        .map((data) => JSON.parse(data as string) as ProductBatch)
        .filter((batch) => {
          const expiryDate = new Date(batch.expiryDate)
          return expiryDate <= now && batch.quantity > 0
        })
    } catch (error) {
      logger.error("Failed to get expired batches:", error)
      return []
    }
  }

  /**
   * Adjust batch quantity
   */
  static async adjustBatchQuantity(id: string, adjustment: number, reason: string): Promise<ProductBatch | null> {
    try {
      const batch = await this.getBatchById(id)

      if (!batch) {
        return null
      }

      const newQuantity = batch.quantity + adjustment

      if (newQuantity < 0) {
        throw new Error("Adjustment would result in negative quantity")
      }

      const updatedBatch = await this.updateBatch(id, { quantity: newQuantity })

      // Log the adjustment
      logger.info(`Batch ${id} quantity adjusted by ${adjustment} (${reason})`)

      return updatedBatch
    } catch (error) {
      logger.error(`Failed to adjust batch ${id} quantity:`, error)
      return null
    }
  }
}

