"use server"

import { revalidatePath } from "next/cache"
import redis from "../db/redis"
import { generateId } from "../utils"
import { logger } from "../logger"

export interface Warehouse {
  id: string
  name: string
  address: string
  phone?: string
  email?: string
  businessId: string
  isActive: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface WarehouseInventory {
  warehouseId: string
  productId: string
  quantity: number
  reservedQuantity: number
  lastUpdated: string
}

export interface InventoryTransfer {
  id: string
  referenceNumber: string
  fromWarehouseId: string
  toWarehouseId: string
  status: "pending" | "in_transit" | "completed" | "cancelled"
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  items: InventoryTransferItem[]
}

export interface InventoryTransferItem {
  id: string
  transferId: string
  productId: string
  quantity: number
  receivedQuantity: number
}

const WAREHOUSES_KEY = "warehouses"
const WAREHOUSE_INVENTORY_KEY = "warehouse_inventory"
const INVENTORY_TRANSFERS_KEY = "inventory_transfers"
const INVENTORY_TRANSFER_ITEMS_KEY = "inventory_transfer_items"

export class WarehouseService {
  /**
   * Create a new warehouse
   */
  static async createWarehouse(warehouseData: Omit<Warehouse, "id" | "createdAt" | "updatedAt">): Promise<Warehouse> {
    try {
      const id = generateId()
      const warehouse: Warehouse = {
        id,
        ...warehouseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await redis.hset(WAREHOUSES_KEY, id, JSON.stringify(warehouse))

      revalidatePath("/dashboard/warehouses")

      return warehouse
    } catch (error) {
      logger.error("Failed to create warehouse:", error)
      throw error
    }
  }

  /**
   * Get a warehouse by ID
   */
  static async getWarehouseById(id: string): Promise<Warehouse | null> {
    try {
      const warehouseData = await redis.hget(WAREHOUSES_KEY, id)
      return warehouseData ? (JSON.parse(warehouseData) as Warehouse) : null
    } catch (error) {
      logger.error(`Failed to get warehouse ${id}:`, error)
      return null
    }
  }

  /**
   * Get all warehouses
   */
  static async getAllWarehouses(): Promise<Warehouse[]> {
    try {
      const warehousesData = await redis.hgetall(WAREHOUSES_KEY)

      if (!warehousesData) {
        return []
      }

      return Object.values(warehousesData).map((data) => JSON.parse(data as string) as Warehouse)
    } catch (error) {
      logger.error("Failed to get all warehouses:", error)
      return []
    }
  }

  /**
   * Update a warehouse
   */
  static async updateWarehouse(id: string, warehouseData: Partial<Warehouse>): Promise<Warehouse | null> {
    try {
      const existingWarehouse = await this.getWarehouseById(id)

      if (!existingWarehouse) {
        return null
      }

      const updatedWarehouse: Warehouse = {
        ...existingWarehouse,
        ...warehouseData,
        updatedAt: new Date().toISOString(),
      }

      await redis.hset(WAREHOUSES_KEY, id, JSON.stringify(updatedWarehouse))

      revalidatePath("/dashboard/warehouses")

      return updatedWarehouse
    } catch (error) {
      logger.error(`Failed to update warehouse ${id}:`, error)
      return null
    }
  }

  /**
   * Delete a warehouse
   */
  static async deleteWarehouse(id: string): Promise<boolean> {
    try {
      // Check if warehouse exists
      const warehouse = await this.getWarehouseById(id)

      if (!warehouse) {
        return false
      }

      // Check if warehouse has inventory
      const inventoryItems = await this.getWarehouseInventory(id)

      if (inventoryItems.length > 0) {
        throw new Error("Cannot delete warehouse with existing inventory")
      }

      // Delete warehouse
      await redis.hdel(WAREHOUSES_KEY, id)

      revalidatePath("/dashboard/warehouses")

      return true
    } catch (error) {
      logger.error(`Failed to delete warehouse ${id}:`, error)
      return false
    }
  }

  /**
   * Get warehouse inventory
   */
  static async getWarehouseInventory(warehouseId: string): Promise<WarehouseInventory[]> {
    try {
      const inventoryData = await redis.hgetall(`${WAREHOUSE_INVENTORY_KEY}:${warehouseId}`)

      if (!inventoryData) {
        return []
      }

      return Object.values(inventoryData).map((data) => JSON.parse(data as string) as WarehouseInventory)
    } catch (error) {
      logger.error(`Failed to get inventory for warehouse ${warehouseId}:`, error)
      return []
    }
  }

  /**
   * Update warehouse inventory
   */
  static async updateWarehouseInventory(
    warehouseId: string,
    productId: string,
    quantity: number,
    reservedQuantity = 0,
  ): Promise<WarehouseInventory | null> {
    try {
      const inventoryKey = `${WAREHOUSE_INVENTORY_KEY}:${warehouseId}`

      // Get current inventory
      const currentInventoryData = await redis.hget(inventoryKey, productId)
      let currentInventory: WarehouseInventory | null = null

      if (currentInventoryData) {
        currentInventory = JSON.parse(currentInventoryData) as WarehouseInventory
      }

      // Create or update inventory
      const updatedInventory: WarehouseInventory = {
        warehouseId,
        productId,
        quantity,
        reservedQuantity: currentInventory ? currentInventory.reservedQuantity + reservedQuantity : reservedQuantity,
        lastUpdated: new Date().toISOString(),
      }

      await redis.hset(inventoryKey, productId, JSON.stringify(updatedInventory))

      revalidatePath(`/dashboard/warehouses/${warehouseId}`)
      revalidatePath(`/dashboard/products/${productId}`)

      return updatedInventory
    } catch (error) {
      logger.error(`Failed to update inventory for warehouse ${warehouseId}, product ${productId}:`, error)
      return null
    }
  }

  /**
   * Create inventory transfer
   */
  static async createInventoryTransfer(
    transferData: Omit<InventoryTransfer, "id" | "referenceNumber" | "createdAt" | "updatedAt" | "items">,
    items: Omit<InventoryTransferItem, "id" | "transferId">[],
  ): Promise<InventoryTransfer | null> {
    try {
      const id = generateId()
      const referenceNumber = `TRF-${Date.now().toString().slice(-6)}`

      // Validate source warehouse has enough inventory
      const sourceWarehouseInventory = await this.getWarehouseInventory(transferData.fromWarehouseId)

      for (const item of items) {
        const inventoryItem = sourceWarehouseInventory.find((i) => i.productId === item.productId)

        if (!inventoryItem || inventoryItem.quantity < item.quantity) {
          throw new Error(`Insufficient inventory for product ${item.productId} in source warehouse`)
        }
      }

      // Create transfer
      const transfer: InventoryTransfer = {
        id,
        referenceNumber,
        ...transferData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [],
      }

      await redis.hset(INVENTORY_TRANSFERS_KEY, id, JSON.stringify(transfer))

      // Create transfer items
      const transferItems: InventoryTransferItem[] = []

      for (const item of items) {
        const itemId = generateId()
        const transferItem: InventoryTransferItem = {
          id: itemId,
          transferId: id,
          productId: item.productId,
          quantity: item.quantity,
          receivedQuantity: 0,
        }

        await redis.hset(`${INVENTORY_TRANSFER_ITEMS_KEY}:${id}`, itemId, JSON.stringify(transferItem))
        transferItems.push(transferItem)

        // Reserve inventory in source warehouse
        await this.updateWarehouseInventory(transferData.fromWarehouseId, item.productId, 0, item.quantity)
      }

      // Update transfer with items
      transfer.items = transferItems

      revalidatePath("/dashboard/inventory/transfers")

      return transfer
    } catch (error) {
      logger.error("Failed to create inventory transfer:", error)
      return null
    }
  }

  /**
   * Complete inventory transfer
   */
  static async completeInventoryTransfer(id: string): Promise<InventoryTransfer | null> {
    try {
      const transfer = await this.getInventoryTransferById(id)

      if (!transfer) {
        return null
      }

      if (transfer.status !== "in_transit") {
        throw new Error("Transfer must be in transit to complete")
      }

      // Update transfer status
      const updatedTransfer: InventoryTransfer = {
        ...transfer,
        status: "completed",
        updatedAt: new Date().toISOString(),
      }

      await redis.hset(INVENTORY_TRANSFERS_KEY, id, JSON.stringify(updatedTransfer))

      // Update inventory in both warehouses
      for (const item of transfer.items) {
        // Reduce inventory in source warehouse
        await this.updateWarehouseInventory(
          transfer.fromWarehouseId,
          item.productId,
          -item.quantity,
          -item.quantity, // Remove reservation
        )

        // Increase inventory in destination warehouse
        await this.updateWarehouseInventory(transfer.toWarehouseId, item.productId, item.receivedQuantity, 0)
      }

      revalidatePath("/dashboard/inventory/transfers")

      return updatedTransfer
    } catch (error) {
      logger.error(`Failed to complete inventory transfer ${id}:`, error)
      return null
    }
  }

  /**
   * Get inventory transfer by ID
   */
  static async getInventoryTransferById(id: string): Promise<InventoryTransfer | null> {
    try {
      const transferData = await redis.hget(INVENTORY_TRANSFERS_KEY, id)

      if (!transferData) {
        return null
      }

      const transfer = JSON.parse(transferData) as InventoryTransfer

      // Get transfer items
      const itemsData = await redis.hgetall(`${INVENTORY_TRANSFER_ITEMS_KEY}:${id}`)

      if (itemsData) {
        transfer.items = Object.values(itemsData).map((data) => JSON.parse(data as string) as InventoryTransferItem)
      } else {
        transfer.items = []
      }

      return transfer
    } catch (error) {
      logger.error(`Failed to get inventory transfer ${id}:`, error)
      return null
    }
  }

  /**
   * Get all inventory transfers
   */
  static async getAllInventoryTransfers(): Promise<InventoryTransfer[]> {
    try {
      const transfersData = await redis.hgetall(INVENTORY_TRANSFERS_KEY)

      if (!transfersData) {
        return []
      }

      const transfers = await Promise.all(Object.keys(transfersData).map((id) => this.getInventoryTransferById(id)))

      return transfers.filter((t) => t !== null) as InventoryTransfer[]
    } catch (error) {
      logger.error("Failed to get all inventory transfers:", error)
      return []
    }
  }
}

