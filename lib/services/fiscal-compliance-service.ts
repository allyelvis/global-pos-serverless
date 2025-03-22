"use server"

import { revalidatePath } from "next/cache"
import redis from "../db/redis"
import logger from "../logger"
import { generateId } from "../utils"

// Types for fiscal compliance
type FiscalRegion = {
  id: string
  code: string
  name: string
  country: string
  taxRules: TaxRule[]
  fiscalRequirements: FiscalRequirement[]
  createdAt: string
  updatedAt: string
}

type TaxRule = {
  id: string
  name: string
  rate: number
  applicableProductTypes: string[]
  exemptProductTypes: string[]
  regionSpecific: boolean
}

type FiscalRequirement = {
  id: string
  name: string
  description: string
  isRequired: boolean
  validationFunction?: string
}

// Redis keys
const FISCAL_REGIONS_KEY = "fiscal_regions"
const TAX_RULES_KEY = "tax_rules"
const FISCAL_REQUIREMENTS_KEY = "fiscal_requirements"

// Get all fiscal regions
export async function getFiscalRegions(): Promise<FiscalRegion[]> {
  try {
    const regionsMap = (await redis.hgetall(FISCAL_REGIONS_KEY)) || {}
    return Object.values(regionsMap).map((region) => JSON.parse(region as string)) as FiscalRegion[]
  } catch (error) {
    logger.error("Failed to get fiscal regions", error as Error)
    return []
  }
}

// Get fiscal region by ID
export async function getFiscalRegionById(id: string): Promise<FiscalRegion | null> {
  try {
    const region = await redis.hget(FISCAL_REGIONS_KEY, id)
    return region ? (JSON.parse(region) as FiscalRegion) : null
  } catch (error) {
    logger.error(`Failed to get fiscal region ${id}`, error as Error)
    return null
  }
}

// Create fiscal region
export async function createFiscalRegion(
  data: Omit<FiscalRegion, "id" | "createdAt" | "updatedAt">,
): Promise<FiscalRegion | null> {
  try {
    const id = generateId()
    const now = new Date().toISOString()

    const region: FiscalRegion = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    }

    await redis.hset(FISCAL_REGIONS_KEY, id, JSON.stringify(region))
    revalidatePath("/dashboard/settings/fiscal")
    return region
  } catch (error) {
    logger.error("Failed to create fiscal region", error as Error)
    return null
  }
}

// Update fiscal region
export async function updateFiscalRegion(id: string, data: Partial<FiscalRegion>): Promise<FiscalRegion | null> {
  try {
    const existingRegion = await getFiscalRegionById(id)
    if (!existingRegion) return null

    const updatedRegion: FiscalRegion = {
      ...existingRegion,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(FISCAL_REGIONS_KEY, id, JSON.stringify(updatedRegion))
    revalidatePath("/dashboard/settings/fiscal")
    return updatedRegion
  } catch (error) {
    logger.error(`Failed to update fiscal region ${id}`, error as Error)
    return null
  }
}

// Delete fiscal region
export async function deleteFiscalRegion(id: string): Promise<boolean> {
  try {
    await redis.hdel(FISCAL_REGIONS_KEY, id)
    revalidatePath("/dashboard/settings/fiscal")
    return true
  } catch (error) {
    logger.error(`Failed to delete fiscal region ${id}`, error as Error)
    return false
  }
}

// Validate receipt for fiscal compliance
export async function validateReceiptForFiscalCompliance(
  receipt: any,
  regionId: string,
): Promise<{ valid: boolean; errors: string[] }> {
  try {
    const region = await getFiscalRegionById(regionId)
    if (!region) {
      return { valid: false, errors: ["Invalid fiscal region"] }
    }

    const errors: string[] = []

    // Check required fields based on region
    for (const requirement of region.fiscalRequirements) {
      if (requirement.isRequired) {
        // This is a simplified validation - in a real system you'd have more complex logic
        if (!receipt[requirement.name]) {
          errors.push(`Missing required field: ${requirement.name}`)
        }
      }
    }

    // Validate tax calculations
    // This is a simplified check - in a real system you'd have more complex tax validation
    if (receipt.taxAmount <= 0 && region.taxRules.some((rule) => rule.rate > 0)) {
      errors.push("Tax amount appears to be incorrect")
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  } catch (error) {
    logger.error("Failed to validate receipt for fiscal compliance", error as Error)
    return { valid: false, errors: ["System error during validation"] }
  }
}

// Seed initial fiscal regions
export async function seedFiscalRegionsIfEmpty(): Promise<void> {
  try {
    const regionsCount = await redis.hlen(FISCAL_REGIONS_KEY)

    if (regionsCount === 0) {
      const regions: Omit<FiscalRegion, "id" | "createdAt" | "updatedAt">[] = [
        {
          code: "US",
          name: "United States",
          country: "United States",
          taxRules: [
            {
              id: generateId(),
              name: "Sales Tax",
              rate: 0.0725, // Example rate
              applicableProductTypes: ["physical", "digital"],
              exemptProductTypes: ["food", "medicine"],
              regionSpecific: true,
            },
          ],
          fiscalRequirements: [
            {
              id: generateId(),
              name: "businessTaxId",
              description: "Business Tax ID",
              isRequired: true,
            },
            {
              id: generateId(),
              name: "receiptNumber",
              description: "Sequential Receipt Number",
              isRequired: true,
            },
          ],
        },
        {
          code: "EU",
          name: "European Union",
          country: "Multiple",
          taxRules: [
            {
              id: generateId(),
              name: "VAT",
              rate: 0.21, // Example rate
              applicableProductTypes: ["physical", "digital", "service"],
              exemptProductTypes: [],
              regionSpecific: false,
            },
          ],
          fiscalRequirements: [
            {
              id: generateId(),
              name: "vatNumber",
              description: "VAT Registration Number",
              isRequired: true,
            },
            {
              id: generateId(),
              name: "receiptNumber",
              description: "Sequential Receipt Number",
              isRequired: true,
            },
            {
              id: generateId(),
              name: "businessAddress",
              description: "Business Address",
              isRequired: true,
            },
          ],
        },
      ]

      for (const region of regions) {
        await createFiscalRegion(region)
      }

      logger.info("Seeded initial fiscal regions")
    }
  } catch (error) {
    logger.error("Failed to seed fiscal regions", error as Error)
  }
}

