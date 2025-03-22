import { type NextRequest, NextResponse } from "next/server"
import { getProductById, updateProduct, deleteProduct } from "@/lib/db/products"
import { logger } from "@/lib/logger"
import { verifyApiKey } from "@/lib/auth/api-auth"

// GET /api/v1/products/[id] - Get a product by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify API key
    const authResult = await verifyApiKey(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 })
    }

    const product = await getProductById(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    logger.error(`API error in GET /api/v1/products/${params.id}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/v1/products/[id] - Update a product
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify API key
    const authResult = await verifyApiKey(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 })
    }

    // Check if product exists
    const existingProduct = await getProductById(params.id)

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get request body
    const body = await request.json()

    // Update product
    const product = await updateProduct(params.id, body)

    if (!product) {
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    logger.error(`API error in PUT /api/v1/products/${params.id}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/v1/products/[id] - Delete a product
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify API key
    const authResult = await verifyApiKey(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: 401 })
    }

    // Check if product exists
    const existingProduct = await getProductById(params.id)

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete product
    const success = await deleteProduct(params.id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`API error in DELETE /api/v1/products/${params.id}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

