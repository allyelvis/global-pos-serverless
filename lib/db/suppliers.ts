"use server"

import { revalidatePath } from "next/cache"
import redis from "./redis"
import type { Supplier } from "../types"
import { generateId } from "../utils"

const SUPPLIERS_KEY = "suppliers"

// Get all suppliers
export async function getAllSuppliers(): Promise<Supplier[]> {
  try {
    const suppliersMap = (await redis.hgetall(SUPPLIERS_KEY)) || {}
    return Object.values(suppliersMap).map((item) => JSON.parse(item as string)) as Supplier[]
  } catch (error) {
    console.error("Failed to fetch suppliers:", error)
    return []
  }
}

// Get supplier by ID
export async function getSupplierById(id: string): Promise<Supplier | null> {
  try {
    const supplier = await redis.hget(SUPPLIERS_KEY, id)
    return supplier ? (JSON.parse(supplier) as Supplier) : null
  } catch (error) {
    console.error(`Failed to fetch supplier ${id}:`, error)
    return null
  }
}

// Create a new supplier
export async function createSupplier(
  supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">,
): Promise<Supplier | null> {
  try {
    const id = generateId()
    const supplier: Supplier = {
      id,
      ...supplierData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(SUPPLIERS_KEY, id, JSON.stringify(supplier))
    revalidatePath("/dashboard/suppliers")
    return supplier
  } catch (error) {
    console.error("Failed to create supplier:", error)
    return null
  }
}

// Update an existing supplier
export async function updateSupplier(id: string, supplierData: Partial<Supplier>): Promise<Supplier | null> {
  try {
    const existingSupplier = await getSupplierById(id)
    if (!existingSupplier) return null

    const updatedSupplier: Supplier = {
      ...existingSupplier,
      ...supplierData,
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(SUPPLIERS_KEY, id, JSON.stringify(updatedSupplier))
    revalidatePath("/dashboard/suppliers")
    return updatedSupplier
  } catch (error) {
    console.error(`Failed to update supplier ${id}:`, error)
    return null
  }
}

// Delete a supplier
export async function deleteSupplier(id: string): Promise<boolean> {
  try {
    await redis.hdel(SUPPLIERS_KEY, id)
    revalidatePath("/dashboard/suppliers")
    return true
  } catch (error) {
    console.error(`Failed to delete supplier ${id}:`, error)
    return false
  }
}

// Seed initial suppliers data if none exists
export async function seedSuppliersIfEmpty(): Promise<void> {
  try {
    const suppliersCount = await redis.hlen(SUPPLIERS_KEY)

    if (suppliersCount === 0) {
      const initialSuppliers: Omit<Supplier, "id" | "createdAt" | "updatedAt">[] = [
        {
          name: "Global Electronics Supplier",
          contactName: "John Smith",
          email: "john@globalelectronics.com",
          phone: "555-123-4567",
          address: "123 Tech Blvd, Silicon Valley, CA",
          businessId: "default",
          paymentTerms: "Net 30",
          notes: "Preferred supplier for all electronics",
          isActive: true,
        },
        {
          name: "Fashion Wholesale Inc.",
          contactName: "Emma Johnson",
          email: "emma@fashionwholesale.com",
          phone: "555-234-5678",
          address: "456 Fashion Ave, New York, NY",
          businessId: "default",
          paymentTerms: "Net 45",
          notes: "Clothing and accessories supplier",
          isActive: true,
        },
        {
          name: "Fresh Foods Distributors",
          contactName: "Michael Brown",
          email: "michael@freshfoods.com",
          phone: "555-345-6789",
          address: "789 Produce Lane, Chicago, IL",
          businessId: "default",
          paymentTerms: "Net 15",
          notes: "Perishable goods supplier",
          isActive: true,
        },
        {
          name: "Office Supplies Co.",
          contactName: "Sarah Wilson",
          email: "sarah@officesupplies.com",
          phone: "555-456-7890",
          address: "101 Business Park, Boston, MA",
          businessId: "default",
          paymentTerms: "Net 30",
          notes: "Office supplies and equipment",
          isActive: true,
        },
        {
          name: "Furniture Makers Ltd.",
          contactName: "David Lee",
          email: "david@furnituremakers.com",
          phone: "555-567-8901",
          address: "202 Woodwork St, Portland, OR",
          businessId: "default",
          paymentTerms: "Net 60",
          notes: "Custom furniture manufacturer",
          isActive: true,
        },
      ]

      for (const supplier of initialSuppliers) {
        await createSupplier(supplier)
      }

      console.log("Seeded initial suppliers data")
    }
  } catch (error) {
    console.error("Failed to seed suppliers:", error)
  }
}

