"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Loader2, RefreshCw, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { AIService } from "@/lib/services/ai-service"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface DynamicPricingProps {
  productId: string
  basePrice: number
  inventory: number
  demand: number
  onPriceChange?: (newPrice: number) => void
}

export function DynamicPricing({ productId, basePrice, inventory, demand, onPriceChange }: DynamicPricingProps) {
  const [dynamicPrice, setDynamicPrice] = useState<number>(basePrice)
  const [adjustment, setAdjustment] = useState<number>(0)
  const [reason, setReason] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isEnabled, setIsEnabled] = useState<boolean>(true)
  const [inventoryLevel, setInventoryLevel] = useState<number>(inventory)
  const [demandLevel, setDemandLevel] = useState<number>(demand)

  const calculateDynamicPrice = async () => {
    if (!isEnabled) {
      setDynamicPrice(basePrice)
      setAdjustment(0)
      setReason("Dynamic pricing disabled")
      return
    }

    setIsLoading(true)
    try {
      const result = await AIService.getDynamicPrice(productId, basePrice, inventoryLevel, demandLevel)
      setDynamicPrice(result.price)
      setAdjustment(result.adjustment)
      setReason(result.reason)

      if (onPriceChange) {
        onPriceChange(result.price)
      }
    } catch (error) {
      console.error("Error calculating dynamic price:", error)
      setDynamicPrice(basePrice)
      setAdjustment(0)
      setReason("Error calculating price")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    calculateDynamicPrice()
  }, [productId, basePrice, isEnabled])

  const handleInventoryChange = (value: number[]) => {
    setInventoryLevel(value[0])
  }

  const handleDemandChange = (value: number[]) => {
    setDemandLevel(value[0])
  }

  const handleApplyChanges = () => {
    calculateDynamicPrice()
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">AI Dynamic Pricing</CardTitle>
          <CardDescription>Automatically adjust prices based on inventory and demand</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="dynamic-pricing" checked={isEnabled} onCheckedChange={setIsEnabled} />
          <Label htmlFor="dynamic-pricing">Enable</Label>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="base-price">Base Price</Label>
          <Input id="base-price" type="number" value={basePrice} readOnly className="bg-muted" />
        </div>

        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="inventory-level">Inventory Level</Label>
            <span className="text-sm">{inventoryLevel} units</span>
          </div>
          <Slider
            id="inventory-level"
            disabled={!isEnabled}
            value={[inventoryLevel]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleInventoryChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low Stock</span>
            <span>High Stock</span>
          </div>
        </div>

        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="demand-level">Demand Level</Label>
            <span className="text-sm">{demandLevel} units/day</span>
          </div>
          <Slider
            id="demand-level"
            disabled={!isEnabled}
            value={[demandLevel]}
            min={0}
            max={50}
            step={1}
            onValueChange={handleDemandChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low Demand</span>
            <span>High Demand</span>
          </div>
        </div>

        <Button onClick={handleApplyChanges} disabled={!isEnabled || isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Recalculate Price
            </>
          )}
        </Button>

        <div className="rounded-md border p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Dynamic Price:</span>
            <span className="text-xl font-bold">{formatCurrency(dynamicPrice)}</span>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Price Adjustment:</span>
            <Badge variant={adjustment > 0 ? "default" : adjustment < 0 ? "destructive" : "outline"}>
              {adjustment > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : adjustment < 0 ? (
                <TrendingDown className="mr-1 h-3 w-3" />
              ) : null}
              {adjustment > 0 ? "+" : ""}
              {adjustment}%
            </Badge>
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{reason}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Dynamic pricing uses AI to optimize prices based on inventory levels and market demand.
      </CardFooter>
    </Card>
  )
}

