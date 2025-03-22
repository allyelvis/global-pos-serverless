"use server"

import { revalidatePath } from "next/cache"
import redis from "./redis"
import type { Order, OrderItem } from "../types"
import { generateId } from "../utils"
import { getAllCustomers } from "./customers"
import { getAllProducts } from "./products"

const ORDERS_KEY = "orders"
const ORDER_ITEMS_KEY = "order_items"

// Get all orders
export async function getAllOrders(): Promise<Order[]> {
  try {
    const ordersMap = (await redis.hgetall(ORDERS_KEY)) || {}
    return Object.values(ordersMap).map((item) => JSON.parse(item as string)) as Order[]
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return []
  }
}

// Get order by ID
export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const order = await redis.hget(ORDERS_KEY, id)
    return order ? (JSON.parse(order) as Order) : null
  } catch (error) {
    console.error(`Failed to fetch order ${id}:`, error)
    return null
  }
}

// Get order items by order ID
export async function getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> {
  try {
    const orderItemsMap = (await redis.hgetall(`${ORDER_ITEMS_KEY}:${orderId}`)) || {}
    return Object.values(orderItemsMap).map((item) => JSON.parse(item as string)) as OrderItem[]
  } catch (error) {
    console.error(`Failed to fetch order items for order ${orderId}:`, error)
    return []
  }
}

// Create a new order with items
export async function createOrder(
  orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">,
  orderItems: Omit<OrderItem, "id" | "orderId" | "createdAt" | "updatedAt">[],
): Promise<Order | null> {
  try {
    const id = generateId()
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`

    const order: Order = {
      id,
      orderNumber,
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(ORDERS_KEY, id, JSON.stringify(order))

    // Create order items
    for (const item of orderItems) {
      const itemId = generateId()
      const orderItem: OrderItem = {
        id: itemId,
        orderId: id,
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await redis.hset(`${ORDER_ITEMS_KEY}:${id}`, itemId, JSON.stringify(orderItem))
    }

    revalidatePath("/dashboard/orders")
    return order
  } catch (error) {
    console.error("Failed to create order:", error)
    return null
  }
}

// Update an existing order
export async function updateOrder(id: string, orderData: Partial<Order>): Promise<Order | null> {
  try {
    const existingOrder = await getOrderById(id)
    if (!existingOrder) return null

    const updatedOrder: Order = {
      ...existingOrder,
      ...orderData,
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(ORDERS_KEY, id, JSON.stringify(updatedOrder))
    revalidatePath("/dashboard/orders")
    return updatedOrder
  } catch (error) {
    console.error(`Failed to update order ${id}:`, error)
    return null
  }
}

// Delete an order and its items
export async function deleteOrder(id: string): Promise<boolean> {
  try {
    await redis.hdel(ORDERS_KEY, id)
    await redis.del(`${ORDER_ITEMS_KEY}:${id}`)
    revalidatePath("/dashboard/orders")
    return true
  } catch (error) {
    console.error(`Failed to delete order ${id}:`, error)
    return false
  }
}

// Seed initial orders data if none exists
export async function seedOrdersIfEmpty(): Promise<void> {
  try {
    const ordersCount = await redis.hlen(ORDERS_KEY)

    if (ordersCount === 0) {
      const initialOrders: Array<{
        order: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">
        items: Omit<OrderItem, "id" | "orderId" | "createdAt" | "updatedAt">[]
      }> = [
        {
          order: {
            customerId: "1", // Will be replaced with actual customer ID
            userId: "user-123",
            businessId: "default",
            status: "completed",
            paymentMethod: "credit_card",
            subtotal: 139.97,
            tax: 10.0,
            discount: 0,
            total: 149.97,
            notes: "",
          },
          items: [
            {
              productId: "1", // Will be replaced with actual product ID
              quantity: 2,
              price: 19.99,
              discount: 0,
              total: 39.98,
            },
            {
              productId: "2", // Will be replaced with actual product ID
              quantity: 1,
              price: 49.99,
              discount: 0,
              total: 49.99,
            },
            {
              productId: "4", // Will be replaced with actual product ID
              quantity: 1,
              price: 39.99,
              discount: 0,
              total: 39.99,
            },
          ],
        },
        {
          order: {
            customerId: "2", // Will be replaced with actual customer ID
            userId: "user-123",
            businessId: "default",
            status: "completed",
            paymentMethod: "cash",
            subtotal: 89.99,
            tax: 0,
            discount: 0,
            total: 89.99,
            notes: "",
          },
          items: [
            {
              productId: "6", // Will be replaced with actual product ID
              quantity: 1,
              price: 89.99,
              discount: 0,
              total: 89.99,
            },
          ],
        },
        {
          order: {
            customerId: "3", // Will be replaced with actual customer ID
            userId: "user-123",
            businessId: "default",
            status: "completed",
            paymentMethod: "credit_card",
            subtotal: 129.99,
            tax: 0,
            discount: 0,
            total: 129.99,
            notes: "",
          },
          items: [
            {
              productId: "5", // Will be replaced with actual product ID
              quantity: 1,
              price: 129.99,
              discount: 0,
              total: 129.99,
            },
          ],
        },
        {
          order: {
            customerId: "4", // Will be replaced with actual customer ID
            userId: "user-123",
            businessId: "default",
            status: "pending",
            paymentMethod: "credit_card",
            subtotal: 79.99,
            tax: 0,
            discount: 0,
            total: 79.99,
            notes: "",
          },
          items: [
            {
              productId: "3", // Will be replaced with actual product ID
              quantity: 1,
              price: 79.99,
              discount: 0,
              total: 79.99,
            },
          ],
        },
      ]

      // Get actual customer and product IDs
      const customers = await getAllCustomers()
      const products = await getAllProducts()

      for (let i = 0; i < initialOrders.length; i++) {
        const orderData = initialOrders[i]

        // Replace placeholder IDs with actual IDs
        if (customers[i]) {
          orderData.order.customerId = customers[i].id
        }

        for (let j = 0; j < orderData.items.length; j++) {
          const item = orderData.items[j]
          const productIndex = Number.parseInt(item.productId) - 1

          if (products[productIndex]) {
            item.productId = products[productIndex].id
          }
        }

        await createOrder(orderData.order, orderData.items)
      }

      console.log("Seeded initial orders data")
    }
  } catch (error) {
    console.error("Failed to seed orders:", error)
  }
}

