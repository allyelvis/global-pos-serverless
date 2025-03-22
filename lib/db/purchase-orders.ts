"use server"

import { revalidatePath } from "next/cache"
import redis from "./redis"
import type { PurchaseOrder, PurchaseOrderItem } from "../types"
import { generateId } from "../utils"

const PURCHASE_ORDERS_KEY = "purchase_orders"
const PURCHASE_ORDER_ITEMS_KEY = "purchase_order_items"

// Get all purchase orders
export async function getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
  try {
    const purchaseOrdersMap = (await redis.hgetall(PURCHASE_ORDERS_KEY)) || {}
    return Object.values(purchaseOrdersMap).map((item) => JSON.parse(item as string)) as PurchaseOrder[]
  } catch (error) {
    console.error("Failed to fetch purchase orders:", error)
    return []
  }
}

// Get purchase order by ID
export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
  try {
    const purchaseOrder = await redis.hget(PURCHASE_ORDERS_KEY, id)
    return purchaseOrder ? (JSON.parse(purchaseOrder) as PurchaseOrder) : null
  } catch (error) {
    console.error(`Failed to fetch purchase order ${id}:`, error)
    return null
  }
}

// Get purchase order items by purchase order ID
export async function getPurchaseOrderItemsByPurchaseOrderId(purchaseOrderId: string): Promise<PurchaseOrderItem[]> {
  try {
    const purchaseOrderItemsMap = (await redis.hgetall(`${PURCHASE_ORDER_ITEMS_KEY}:${purchaseOrderId}`)) || {}
    return Object.values(purchaseOrderItemsMap).map((item) => JSON.parse(item as string)) as PurchaseOrderItem[]
  } catch (error) {
    console.error(`Failed to fetch purchase order items for purchase order ${purchaseOrderId}:`, error)
    return []
  }
}

// Create a new purchase order with items
export async function createPurchaseOrder(
  purchaseOrderData: Omit<PurchaseOrder, "id" | "poNumber" | "createdAt" | "updatedAt">,
  purchaseOrderItems: Omit<PurchaseOrderItem, "id" | "purchaseOrderId">[],
): Promise<PurchaseOrder | null> {
  try {
    const id = generateId()
    const poNumber = `PO-${Date.now().toString().slice(-6)}`

    const purchaseOrder: PurchaseOrder = {
      id,
      poNumber,
      ...purchaseOrderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(PURCHASE_ORDERS_KEY, id, JSON.stringify(purchaseOrder))

    // Create purchase order items
    for (const item of purchaseOrderItems) {
      const itemId = generateId()
      const purchaseOrderItem: PurchaseOrderItem = {
        id: itemId,
        purchaseOrderId: id,
        ...item,
      }

      await redis.hset(`${PURCHASE_ORDER_ITEMS_KEY}:${id}`, itemId, JSON.stringify(purchaseOrderItem))
    }

    revalidatePath("/dashboard/purchase-orders")
    return purchaseOrder
  } catch (error) {
    console.error("Failed to create purchase order:", error)
    return null
  }
}

// Update an existing purchase order
export async function updatePurchaseOrder(
  id: string,
  purchaseOrderData: Partial<PurchaseOrder>,
): Promise<PurchaseOrder | null> {
  try {
    const existingPurchaseOrder = await getPurchaseOrderById(id)
    if (!existingPurchaseOrder) return null

    const updatedPurchaseOrder: PurchaseOrder = {
      ...existingPurchaseOrder,
      ...purchaseOrderData,
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(PURCHASE_ORDERS_KEY, id, JSON.stringify(updatedPurchaseOrder))
    revalidatePath("/dashboard/purchase-orders")
    return updatedPurchaseOrder
  } catch (error) {
    console.error(`Failed to update purchase order ${id}:`, error)
    return null
  }
}

// Delete a purchase order and its items
export async function deletePurchaseOrder(id: string): Promise<boolean> {
  try {
    await redis.hdel(PURCHASE_ORDERS_KEY, id)
    await redis.del(`${PURCHASE_ORDER_ITEMS_KEY}:${id}`)
    revalidatePath("/dashboard/purchase-orders")
    return true
  } catch (error) {
    console.error(`Failed to delete purchase order ${id}:`, error)
    return false
  }
}

// Add or update purchase order items
export async function updatePurchaseOrderItems(
  purchaseOrderId: string,
  items: (Omit<PurchaseOrderItem, "id" | "purchaseOrderId"> & { id?: string })[],
): Promise<boolean> {
  try {
    const existingItems = await getPurchaseOrderItemsByPurchaseOrderId(purchaseOrderId)

    // Delete existing items that are not in the new list
    const newItemIds = items.filter((item) => item.id).map((item) => item.id)
    for (const existingItem of existingItems) {
      if (!newItemIds.includes(existingItem.id)) {
        await redis.hdel(`${PURCHASE_ORDER_ITEMS_KEY}:${purchaseOrderId}`, existingItem.id)
      }
    }

    // Add or update items
    for (const item of items) {
      const itemId = item.id || generateId()
      const purchaseOrderItem: PurchaseOrderItem = {
        id: itemId,
        purchaseOrderId,
        productId: item.productId,
        quantity: item.quantity,
        receivedQuantity: item.receivedQuantity,
        price: item.price,
        total: item.total,
      }

      await redis.hset(`${PURCHASE_ORDER_ITEMS_KEY}:${purchaseOrderId}`, itemId, JSON.stringify(purchaseOrderItem))
    }

    revalidatePath("/dashboard/purchase-orders")
    return true
  } catch (error) {
    console.error(`Failed to update purchase order items for ${purchaseOrderId}:`, error)
    return false
  }
}

// Receive purchase order (mark as received)
export async function receivePurchaseOrder(id: string, receivedDate: string): Promise<PurchaseOrder | null> {
  try {
    const existingPurchaseOrder = await getPurchaseOrderById(id)
    if (!existingPurchaseOrder) return null

    const updatedPurchaseOrder: PurchaseOrder = {
      ...existingPurchaseOrder,
      status: "received",
      receivedDate,
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(PURCHASE_ORDERS_KEY, id, JSON.stringify(updatedPurchaseOrder))

    // Update inventory based on received items
    const items = await getPurchaseOrderItemsByPurchaseOrderId(id)
    for (const item of items) {
      // Update product stock
      // In a real implementation, this would call a function to update the product stock
      console.log(`Updating stock for product ${item.productId}: +${item.quantity}`)
    }

    revalidatePath("/dashboard/purchase-orders")
    return updatedPurchaseOrder
  } catch (error) {
    console.error(`Failed to receive purchase order ${id}:`, error)
    return null
  }
}

