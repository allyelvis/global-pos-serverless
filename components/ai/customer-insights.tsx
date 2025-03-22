"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, User, ShoppingBag, Award, Lightbulb } from "lucide-react"
import { AIService } from "@/lib/services/ai-service"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface CustomerInsightsProps {
  customerId: string
}

export function CustomerInsights({ customerId }: CustomerInsightsProps) {
  const [insights, setInsights] = useState<{
    preferredCategories: string[]
    averageSpend: number
    visitFrequency: string
    loyaltyLevel: string
    recommendations: string[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchInsights = async () => {
    setIsLoading(true)
    try {
      const data = await AIService.getCustomerInsights(customerId)
      setInsights(data)
    } catch (error) {
      console.error("Error fetching customer insights:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (customerId) {
      fetchInsights()
    }
  }, [customerId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const getLoyaltyColor = (level: string) => {
    switch (level) {
      case "Platinum":
        return "bg-purple-500 hover:bg-purple-600"
      case "Gold":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "Silver":
        return "bg-gray-400 hover:bg-gray-500"
      case "Bronze":
        return "bg-amber-600 hover:bg-amber-700"
      default:
        return "bg-blue-500 hover:bg-blue-600"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">AI Customer Insights</CardTitle>
          <CardDescription>AI-powered analysis of customer behavior and preferences</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchInsights} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : insights ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-muted-foreground">
                  <User className="mr-2 h-4 w-4" />
                  Customer Profile
                </div>
                <div className="rounded-md border p-3">
                  <div className="mb-2">
                    <Badge className={getLoyaltyColor(insights.loyaltyLevel)}>{insights.loyaltyLevel} Level</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Average Spend:</span>
                      <span className="font-medium">{formatCurrency(insights.averageSpend)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Visit Frequency:</span>
                      <span className="font-medium">{insights.visitFrequency}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium text-muted-foreground">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Preferred Categories
                </div>
                <div className="rounded-md border p-3">
                  {insights.preferredCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {insights.preferredCategories.map((category, index) => (
                        <Badge key={index} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No preferred categories yet</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium text-muted-foreground">
                <Lightbulb className="mr-2 h-4 w-4" />
                AI Recommendations
              </div>
              <div className="rounded-md border p-3">
                <ul className="space-y-2">
                  {insights.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="mt-0.5 rounded-full bg-primary p-1">
                        <Award className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">No customer insights available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

