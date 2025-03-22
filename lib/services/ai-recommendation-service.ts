"use server"
import redis from "../db/redis"
import { generateId } from "../utils"
import { logger } from "../logger"
import type { Product, Customer, Order } from "../types"

export interface ProductRecommendation {
  productId: string
  score: number
  reason: string
}

export interface CustomerRecommendation {
  id: string
  customerId: string
  productId: string
  score: number
  reason: string
  businessId: string
  createdAt: string
}

export interface SalesForecasting {
  id: string
  businessId: string
  locationId?: string
  productId?: string
  categoryId?: string
  forecastDate: string
  predictedSales: number
  confidenceLevel: number
  factors: string[]
  createdAt: string
}

const CUSTOMER_RECOMMENDATIONS_KEY = "customer_recommendations"
const SALES_FORECASTING_KEY = "sales_forecasting"

export class AIRecommendationService {
  /**
   * Generate product recommendations for a customer
   */
  static async generateCustomerRecommendations(
    customerId: string,
    businessId: string,
    customerData: Customer,
    purchaseHistory: Order[],
    allProducts: Product[],
  ): Promise<ProductRecommendation[]> {
    try {
      // In a real implementation, this would use a machine learning model
      // For now, we'll use a simple algorithm based on purchase history

      // If no purchase history, recommend popular products
      if (!purchaseHistory.length) {
        return this.getPopularProducts(allProducts, 5)
      }

      // Get all products the customer has purchased
      const purchasedProductIds = new Set<string>()
      const productPurchaseCount = new Map<string, number>()
      const categoryPurchaseCount = new Map<string, number>()

      for (const order of purchaseHistory) {
        for (const item of order.items) {
          purchasedProductIds.add(item.productId)

          // Count product purchases
          const currentCount = productPurchaseCount.get(item.productId) || 0
          productPurchaseCount.set(item.productId, currentCount + item.quantity)

          // Count category purchases
          const product = allProducts.find((p) => p.id === item.productId)
          if (product) {
            const currentCategoryCount = categoryPurchaseCount.get(product.categoryId) || 0
            categoryPurchaseCount.set(product.categoryId, currentCategoryCount + item.quantity)
          }
        }
      }

      // Calculate scores for all products
      const recommendations: ProductRecommendation[] = []

      for (const product of allProducts) {
        // Skip products the customer has already purchased
        if (purchasedProductIds.has(product.id)) {
          continue
        }

        let score = 0
        let reason = ""

        // Score based on category preference
        const categoryScore = categoryPurchaseCount.get(product.categoryId) || 0
        if (categoryScore > 0) {
          score += categoryScore * 0.5
          reason = "Based on your category preferences"
        }

        // Score based on similar products
        const similarProducts = allProducts.filter(
          (p) => p.categoryId === product.categoryId && purchasedProductIds.has(p.id),
        )

        if (similarProducts.length > 0) {
          score += similarProducts.length * 0.3
          reason = "Similar to products you've purchased"
        }

        // Only include products with a positive score
        if (score > 0) {
          recommendations.push({
            productId: product.id,
            score,
            reason,
          })
        }
      }

      // Sort by score (descending) and take top 5
      return recommendations.sort((a, b) => b.score - a.score).slice(0, 5)
    } catch (error) {
      logger.error(`Failed to generate recommendations for customer ${customerId}:`, error)
      return []
    }
  }

  /**
   * Get popular products
   */
  private static getPopularProducts(products: Product[], limit: number): ProductRecommendation[] {
    // In a real implementation, this would be based on actual sales data
    // For now, we'll just return random products

    const shuffled = [...products].sort(() => 0.5 - Math.random())

    return shuffled.slice(0, limit).map((product) => ({
      productId: product.id,
      score: Math.random() * 5,
      reason: "Popular among our customers",
    }))
  }

