"use server"

import { revalidatePath } from "next/cache"
import redis from "../db/redis"
import { generateId } from "../utils"
import { logger } from "../logger"

export interface LoyaltyProgram {
  id: string
  name: string
  description?: string
  pointsPerCurrency: number
  minimumPointsRedemption: number
  pointValueInCurrency: number
  tiers?: LoyaltyTier[]
  businessId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoyaltyTier {
  id: string
  name: string
  loyaltyProgramId: string
  minimumPoints: number
  benefits: string[]
  multiplier: number
  createdAt: string
  updatedAt: string
}

export interface LoyaltyTransaction {
  id: string
  customerId: string
  orderId?: string
  points: number
  type: "earn" | "redeem" | "expire" | "adjust"
  description?: string
  businessId: string
  locationId?: string
  createdAt: string
}

const LOYALTY_PROGRAMS_KEY = "loyalty_programs"
const LOYALTY_TIERS_KEY = "loyalty_tiers"
const LOYALTY_TRANSACTIONS_KEY = "loyalty_transactions"
const CUSTOMER_LOYALTY_POINTS_KEY = "customer_loyalty_points"

export class LoyaltyService {
  /**
   * Create a loyalty program
   */
  static async createLoyaltyProgram(
    programData: Omit<LoyaltyProgram, "id" | "createdAt" | "updatedAt">,
  ): Promise<LoyaltyProgram> {
    try {
      const id = generateId()
      const program: LoyaltyProgram = {
        id,
        ...programData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await redis.hset(LOYALTY_PROGRAMS_KEY, id, JSON.stringify(program))

      revalidatePath("/dashboard/loyalty")

      return program
    } catch (error) {
      logger.error("Failed to create loyalty program:", error)
      throw error
    }
  }

  /**
   * Get a loyalty program by ID
   */
  static async getLoyaltyProgramById(id: string): Promise<LoyaltyProgram | null> {
    try {
      const programData = await redis.hget(LOYALTY_PROGRAMS_KEY, id)
      return programData ? (JSON.parse(programData) as LoyaltyProgram) : null
    } catch (error) {
      logger.error(`Failed to get loyalty program ${id}:`, error)
      return null
    }
  }

  /**
   * Get loyalty program by business ID
   */
  static async getLoyaltyProgramByBusinessId(businessId: string): Promise<LoyaltyProgram | null> {
    try {
      const allPrograms = await this.getAllLoyaltyPrograms()
      return allPrograms.find((program) => program.businessId === businessId && program.isActive) || null
    } catch (error) {
      logger.error(`Failed to get loyalty program for business ${businessId}:`, error)
      return null
    }
  }

  /**
   * Get all loyalty programs
   */
  static async getAllLoyaltyPrograms(): Promise<LoyaltyProgram[]> {
    try {
      const programsData = await redis.hgetall(LOYALTY_PROGRAMS_KEY)

      if (!programsData) {
        return []
      }

      return Object.values(programsData).map((data) => JSON.parse(data as string) as LoyaltyProgram)
    } catch (error) {
      logger.error("Failed to get all loyalty programs:", error)
      return []
    }
  }

  /**
   * Update a loyalty program
   */
  static async updateLoyaltyProgram(id: string, programData: Partial<LoyaltyProgram>): Promise<LoyaltyProgram | null> {
    try {
      const existingProgram = await this.getLoyaltyProgramById(id)

      if (!existingProgram) {
        return null
      }

      const updatedProgram: LoyaltyProgram = {
        ...existingProgram,
        ...programData,
        updatedAt: new Date().toISOString(),
      }

      await redis.hset(LOYALTY_PROGRAMS_KEY, id, JSON.stringify(updatedProgram))

      revalidatePath("/dashboard/loyalty")

      return updatedProgram
    } catch (error) {
      logger.error(`Failed to update loyalty program ${id}:`, error)
      return null
    }
  }

  /**
   * Create a loyalty tier
   */
  static async createLoyaltyTier(tierData: Omit<LoyaltyTier, "id" | "createdAt" | "updatedAt">): Promise<LoyaltyTier> {
    try {
      const id = generateId()
      const tier: LoyaltyTier = {
        id,
        ...tierData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await redis.hset(`${LOYALTY_TIERS_KEY}:${tierData.loyaltyProgramId}`, id, JSON.stringify(tier))

      revalidatePath("/dashboard/loyalty")

      return tier
    } catch (error) {
      logger.error("Failed to create loyalty tier:", error)
      throw error
    }
  }

  /**
   * Get loyalty tiers for a program
   */
  static async getLoyaltyTiersByProgramId(programId: string): Promise<LoyaltyTier[]> {
    try {
      const tiersData = await redis.hgetall(`${LOYALTY_TIERS_KEY}:${programId}`)

      if (!tiersData) {
        return []
      }

      return Object.values(tiersData)
        .map((data) => JSON.parse(data as string) as LoyaltyTier)
        .sort((a, b) => a.minimumPoints - b.minimumPoints)
    } catch (error) {
      logger.error(`Failed to get loyalty tiers for program ${programId}:`, error)
      return []
    }
  }

  /**
   * Get customer's loyalty tier
   */
  static async getCustomerLoyaltyTier(customerId: string, businessId: string): Promise<LoyaltyTier | null> {
    try {
      const program = await this.getLoyaltyProgramByBusinessId(businessId)

      if (!program) {
        return null
      }

      const points = await this.getCustomerLoyaltyPoints(customerId, businessId)
      const tiers = await this.getLoyaltyTiersByProgramId(program.id)

      if (tiers.length === 0) {
        return null
      }

      // Find the highest tier the customer qualifies for
      let customerTier: LoyaltyTier | null = null

      for (const tier of tiers) {
        if (points >= tier.minimumPoints) {
          customerTier = tier
        } else {
          break
        }
      }

      return customerTier
    } catch (error) {
      logger.error(`Failed to get loyalty tier for customer ${customerId}:`, error)
      return null
    }
  }

  /**
   * Record loyalty points earned
   */
  static async recordPointsEarned(
    customerId: string,
    businessId: string,
    orderId: string,
    amount: number,
    locationId?: string,
  ): Promise<number> {
    try {
      const program = await this.getLoyaltyProgramByBusinessId(businessId)

      if (!program || !program.isActive) {
        return 0
      }

      // Get customer's tier for point multiplier
      const customerTier = await this.getCustomerLoyaltyTier(customerId, businessId)
      const multiplier = customerTier ? customerTier.multiplier : 1

      // Calculate points earned
      const pointsEarned = Math.floor(amount * program.pointsPerCurrency * multiplier)

      if (pointsEarned <= 0) {
        return 0
      }

      // Record transaction
      const transaction: LoyaltyTransaction = {
        id: generateId(),
        customerId,
        orderId,
        points: pointsEarned,
        type: "earn",
        description: `Points earned from order ${orderId}`,
        businessId,
        locationId,
        createdAt: new Date().toISOString(),
      }

      await redis.lpush(`${LOYALTY_TRANSACTIONS_KEY}:${customerId}`, JSON.stringify(transaction))

      // Update customer's points
      const currentPoints = await this.getCustomerLoyaltyPoints(customerId, businessId)
      const newPoints = currentPoints + pointsEarned

      await redis.hset(CUSTOMER_LOYALTY_POINTS_KEY, `${businessId}:${customerId}`, newPoints.toString())

      revalidatePath(`/dashboard/customers/${customerId}`)

      return pointsEarned
    } catch (error) {
      logger.error(`Failed to record points earned for customer ${customerId}:`, error)
      return 0
    }
  }

  /**
   * Redeem loyalty points
   */
  static async redeemPoints(
    customerId: string,
    businessId: string,
    points: number,
    description: string,
    locationId?: string,
  ): Promise<{ success: boolean; amountDiscounted: number }> {
    try {
      const program = await this.getLoyaltyProgramByBusinessId(businessId)

      if (!program || !program.isActive) {
        return { success: false, amountDiscounted: 0 }
      }

      // Check if customer has enough points
      const currentPoints = await this.getCustomerLoyaltyPoints(customerId, businessId)

      if (currentPoints < points || points < program.minimumPointsRedemption) {
        return { success: false, amountDiscounted: 0 }
      }

      // Calculate discount amount
      const amountDiscounted = points * program.pointValueInCurrency

      // Record transaction
      const transaction: LoyaltyTransaction = {
        id: generateId(),
        customerId,
        orderId: undefined,
        points: -points,
        type: "redeem",
        description,
        businessId,
        locationId,
        createdAt: new Date().toISOString(),
      }

      await redis.lpush(`${LOYALTY_TRANSACTIONS_KEY}:${customerId}`, JSON.stringify(transaction))

      // Update customer's points
      const newPoints = currentPoints - points

      await redis.hset(CUSTOMER_LOYALTY_POINTS_KEY, `${businessId}:${customerId}`, newPoints.toString())

      revalidatePath(`/dashboard/customers/${customerId}`)

      return { success: true, amountDiscounted }
    } catch (error) {
      logger.error(`Failed to redeem points for customer ${customerId}:`, error)
      return { success: false, amountDiscounted: 0 }
    }
  }

  /**
   * Get customer's loyalty points
   */
  static async getCustomerLoyaltyPoints(customerId: string, businessId: string): Promise<number> {
    try {
      const points = await redis.hget(CUSTOMER_LOYALTY_POINTS_KEY, `${businessId}:${customerId}`)
      return points ? Number.parseInt(points, 10) : 0
    } catch (error) {
      logger.error(`Failed to get loyalty points for customer ${customerId}:`, error)
      return 0
    }
  }

  /**
   * Get customer's loyalty transactions
   */
  static async getCustomerLoyaltyTransactions(customerId: string, limit = 50): Promise<LoyaltyTransaction[]> {
    try {
      const transactions = await redis.lrange(`${LOYALTY_TRANSACTIONS_KEY}:${customerId}`, 0, limit - 1)

      return transactions.map((data) => JSON.parse(data) as LoyaltyTransaction)
    } catch (error) {
      logger.error(`Failed to get loyalty transactions for customer ${customerId}:`, error)
      return []
    }
  }

  /**
   * Adjust customer's loyalty points (for manual adjustments by staff)
   */
  static async adjustCustomerPoints(
    customerId: string,
    businessId: string,
    points: number,
    reason: string,
    staffId: string,
    locationId?: string,
  ): Promise<boolean> {
    try {
      // Record transaction
      const transaction: LoyaltyTransaction = {
        id: generateId(),
        customerId,
        points,
        type: "adjust",
        description: `Manual adjustment: ${reason} (by ${staffId})`,
        businessId,
        locationId,
        createdAt: new Date().toISOString(),
      }

      await redis.lpush(`${LOYALTY_TRANSACTIONS_KEY}:${customerId}`, JSON.stringify(transaction))

      // Update customer's points
      const currentPoints = await this.getCustomerLoyaltyPoints(customerId, businessId)
      const newPoints = Math.max(0, currentPoints + points) // Ensure points don't go negative

      await redis.hset(CUSTOMER_LOYALTY_POINTS_KEY, `${businessId}:${customerId}`, newPoints.toString())

      revalidatePath(`/dashboard/customers/${customerId}`)

      return true
    } catch (error) {
      logger.error(`Failed to adjust points for customer ${customerId}:`, error)
      return false
    }
  }
}

