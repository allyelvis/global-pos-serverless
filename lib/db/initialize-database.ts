import { getRedisClient } from "./redis-client"
import { logger } from "../logger"
import { VERSION } from "../version"

export async function initializeDatabase(): Promise<boolean> {
  try {
    const redis = getRedisClient()
    logger.info("Initializing database")

    // Check if database is already initialized
    const isInitialized = await redis.get("pos:system:initialized")

    if (isInitialized === "true") {
      logger.info("Database already initialized")
      return true
    }

    // Create system metadata
    await redis.hset("pos:system:metadata", {
      version: VERSION.build,
      initialized_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    })

    // Create initial schema
    await createSchema(redis)

    // Mark as initialized
    await redis.set("pos:system:initialized", "true")

    logger.info("Database initialization complete")
    return true
  } catch (error) {
    logger.error("Failed to initialize database", { error })
    throw error
  }
}

async function createSchema(redis: any): Promise<void> {
  // Create business settings hash
  await redis.hset("pos:settings:business", {
    name: "Global POS",
    currency: "USD",
    tax_rate: "0.0",
    address: "",
    phone: "",
    email: "",
    website: "",
    logo: "",
  })

  // Create categories set
  await redis.sadd("pos:categories", "General")

  // Create default category
  await redis.hset("pos:category:General", {
    name: "General",
    description: "Default category",
    created_at: new Date().toISOString(),
  })

  // Create counters for IDs
  await redis.hset("pos:counters", {
    product_id: "1000",
    order_id: "10000",
    customer_id: "100",
    user_id: "10",
    business_id: "1",
  })

  // Create default admin user if not exists
  const adminExists = await redis.exists("pos:user:1")

  if (!adminExists) {
    // In a real app, use proper password hashing
    await redis.hset("pos:user:1", {
      id: "1",
      username: "admin",
      password: "hashed_password_here", // This should be properly hashed
      email: "admin@globalpos.com",
      role: "admin",
      created_at: new Date().toISOString(),
    })

    await redis.sadd("pos:users", "1")
  }

  logger.info("Database schema created")
}

