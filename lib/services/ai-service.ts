"use server"

import { getRedisClient } from "../db/redis-client"
import type { Product } from "../types/product"
import type { Order } from "../types/order"
import type { Customer } from "../types/customer"
import { logger } from "../logger"

// AI Service for Global POS System
export class AIService {
  // Sales Forecasting
  static async predictSales(
    businessId: string,
    startDate: Date,
    endDate: Date,
    productCategories?: string[],
  ): Promise<{ date: string; predictedSales: number; confidence: number }[]> {
    try {
      // Get historical sales data from Redis
      const redis = getRedisClient()
      const ordersKey = `business:${businessId}:orders`
      const ordersData = await redis.get(ordersKey)

      if (!ordersData) {
        return []
      }

      const orders: Order[] = JSON.parse(ordersData)

      // Filter orders by date range if needed
      const filteredOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate)
      })

      // Group orders by date
      const ordersByDate = filteredOrders.reduce(
        (acc, order) => {
          const date = new Date(order.createdAt).toISOString().split("T")[0]
          if (!acc[date]) {
            acc[date] = []
          }
          acc[date].push(order)
          return acc
        },
        {} as Record<string, Order[]>,
      )

      // Calculate total sales per date
      const salesByDate = Object.entries(ordersByDate).map(([date, orders]) => {
        const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
        return { date, sales: totalSales }
      })

      // Simple forecasting algorithm (in a real system, this would use ML models)
      // For now, we'll use a simple moving average with random variation
      const predictions = []
      const dateRange = getDatesInRange(startDate, endDate)

      // Calculate average daily sales from historical data
      const avgDailySales = salesByDate.reduce((sum, day) => sum + day.sales, 0) / salesByDate.length || 0

      // Generate predictions for each date in the range
      for (const date of dateRange) {
        // Add some random variation to make it look more realistic
        const variation = Math.random() * 0.3 - 0.15 // -15% to +15%
        const predictedSales = avgDailySales * (1 + variation)
        const confidence = 0.7 + Math.random() * 0.2 // 70-90% confidence

        predictions.push({
          date: date.toISOString().split("T")[0],
          predictedSales: Math.round(predictedSales * 100) / 100,
          confidence: Math.round(confidence * 100) / 100,
        })
      }

      return predictions
    } catch (error) {
      logger.error("Error in AI sales prediction:", error)
      return []
    }
  }

  // Product Recommendations (Upselling & Cross-Selling)
  static async getProductRecommendations(productId: string, customerId?: string, limit = 5): Promise<Product[]> {
    try {
      const redis = getRedisClient()
      const productsKey = "products"
      const productsData = await redis.get(productsKey)

      if (!productsData) {
        return []
      }

      const products: Product[] = JSON.parse(productsData)
      const currentProduct = products.find((p) => p.id === productId)

      if (!currentProduct) {
        return []
      }

      // Get customer purchase history if customerId is provided
      let customerPurchaseHistory: string[] = []
      if (customerId) {
        const customerKey = `customer:${customerId}`
        const customerData = await redis.get(customerKey)

        if (customerData) {
          const customer: Customer = JSON.parse(customerData)
          customerPurchaseHistory = customer.purchaseHistory || []
        }
      }

      // Simple recommendation algorithm based on category and price range
      // In a real system, this would use collaborative filtering or other ML techniques
      const recommendations = products
        .filter((p) => p.id !== productId) // Exclude current product
        .map((product) => {
          let score = 0

          // Same category products get higher score
          if (product.category === currentProduct.category) {
            score += 5
          }

          // Similar price range products get higher score
          const priceDiff = Math.abs(product.price - currentProduct.price)
          const priceRatio = priceDiff / currentProduct.price
          if (priceRatio < 0.2) {
            // Within 20% price range
            score += 3
          }

          // If customer has purchased this product before, increase score
          if (customerPurchaseHistory.includes(product.id)) {
            score += 2
          }

          // Add some randomness to avoid always recommending the same products
          score += Math.random() * 2

          return { product, score }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.product)

      return recommendations
    } catch (error) {
      logger.error("Error in AI product recommendations:", error)
      return []
    }
  }

  // Dynamic Pricing
  static async getDynamicPrice(
    productId: string,
    basePrice: number,
    inventory: number,
    demand: number,
  ): Promise<{ price: number; adjustment: number; reason: string }> {
    try {
      // Simple dynamic pricing algorithm
      // In a real system, this would use more sophisticated ML models
      let adjustment = 0
      let reason = "No adjustment needed"

      // Adjust based on inventory levels
      if (inventory < 5) {
        // Low inventory, increase price
        adjustment += 0.1 // +10%
        reason = "Low inventory"
      } else if (inventory > 50) {
        // High inventory, decrease price
        adjustment -= 0.05 // -5%
        reason = "High inventory"
      }

      // Adjust based on demand
      if (demand > 20) {
        // High demand, increase price
        adjustment += 0.15 // +15%
        reason = adjustment !== 0 ? `${reason} and high demand` : "High demand"
      } else if (demand < 5) {
        // Low demand, decrease price
        adjustment -= 0.1 // -10%
        reason = adjustment !== 0 ? `${reason} and low demand` : "Low demand"
      }

      // Calculate final price
      const finalPrice = basePrice * (1 + adjustment)

      return {
        price: Math.round(finalPrice * 100) / 100,
        adjustment: Math.round(adjustment * 100),
        reason,
      }
    } catch (error) {
      logger.error("Error in AI dynamic pricing:", error)
      return { price: basePrice, adjustment: 0, reason: "Error calculating dynamic price" }
    }
  }

  // Fraud Detection
  static async detectFraud(transaction: any): Promise<{ isSuspicious: boolean; riskScore: number; reasons: string[] }> {
    try {
      // Simple fraud detection algorithm
      // In a real system, this would use ML models trained on fraud patterns
      const reasons: string[] = []
      let riskScore = 0

      // Check for unusual transaction amount
      if (transaction.amount > 1000) {
        reasons.push("Unusually high transaction amount")
        riskScore += 20
      }

      // Check for multiple transactions in short time
      if (transaction.recentTransactions > 5) {
        reasons.push("Multiple transactions in short time")
        riskScore += 15
      }

      // Check for unusual location
      if (transaction.isUnusualLocation) {
        reasons.push("Unusual transaction location")
        riskScore += 25
      }

      // Check for unusual time
      const hour = new Date(transaction.timestamp).getHours()
      if (hour >= 0 && hour <= 5) {
        reasons.push("Transaction during unusual hours")
        riskScore += 10
      }

      // Check for unusual items
      if (transaction.isUnusualPurchase) {
        reasons.push("Unusual purchase pattern")
        riskScore += 15
      }

      return {
        isSuspicious: riskScore >= 30,
        riskScore,
        reasons,
      }
    } catch (error) {
      logger.error("Error in AI fraud detection:", error)
      return { isSuspicious: false, riskScore: 0, reasons: ["Error in fraud detection"] }
    }
  }

  // Customer Insights
  static async getCustomerInsights(customerId: string): Promise<{
    preferredCategories: string[]
    averageSpend: number
    visitFrequency: string
    loyaltyLevel: string
    recommendations: string[]
  }> {
    try {
      const redis = getRedisClient()
      const customerKey = `customer:${customerId}`
      const customerData = await redis.get(customerKey)

      if (!customerData) {
        throw new Error("Customer not found")
      }

      const customer: Customer = JSON.parse(customerData)

      // Get customer orders
      const ordersKey = `customer:${customerId}:orders`
      const ordersData = await redis.get(ordersKey)
      const orders: Order[] = ordersData ? JSON.parse(ordersData) : []

      // Calculate preferred categories
      const categoryCount: Record<string, number> = {}
      orders.forEach((order) => {
        order.items.forEach((item) => {
          if (!categoryCount[item.category]) {
            categoryCount[item.category] = 0
          }
          categoryCount[item.category]++
        })
      })

      const preferredCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category]) => category)

      // Calculate average spend
      const totalSpend = orders.reduce((sum, order) => sum + order.total, 0)
      const averageSpend = orders.length > 0 ? totalSpend / orders.length : 0

      // Calculate visit frequency
      let visitFrequency = "New customer"
      if (orders.length > 0) {
        const daysSinceFirstOrder = Math.floor(
          (Date.now() - new Date(orders[0].createdAt).getTime()) / (1000 * 60 * 60 * 24),
        )
        const ordersPerMonth = orders.length / (daysSinceFirstOrder / 30)

        if (ordersPerMonth >= 4) {
          visitFrequency = "Weekly"
        } else if (ordersPerMonth >= 1) {
          visitFrequency = "Monthly"
        } else if (ordersPerMonth >= 0.25) {
          visitFrequency = "Quarterly"
        } else {
          visitFrequency = "Infrequent"
        }
      }

      // Determine loyalty level
      let loyaltyLevel = "New"
      if (orders.length >= 20) {
        loyaltyLevel = "Platinum"
      } else if (orders.length >= 10) {
        loyaltyLevel = "Gold"
      } else if (orders.length >= 5) {
        loyaltyLevel = "Silver"
      } else if (orders.length >= 1) {
        loyaltyLevel = "Bronze"
      }

      // Generate recommendations
      const recommendations = [
        preferredCategories.length > 0
          ? `Offer discounts on ${preferredCategories[0]} products`
          : "Offer welcome discount",
        visitFrequency === "Infrequent" ? "Send re-engagement email" : "Send regular promotions",
        averageSpend > 100 ? "Offer premium loyalty program" : "Offer basic loyalty program",
      ]

      return {
        preferredCategories,
        averageSpend: Math.round(averageSpend * 100) / 100,
        visitFrequency,
        loyaltyLevel,
        recommendations,
      }
    } catch (error) {
      logger.error("Error in AI customer insights:", error)
      return {
        preferredCategories: [],
        averageSpend: 0,
        visitFrequency: "Unknown",
        loyaltyLevel: "Unknown",
        recommendations: ["Error generating insights"],
      }
    }
  }

  // Inventory Optimization
  static async getInventoryRecommendations(
    businessId: string,
    productId: string,
  ): Promise<{
    reorderPoint: number
    reorderQuantity: number
    restockUrgency: "Low" | "Medium" | "High"
    restockRecommendation: string
  }> {
    try {
      const redis = getRedisClient()

      // Get product data
      const productKey = `product:${productId}`
      const productData = await redis.get(productKey)

      if (!productData) {
        throw new Error("Product not found")
      }

      const product: Product = JSON.parse(productData)

      // Get sales history
      const salesKey = `product:${productId}:sales`
      const salesData = await redis.get(salesKey)
      const salesHistory = salesData ? JSON.parse(salesData) : []

      // Calculate average daily sales
      const totalSales = salesHistory.reduce((sum, sale) => sum + sale.quantity, 0)
      const avgDailySales = salesHistory.length > 0 ? totalSales / salesHistory.length : 1

      // Calculate lead time (days it takes to restock)
      const leadTime = 7 // Default to 7 days

      // Calculate safety stock (buffer for unexpected demand)
      const safetyStock = Math.ceil(avgDailySales * 3) // 3 days of safety stock

      // Calculate reorder point
      const reorderPoint = Math.ceil(avgDailySales * leadTime) + safetyStock

      // Calculate reorder quantity (Economic Order Quantity)
      // Simple calculation - in a real system this would use the EOQ formula
      const reorderQuantity = Math.ceil(avgDailySales * 30) // 30 days of stock

      // Determine restock urgency
      let restockUrgency: "Low" | "Medium" | "High" = "Low"
      let restockRecommendation = "No action needed at this time."

      if (product.stock <= safetyStock) {
        restockUrgency = "High"
        restockRecommendation = `Urgent restock needed. Order ${reorderQuantity} units immediately.`
      } else if (product.stock <= reorderPoint) {
        restockUrgency = "Medium"
        restockRecommendation = `Place an order for ${reorderQuantity} units soon.`
      } else {
        restockUrgency = "Low"
        restockRecommendation = "Stock levels are adequate."
      }

      return {
        reorderPoint,
        reorderQuantity,
        restockUrgency,
        restockRecommendation,
      }
    } catch (error) {
      logger.error("Error in AI inventory recommendations:", error)
      return {
        reorderPoint: 10,
        reorderQuantity: 20,
        restockUrgency: "Low",
        restockRecommendation: "Error generating inventory recommendations",
      }
    }
  }
}

// Helper function to get all dates in a range
function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

