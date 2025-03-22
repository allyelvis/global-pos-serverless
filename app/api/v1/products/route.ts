import { type NextRequest, NextResponse } from "next/server"
import { getAllProducts, createProduct } from "@/lib/db/products"
import { logger } from "@/lib/logger"
import { verifyApiKey } from "@/lib/auth/api-auth"

// GET /api/v1/products - Get all products
export async function GET(request: NextRequest) {
  try {
    // Verify API key
    const authResult = await verifyApiKey(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
    const active = searchParams.get("active") === "true"

    // Get products
    let products = await getAllProducts()

    // Apply filters
    if (category) {
      products = products.filter((product) => product.categoryId === category)
    }

    if (active !== undefined) {
      products = products.filter((product) => product.isActive === active)
    }

    // Apply limit
    if (limit && limit > 0) {
      products = products.slice(0, limit)
    }

    return NextResponse.json({ products })
  } catch (error) {
    logger.error("API error in GET /api/v1/products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/v1/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const authResult = await verifyApiKey(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 })
    }

    // Get request body
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.price || !body.categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create product
    const product = await createProduct({
      name: body.name,
      description: body.description || "",
      price: body.price,
      cost: body.cost || 0,
      sku: body.sku || "",
      barcode: body.barcode || "",
      categoryId: body.categoryId,
      stock: body.stock || 0,
      lowStockThreshold: body.lowStockThreshold || 0,
      image: body.image || "/placeholder.svg?height=100&width=100",
      isActive: body.isActive !== undefined ? body.isActive : true,
    })

    if (!product) {
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    logger.error("API error in POST /api/v1/products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