  /**
   * Save customer recommendations
   */
  static async saveCustomerRecommendations(
    customerId: string,
    businessId: string,
    recommendations: ProductRecommendation[],
  ): Promise<CustomerRecommendation[]> {
    try {
      // Delete existing recommendations
      await redis.del(`${CUSTOMER_RECOMMENDATIONS_KEY}:${customerId}`)

      const savedRecommendations: CustomerRecommendation[] = []

      for (const rec of recommendations) {
        const recommendation: CustomerRecommendation = {
          id: generateId(),
          customerId,
          productId: rec.productId,
          score: rec.score,
          reason: rec.reason,
          businessId,
          createdAt: new Date().toISOString(),
        }

        await redis.lpush(`${CUSTOMER_RECOMMENDATIONS_KEY}:${customerId}`, JSON.stringify(recommendation))
        savedRecommendations.push(recommendation)
      }

      return savedRecommendations
    } catch (error) {
      logger.error(`Failed to save recommendations for customer ${customerId}:`, error)
      return []
    }
  }

  /**
   * Get customer recommendations
   */
  static async getCustomerRecommendations(customerId: string): Promise<CustomerRecommendation[]> {
    try {
      const recommendations = await redis.lrange(`${CUSTOMER_RECOMMENDATIONS_KEY}:${customerId}`, 0, -1)

      return recommendations.map((data) => JSON.parse(data) as CustomerRecommendation)
    } catch (error) {
      logger.error(`Failed to get recommendations for customer ${customerId}:`, error)
      return []
    }
  }

  /**
   * Generate sales forecast
   */
  static async generateSalesForecast(
    businessId: string,
    productId?: string,
    categoryId?: string,
    locationId?: string,
    daysAhead = 30,
  ): Promise<SalesForecasting> {
    try {
      // In a real implementation, this would use a machine learning model
      // For now, we'll generate a simulated forecast

      const forecastDate = new Date()
      forecastDate.setDate(forecastDate.getDate() + daysAhead)

      const forecast: SalesForecasting = {
        id: generateId(),
        businessId,
        locationId,
        productId,
        categoryId,
        forecastDate: forecastDate.toISOString(),
        predictedSales: Math.floor(Math.random() * 1000) + 100, // Random value between 100 and 1100
        confidenceLevel: Math.random() * 0.3 + 0.7, // Random value between 0.7 and 1.0
        factors: ["Historical sales trends", "Seasonal patterns", "Recent growth rate"],
        createdAt: new Date().toISOString(),
      }

      // Store forecast
      const key = `${SALES_FORECASTING_KEY}:${businessId}`
      const subKey = productId || categoryId || locationId || "overall"

      await redis.hset(key, subKey, JSON.stringify(forecast))

      return forecast
    } catch (error) {
      logger.error(`Failed to generate sales forecast for business ${businessId}:`, error)
      throw error
    }
  }

  /**
   * Get sales forecast
   */
  static async getSalesForecast(
    businessId: string,
    productId?: string,
    categoryId?: string,
    locationId?: string,
  ): Promise<SalesForecasting | null> {
    try {
      const key = `${SALES_FORECASTING_KEY}:${businessId}`
      const subKey = productId || categoryId || locationId || "overall"

      const forecastData = await redis.hget(key, subKey)

      return forecastData ? (JSON.parse(forecastData) as SalesForecasting) : null
    } catch (error) {
      logger.error(`Failed to get sales forecast for business ${businessId}:`, error)
      return null
    }
  }

  /**
   * Get inventory restock recommendations
   */
  static async getInventoryRestockRecommendations(
    businessId: string,
    products: Product[],
  ): Promise<{ productId: string; currentStock: number; recommendedRestock: number; reason: string }[]> {
    try {
      // In a real implementation, this would use a machine learning model
      // For now, we'll use a simple algorithm based on current stock levels

      const recommendations = []

      for (const product of products) {
        if (product.stock <= product.lowStockThreshold) {
          // Calculate recommended restock amount
          // In a real implementation, this would be based on sales velocity, lead time, etc.
          const recommendedRestock = Math.max(
            product.lowStockThreshold * 2 - product.stock,
            10, // Minimum restock amount
          )

          recommendations.push({
            productId: product.id,
            currentStock: product.stock,
            recommendedRestock,
            reason: product.stock === 0 ? "Out of stock" : `Below low stock threshold (${product.lowStockThreshold})`,
          })
        }
      }

      return recommendations
    } catch (error) {
      logger.error(`Failed to get inventory restock recommendations for business ${businessId}:`, error)
      return []
    }
  }
}

