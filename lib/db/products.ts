"use server"

import { revalidatePath } from "next/cache"
import redis from "./redis"
import type { Product } from "../types"
import { generateId } from "../utils"

const PRODUCTS_KEY = "products"

// Get all products
export async function getAllProducts(): Promise<Product[]> {
  try {
    const productsMap = (await redis.hgetall(PRODUCTS_KEY)) || {}
    return Object.values(productsMap).map((item) => JSON.parse(item as string)) as Product[]
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return []
  }
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const product = await redis.hget(PRODUCTS_KEY, id)
    return product ? (JSON.parse(product) as Product) : null
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error)
    return null
  }
}

// Create a new product
export async function createProduct(
  productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
): Promise<Product | null> {
  try {
    const id = generateId()
    const product: Product = {
      id,
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(PRODUCTS_KEY, id, JSON.stringify(product))
    revalidatePath("/dashboard/products")
    return product
  } catch (error) {
    console.error("Failed to create product:", error)
    return null
  }
}

// Update an existing product
export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
  try {
    const existingProduct = await getProductById(id)
    if (!existingProduct) return null

    const updatedProduct: Product = {
      ...existingProduct,
      ...productData,
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(PRODUCTS_KEY, id, JSON.stringify(updatedProduct))
    revalidatePath("/dashboard/products")
    return updatedProduct
  } catch (error) {
    console.error(`Failed to update product ${id}:`, error)
    return null
  }
}

// Delete a product
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await redis.hdel(PRODUCTS_KEY, id)
    revalidatePath("/dashboard/products")
    return true
  } catch (error) {
    console.error(`Failed to delete product ${id}:`, error)
    return false
  }
}

// Seed initial products data if none exists
export async function seedProductsIfEmpty(): Promise<void> {
  try {
    const productsCount = await redis.hlen(PRODUCTS_KEY)

    if (productsCount === 0) {
      const initialProducts: Omit<Product, "id" | "createdAt" | "updatedAt">[] = [
        {
          name: "T-Shirt",
          description: "Comfortable cotton t-shirt",
          price: 19.99,
          cost: 8.5,
          sku: "TS-001",
          barcode: "1234567890123",
          categoryId: "clothing",
          stock: 45,
          lowStockThreshold: 10,
          image: "/placeholder.svg?height=100&width=100",
          isActive: true,
        },
        {
          name: "Jeans",
          description: "Classic blue jeans",
          price: 49.99,
          cost: 22.5,
          sku: "JN-001",
          barcode: "2345678901234",
          categoryId: "clothing",
          stock: 32,
          lowStockThreshold: 5,
          image: "/placeholder.svg?height=100&width=100",
          isActive: true,
        },
        {
          name: "Sneakers",
          description: "Comfortable athletic shoes",
          price: 79.99,
          cost: 35.0,
          sku: "SN-001",
          barcode: "3456789012345",
          categoryId: "footwear",
          stock: 18,
          lowStockThreshold: 5,
          image: "/placeholder.svg?height=100&width=100",
          isActive: true,
        },
        {
          name: "Backpack",
          description: "Durable backpack for everyday use",
          price: 39.99,
          cost: 18.25,
          sku: "BP-001",
          barcode: "4567890123456",
          categoryId: "accessories",
          stock: 24,
          lowStockThreshold: 8,
          image: "/placeholder.svg?height=100&width=100",
          isActive: true,
        },
        {
          name: "Watch",
          description: "Elegant wristwatch",
          price: 129.99,
          cost: 65.0,
          sku: "WT-001",
          barcode: "5678901234567",
          categoryId: "accessories",
          stock: 12,
          lowStockThreshold: 3,
          image: "/placeholder.svg?height=100&width=100",
          isActive: true,
        },
        {
          name: "Headphones",
          description: "Wireless over-ear headphones",
          price: 89.99,
          cost: 42.5,
          sku: "HP-001",
          barcode: "6789012345678",
          categoryId: "electronics",
          stock: 15,
          lowStockThreshold: 5,
          image: "/placeholder.svg?height=100&width=100",
          isActive: true,
        },
        {
          name: "Smartphone",
          description: "Latest model smartphone",
          price: 599.99,
          cost: 350.0,
          sku: "SP-001",
          barcode: "7890123456789",
          categoryId: "electronics",
          stock: 8,
          lowStockThreshold: 2,
          image: "/placeholder.svg?height=100&width=100",
          isActive: true,
        },
        {
          name: "Laptop",
          description: "High-performance laptop",
          price: 999.99,
          cost: 650.0,
          sku: "LP-001",
          barcode: "8901234567890",
          categoryId: "electronics",
          stock: 5,
          lowStockThreshold: 2,
          image: "/placeholder.svg?height=100&width=100",
          isActive: true,
        },
      ]

      for (const product of initialProducts) {
        await createProduct(product)
      }

      console.log("Seeded initial products data")
    }
  } catch (error) {
    console.error("Failed to seed products:", error)
  }
}

