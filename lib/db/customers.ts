"use server"

import { revalidatePath } from "next/cache"
import redis from "./redis"
import type { Customer } from "../types"
import { generateId } from "../utils"

const CUSTOMERS_KEY = "customers"

// Get all customers
export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const customersMap = (await redis.hgetall(CUSTOMERS_KEY)) || {}
    return Object.values(customersMap).map((item) => JSON.parse(item as string)) as Customer[]
  } catch (error) {
    console.error("Failed to fetch customers:", error)
    return []
  }
}

// Get customer by ID
export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const customer = await redis.hget(CUSTOMERS_KEY, id)
    return customer ? (JSON.parse(customer) as Customer) : null
  } catch (error) {
    console.error(`Failed to fetch customer ${id}:`, error)
    return null
  }
}

// Create a new customer
export async function createCustomer(
  customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">,
): Promise<Customer | null> {
  try {
    const id = generateId()
    const customer: Customer = {
      id,
      ...customerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(CUSTOMERS_KEY, id, JSON.stringify(customer))
    revalidatePath("/dashboard/customers")
    return customer
  } catch (error) {
    console.error("Failed to create customer:", error)
    return null
  }
}

// Update an existing customer
export async function updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer | null> {
  try {
    const existingCustomer = await getCustomerById(id)
    if (!existingCustomer) return null

    const updatedCustomer: Customer = {
      ...existingCustomer,
      ...customerData,
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(CUSTOMERS_KEY, id, JSON.stringify(updatedCustomer))
    revalidatePath("/dashboard/customers")
    return updatedCustomer
  } catch (error) {
    console.error(`Failed to update customer ${id}:`, error)
    return null
  }
}

// Delete a customer
export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    await redis.hdel(CUSTOMERS_KEY, id)
    revalidatePath("/dashboard/customers")
    return true
  } catch (error) {
    console.error(`Failed to delete customer ${id}:`, error)
    return false
  }
}

// Seed initial customers data if none exists
export async function seedCustomersIfEmpty(): Promise<void> {
  try {
    const customersCount = await redis.hlen(CUSTOMERS_KEY)

    if (customersCount === 0) {
      const initialCustomers: Omit<Customer, "id" | "createdAt" | "updatedAt">[] = [
        {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "555-123-4567",
          address: "123 Main St, Anytown, USA",
          businessId: "default",
          joinDate: "2023-01-15",
          totalSpent: 1245.67,
          lastPurchase: "2023-05-10",
          loyaltyPoints: 450,
          notes: "Prefers email communication",
        },
        {
          name: "Jane Smith",
          email: "jane.smith@example.com",
          phone: "555-234-5678",
          address: "456 Oak Ave, Somewhere, USA",
          businessId: "default",
          joinDate: "2023-02-20",
          totalSpent: 876.54,
          lastPurchase: "2023-05-12",
          loyaltyPoints: 320,
          notes: "",
        },
        {
          name: "Robert Johnson",
          email: "robert.johnson@example.com",
          phone: "555-345-6789",
          address: "789 Pine Rd, Elsewhere, USA",
          businessId: "default",
          joinDate: "2023-03-05",
          totalSpent: 2345.89,
          lastPurchase: "2023-05-08",
          loyaltyPoints: 780,
          notes: "VIP customer",
        },
        {
          name: "Emily Brown",
          email: "emily.brown@example.com",
          phone: "555-456-7890",
          address: "101 Cedar Ln, Nowhere, USA",
          businessId: "default",
          joinDate: "2023-03-15",
          totalSpent: 567.32,
          lastPurchase: "2023-04-30",
          loyaltyPoints: 180,
          notes: "",
        },
        {
          name: "Michael Wilson",
          email: "michael.wilson@example.com",
          phone: "555-567-8901",
          address: "202 Maple Dr, Anywhere, USA",
          businessId: "default",
          joinDate: "2023-04-01",
          totalSpent: 1678.45,
          lastPurchase: "2023-05-15",
          loyaltyPoints: 520,
          notes: "Allergic to latex",
        },
      ]

      for (const customer of initialCustomers) {
        await createCustomer(customer)
      }

      console.log("Seeded initial customers data")
    }
  } catch (error) {
    console.error("Failed to seed customers:", error)
  }
}

