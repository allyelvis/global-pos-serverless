"use server"

import { revalidatePath } from "next/cache"
import redis from "./redis"
import type { Category } from "../types"
import { generateId } from "../utils"

const CATEGORIES_KEY = "categories"

// Get all categories
export async function getAllCategories(): Promise<Category[]> {
  try {
    const categoriesMap = (await redis.hgetall(CATEGORIES_KEY)) || {}
    return Object.values(categoriesMap).map((item) => JSON.parse(item as string)) as Category[]
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return []
  }
}

// Get category by ID
export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const category = await redis.hget(CATEGORIES_KEY, id)
    return category ? (JSON.parse(category) as Category) : null
  } catch (error) {
    console.error(`Failed to fetch category ${id}:`, error)
    return null
  }
}

// Create a new category
export async function createCategory(
  categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">,
): Promise<Category | null> {
  try {
    const id = generateId()
    const category: Category = {
      id,
      ...categoryData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(CATEGORIES_KEY, id, JSON.stringify(category))
    revalidatePath("/dashboard/products")
    return category
  } catch (error) {
    console.error("Failed to create category:", error)
    return null
  }
}

// Update an existing category
export async function updateCategory(id: string, categoryData: Partial<Category>): Promise<Category | null> {
  try {
    const existingCategory = await getCategoryById(id)
    if (!existingCategory) return null

    const updatedCategory: Category = {
      ...existingCategory,
      ...categoryData,
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(CATEGORIES_KEY, id, JSON.stringify(updatedCategory))
    revalidatePath("/dashboard/products")
    return updatedCategory
  } catch (error) {
    console.error(`Failed to update category ${id}:`, error)
    return null
  }
}

// Delete a category
export async function deleteCategory(id: string): Promise<boolean> {
  try {
    await redis.hdel(CATEGORIES_KEY, id)
    revalidatePath("/dashboard/products")
    return true
  } catch (error) {
    console.error(`Failed to delete category ${id}:`, error)
    return false
  }
}

// Seed initial categories data if none exists
export async function seedCategoriesIfEmpty(): Promise<void> {
  try {
    const categoriesCount = await redis.hlen(CATEGORIES_KEY)

    if (categoriesCount === 0) {
      const initialCategories: Omit<Category, "id" | "createdAt" | "updatedAt">[] = [
        {
          name: "Clothing",
          description: "Apparel and clothing items",
          businessId: "default",
        },
        {
          name: "Footwear",
          description: "Shoes and footwear items",
          businessId: "default",
        },
        {
          name: "Accessories",
          description: "Bags, watches, and other accessories",
          businessId: "default",
        },
        {
          name: "Electronics",
          description: "Electronic devices and gadgets",
          businessId: "default",
        },
      ]

      for (const category of initialCategories) {
        await createCategory(category)
      }

      console.log("Seeded initial categories data")
    }
  } catch (error) {
    console.error("Failed to seed categories:", error)
  }
}

