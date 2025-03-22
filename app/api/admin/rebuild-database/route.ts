import { type NextRequest, NextResponse } from "next/server"
import { rebuildDatabase } from "@/lib/db/migrations/rebuild-database"
import { logger } from "@/lib/logger"
import { getRedisClient } from "@/lib/db/redis-client"

export async function POST(request: NextRequest) {
  try {
    // Check for admin authentication
    // This is a simplified check - in a real app, use proper authentication middleware
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const redis = getRedisClient()
    const isAdmin = await redis.hget("pos:admins", token)

    if (!isAdmin) {
      logger.warn("Unauthorized database rebuild attempt", { token })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const force = body.force === true

    // Rebuild the database
    await rebuildDatabase(force)

    return NextResponse.json({ success: true, message: "Database rebuilt successfully" })
  } catch (error) {
    logger.error("Error rebuilding database", { error })
    return NextResponse.json(
      { error: "Failed to rebuild database", message: (error as Error).message },
      { status: 500 },
    )
  }
}

