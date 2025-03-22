"use server"

import { revalidatePath } from "next/cache"
import redis from "./redis"
import type { Business } from "../types"
import { generateId } from "../utils"

const BUSINESS_KEY = "businesses"

// Get business by ID
export async function getBusinessById(id: string): Promise<Business | null> {
  try {
    const business = await redis.hget(BUSINESS_KEY, id)
    return business ? (JSON.parse(business) as Business) : null
  } catch (error) {
    console.error(`Failed to fetch business ${id}:`, error)
    return null
  }
}

// Create a new business
export async function createBusiness(
  businessData: Omit<Business, "id" | "createdAt" | "updatedAt">,
): Promise<Business | null> {
  try {
    const id = generateId()
    const business: Business = {
      id,
      ...businessData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(BUSINESS_KEY, id, JSON.stringify(business))
    revalidatePath("/dashboard/settings")
    return business
  } catch (error) {
    console.error("Failed to create business:", error)
    return null
  }
}

// Update an existing business
export async function updateBusiness(id: string, businessData: Partial<Business>): Promise<Business | null> {
  try {
    const existingBusiness = await getBusinessById(id)
    if (!existingBusiness) return null

    const updatedBusiness: Business = {
      ...existingBusiness,
      ...businessData,
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(BUSINESS_KEY, id, JSON.stringify(updatedBusiness))
    revalidatePath("/dashboard/settings")
    return updatedBusiness
  } catch (error) {
    console.error(`Failed to update business ${id}:`, error)
    return null
  }
}

// Seed default business if none exists
export async function seedDefaultBusiness(): Promise<void> {
  try {
    const businessCount = await redis.hlen(BUSINESS_KEY)

    if (businessCount === 0) {
      const defaultBusiness: Omit<Business, "id" | "createdAt" | "updatedAt"> = {
        name: "My Business",
        type: "retail",
        address: "123 Main St, Anytown, USA",
        phone: "(555) 123-4567",
        email: "info@mybusiness.com",
        logo: "/placeholder.svg?height=100&width=100",
        currency: "USD",
        taxRate: 8.5,
        timeZone: "America/New_York",
      }

      await createBusiness(defaultBusiness)
      console.log("Seeded default business")
    }
  } catch (error) {
    console.error("Failed to seed default business:", error)

    // Create a fallback business in case of error
    try {
      const fallbackBusiness: Omit<Business, "id" | "createdAt" | "updatedAt"> = {
        name: "Default Business",
        type: "retail",
        address: "123 Main St",
        phone: "555-1234",
        email: "default@example.com",
        currency: "USD",
        taxRate: 0,
        timeZone: "UTC",
      }

      const id = "default"
      const business: Business = {
        id,
        ...fallbackBusiness,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await redis.hset(BUSINESS_KEY, id, JSON.stringify(business))
      console.log("Created fallback business due to error")
    } catch (fallbackError) {
      console.error("Failed to create fallback business:", fallbackError)
    }
  }
}

// Add this function to provide the missing export
export const seedBusinessesIfEmpty = seedDefaultBusiness

