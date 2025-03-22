"use server"

import { revalidatePath } from "next/cache"
import redis from "../db/redis"
import { generateId } from "../utils"
import { logger } from "../logger"

export type PromotionType = "percentage" | "fixed_amount" | "buy_x_get_y" | "bundle"

export interface Promotion {
  id: string
  name: string
  description?: string
  type: PromotionType
  value: number
  minimumPurchase?: number
  startDate: string
  endDate: string
  applicableProducts?: string[] // Product IDs
  applicableCategories?: string[] // Category IDs
  couponCode?: string
  usageLimit?: number
  usageCount: number
  businessId: string
  locationId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const PROMOTIONS_KEY = "promotions"
const PROMOTIONS_BY_COUPON_KEY = "promotions_by_coupon"

export class PromotionService {
  /**
   * Create a new promotion
   */
  static async createPromotion(
    promotionData: Omit<Promotion, "id" | "usageCount" | "createdAt" | "updatedAt">,
  ): Promise<Promotion> {
    try {
      const id = generateId()
      const promotion: Promotion = {
        id,
        ...promotionData,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await redis.hset(PROMOTIONS_KEY, id, JSON.stringify(promotion))

      // If promotion has a coupon code, index it for quick lookup
      if (promotion.couponCode) {
        await redis.set(`${PROMOTIONS_BY_COUPON_KEY}:${promotion.couponCode.toLowerCase()}`, id)
      }

      revalidatePath("/dashboard/promotions")

      return promotion
    } catch (error) {
      logger.error("Failed to create promotion:", error)
      throw error
    }
  }

  /**
   * Get a promotion by ID
   */
  static async getPromotionById(id: string): Promise<Promotion | null> {
    try {
      const promotionData = await redis.hget(PROMOTIONS_KEY, id)
      return promotionData ? (JSON.parse(promotionData) as Promotion) : null
    } catch (error) {
      logger.error(`Failed to get promotion ${id}:`, error)
      return null
    }
  }

  /**
   * Get a promotion by coupon code
   */
  static async getPromotionByCouponCode(couponCode: string): Promise<Promotion | null> {
    try {
      const promotionId = await redis.get(`${PROMOTIONS_BY_COUPON_KEY}:${couponCode.toLowerCase()}`)

      if (!promotionId) {
        return null
      }

      return this.getPromotionById(promotionId)
    } catch (error) {
      logger.error(`Failed to get promotion by coupon code ${couponCode}:`, error)
      return null
    }
  }

  /**
   * Get all promotions
   */
  static async getAllPromotions(): Promise<Promotion[]> {
    try {
      const promotionsData = await redis.hgetall(PROMOTIONS_KEY)

      if (!promotionsData) {
        return []
      }

      return Object.values(promotionsData).map((data) => JSON.parse(data as string) as Promotion)
    } catch (error) {
      logger.error("Failed to get all promotions:", error)
      return []
    }
  }

  /**
   * Get active promotions
   */
  static async getActivePromotions(): Promise<Promotion[]> {
    try {
      const allPromotions = await this.getAllPromotions()
      const now = new Date().toISOString()

      return allPromotions.filter(
        (promotion) =>
          promotion.isActive &&
          promotion.startDate <= now &&
          promotion.endDate >= now &&
          (!promotion.usageLimit || promotion.usageCount < promotion.usageLimit),
      )
    } catch (error) {
      logger.error("Failed to get active promotions:", error)
      return []
    }
  }

  /**
   * Update a promotion
   */
  static async updatePromotion(id: string, promotionData: Partial<Promotion>): Promise<Promotion | null> {
    try {
      const existingPromotion = await this.getPromotionById(id)

      if (!existingPromotion) {
        return null
      }

      // If coupon code is being changed, update the index
      if (promotionData.couponCode !== undefined && promotionData.couponCode !== existingPromotion.couponCode) {
        // Remove old coupon code index if it exists
        if (existingPromotion.couponCode) {
          await redis.del(`${PROMOTIONS_BY_COUPON_KEY}:${existingPromotion.couponCode.toLowerCase()}`)
        }

        // Add new coupon code index if provided
        if (promotionData.couponCode) {
          await redis.set(`${PROMOTIONS_BY_COUPON_KEY}:${promotionData.couponCode.toLowerCase()}`, id)
        }
      }

      const updatedPromotion: Promotion = {
        ...existingPromotion,
        ...promotionData,
        updatedAt: new Date().toISOString(),
      }

      await redis.hset(PROMOTIONS_KEY, id, JSON.stringify(updatedPromotion))

      revalidatePath("/dashboard/promotions")

      return updatedPromotion
    } catch (error) {
      logger.error(`Failed to update promotion ${id}:`, error)
      return null
    }
  }

  /**
   * Delete a promotion
   */
  static async deletePromotion(id: string): Promise<boolean> {
    try {
      const promotion = await this.getPromotionById(id)

      if (!promotion) {
        return false
      }

      // Remove promotion
      await redis.hdel(PROMOTIONS_KEY, id)

      // Remove coupon code index if it exists
      if (promotion.couponCode) {
        await redis.del(`${PROMOTIONS_BY_COUPON_KEY}:${promotion.couponCode.toLowerCase()}`)
      }

      revalidatePath("/dashboard/promotions")

      return true
    } catch (error) {
      logger.error(`Failed to delete promotion ${id}:`, error)
      return false
    }
  }

  /**
   * Apply promotion to cart
   */
  static async applyPromotion(
    promotionId: string | null,
    couponCode: string | null,
    cartItems: { productId: string; categoryId: string; price: number; quantity: number }[],
    subtotal: number,
  ): Promise<{ discount: number; appliedPromotion: Promotion | null }> {
    try {
      let promotion: Promotion | null = null

      // Get promotion by ID or coupon code
      if (promotionId) {
        promotion = await this.getPromotionById(promotionId)
      } else if (couponCode) {
        promotion = await this.getPromotionByCouponCode(couponCode)
      }

      if (!promotion) {
        return { discount: 0, appliedPromotion: null }
      }

      // Check if promotion is active
      const now = new Date().toISOString()
      if (
        !promotion.isActive ||
        promotion.startDate > now ||
        promotion.endDate < now ||
        (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit)
      ) {
        return { discount: 0, appliedPromotion: null }
      }

      // Check minimum purchase requirement
      if (promotion.minimumPurchase && subtotal < promotion.minimumPurchase) {
        return { discount: 0, appliedPromotion: null }
      }

      // Calculate discount based on promotion type
      let discount = 0

      switch (promotion.type) {
        case "percentage":
          // Calculate percentage discount on applicable items or entire cart
          if (promotion.applicableProducts?.length || promotion.applicableCategories?.length) {
            // Apply to specific products or categories
            const applicableItems = cartItems.filter(
              (item) =>
                promotion.applicableProducts?.includes(item.productId) ||
                promotion.applicableCategories?.includes(item.categoryId),
            )

            const applicableSubtotal = applicableItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

            discount = applicableSubtotal * (promotion.value / 100)
          } else {
            // Apply to entire cart
            discount = subtotal * (promotion.value / 100)
          }
          break

        case "fixed_amount":
          // Apply fixed amount discount
          discount = Math.min(promotion.value, subtotal)
          break

        case "buy_x_get_y":
          // For simplicity, we'll implement a basic version
          // In a real implementation, this would be more sophisticated
          // to handle different product combinations

          // Find applicable items
          const applicableItems = promotion.applicableProducts?.length
            ? cartItems.filter((item) => promotion.applicableProducts?.includes(item.productId))
            : cartItems

          if (applicableItems.length > 0) {
            // Sort by price (ascending) to give discount on cheapest items
            const sortedItems = [...applicableItems].sort((a, b) => a.price - b.price)

            // Calculate how many free items to give
            const totalQuantity = sortedItems.reduce((sum, item) => sum + item.quantity, 0)
            const freeItemsCount = Math.floor(totalQuantity / (promotion.value + 1))

            // Apply discount to cheapest items
            let remainingFreeItems = freeItemsCount
            let itemIndex = 0

            while (remainingFreeItems > 0 && itemIndex < sortedItems.length) {
              const item = sortedItems[itemIndex]
              const freeQuantity = Math.min(remainingFreeItems, item.quantity)

              discount += item.price * freeQuantity
              remainingFreeItems -= freeQuantity
              itemIndex++
            }
          }
          break

        case "bundle":
          // Bundle discount is more complex and would require specific implementation
          // For now, we'll just apply a fixed discount if all required products are in cart
          if (promotion.applicableProducts?.length) {
            const cartProductIds = cartItems.map((item) => item.productId)
            const allBundleItemsInCart = promotion.applicableProducts.every((productId) =>
              cartProductIds.includes(productId),
            )

            if (allBundleItemsInCart) {
              discount = promotion.value
            }
          }
          break
      }

      // Ensure discount doesn't exceed subtotal
      discount = Math.min(discount, subtotal)

      // Increment usage count
      if (discount > 0) {
        await this.updatePromotion(promotion.id, {
          usageCount: promotion.usageCount + 1,
        })
      }

      return { discount, appliedPromotion: promotion }
    } catch (error) {
      logger.error("Failed to apply promotion:", error)
      return { discount: 0, appliedPromotion: null }
    }
  }
}

