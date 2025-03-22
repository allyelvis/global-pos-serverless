"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Package, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { AIService } from "@/lib/services/ai-service"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface InventoryOptimizationProps {
  businessId: string
  productId: string
  currentStock: number
}

export function InventoryOptimization({ businessId, productId, currentStock }: InventoryOptimizationProps) {
  const [recommendations, setRecommendations] = useState<{
    reorderPoint: number
    reorderQuantity: number
    restockUrgency: "Low" | "Medium" | "High"
    restockRecommendation: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchRecommendations = async () => {
    setIsLoading(true)
    try {
      const data = await AIService.getInventoryRecommendations(businessId, productId)
      setRecommendations(data)
    } catch (error) {
      console.error("Error fetching inventory recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (businessId && productId) {
      fetchRecommendations()
    }
  }, [businessId, productId])

  const getUrgencyColor = (urgency: "Low" | "Medium" | "High") => {
    switch (urgency) {
      case "High":
        return "bg-red-500 hover:bg-red-600"
      case "Medium":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "Low":
        return "bg-green-500 hover:bg-green-600"
    }
  }

  const getUrgencyIcon = (urgency: "Low" | "Medium" | "High") => {
    switch (urgency) {
      case "High":
        return <AlertTriangle className="mr-1 h-3 w-3" />
      case "Medium":
        return <Clock className="mr-1 h-3 w-3" />
      case "Low":
        return <CheckCircle className="mr-1 h-3 w-3" />
    }
  }

  const getStockStatus = () => {
    if (!recommendations) return { color: "bg-gray-200", percentage: 50 }

    const percentage = (currentStock / recommendations.reorderQuantity) * 100
    let color = "bg-green-500"

    if (currentStock <= recommendations.reorderPoint) {
      color = "bg-red-500"
    } else if (currentStock <= recommendations.reorderPoint * 1.5) {
      color = "bg-yellow-500"
    }

    return { color, percentage: Math.min(percentage, 100) }
  }

  const stockStatus = getStockStatus()

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">AI Inventory Optimization</CardTitle>
          <CardDescription>Smart inventory management recommendations</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchRecommendations} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recommendations ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Current Stock Level</span>
                </div>
                <Badge variant="outline">{currentStock} units</Badge>
              </div>
              <Progress value={stockStatus.percentage} className="h-2" indicatorClassName={stockStatus.color} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Reorder Point: {recommendations.reorderPoint}</span>
                <span>Target: {recommendations.reorderQuantity}</span>
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Restock Urgency:</span>
                <Badge className={getUrgencyColor(recommendations.restockUrgency)}>
                  {getUrgencyIcon(recommendations.restockUrgency)}
                  {recommendations.restockUrgency}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium">AI Recommendation:</div>
                  <p className="text-sm text-muted-foreground">{recommendations.restockRecommendation}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Reorder Point:</div>
                    <p className="text-lg font-bold">{recommendations.reorderPoint} units</p>
                    <p className="text-xs text-muted-foreground">When stock reaches this level, place a new order</p>
                  </div>

                  <div>
                    <div className="text-sm font-medium">Reorder Quantity:</div>
                    <p className="text-lg font-bold">{recommendations.reorderQuantity} units</p>
                    <p className="text-xs text-muted-foreground">Optimal quantity to order for efficiency</p>
                  </div>
                </div>
              </div>
            </div>

            {currentStock <= recommendations.reorderPoint && (
              <div className="mt-4 flex items-center justify-between rounded-md bg-amber-50 p-3 dark:bg-amber-950">
                <div className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                  <span className="font-medium text-amber-700 dark:text-amber-300">Stock below reorder point</span>
                </div>
                <Button size="sm" variant="secondary">
                  Create Purchase Order
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">No inventory recommendations available</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        AI-powered inventory optimization helps prevent stockouts and overstock situations.
      </CardFooter>
    </Card>
  )
}

