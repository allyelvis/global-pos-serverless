"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { AIService } from "@/lib/services/ai-service"
import type { Product } from "@/lib/types/product"
import { formatCurrency } from "@/lib/utils"

interface ProductRecommendationsProps {
  productId: string
  customerId?: string
  limit?: number
}

export function ProductRecommendations({ productId, customerId, limit = 4 }: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchRecommendations = async () => {
    setIsLoading(true)
    try {
      const data = await AIService.getProductRecommendations(productId, customerId, limit)
      setRecommendations(data)
    } catch (error) {
      console.error("Error fetching product recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (productId) {
      fetchRecommendations()
    }
  }, [productId, customerId, limit])

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Recommended Products</CardTitle>
          <CardDescription>AI-powered recommendations based on this product</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchRecommendations} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {recommendations.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-md border bg-card transition-all hover:shadow-md"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg?height=200&width=200"}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{product.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-semibold">{formatCurrency(product.price)}</span>
                    <Button size="sm" variant="secondary">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">No recommendations available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

