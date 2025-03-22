import { getRedisClient } from "../redis-client"
import { logger } from "../../logger"
import { initializeDatabase } from "../initialize-database"

export async function rebuildDatabase(force = false): Promise<boolean> {
  try {
    const redis = getRedisClient()

    // Check if we're in a production environment and force is not enabled
    if (process.env.NODE_ENV === "production" && !force) {
      logger.warn("Attempted to rebuild database in production without force flag")
      throw new Error("Cannot rebuild database in production without force flag")
    }

    logger.info("Starting database rebuild process")

    // Get all keys to delete
    const keys = await redis.keys("pos:*")

    if (keys.length > 0) {
      logger.info(`Found ${keys.length} keys to delete`)

      // Delete all existing keys
      await redis.del(...keys)
      logger.info("Deleted all existing database keys")
    } else {
      logger.info("No existing keys found")
    }

    // Re-initialize the database with fresh schema
    await initializeDatabase()
    logger.info("Database rebuilt successfully")

    return true
  } catch (error) {
    logger.error("Failed to rebuild database", { error })
    throw error
  }
}

