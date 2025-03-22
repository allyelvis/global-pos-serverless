"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { createCheckoutSession } from "@/lib/payment/stripe"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { SubscriptionPlan } from "@/lib/types"

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan
  isCurrentPlan: boolean
  subscriptionStatus?: "active" | "trialing" | "past_due" | "canceled" | "incomplete"
}

export function SubscriptionPlanCard({ plan, isCurrentPlan, subscriptionStatus }: SubscriptionPlanCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubscribe = async () => {
    try {
      setIsLoading(true)

      // Create a checkout session
      const { url } = await createCheckoutSession(plan.id)

      // Redirect to the checkout page
      router.push(url)
    } catch (error) {
      console.error("Failed to create checkout session:", error)
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`flex flex-col ${isCurrentPlan ? "border-primary" : ""}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription className="mt-1">{plan.description}</CardDescription>
          </div>
          {isCurrentPlan && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
              Current Plan
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-4">
          <span className="text-3xl font-bold">${plan.price}</span>
          <span className="text-muted-foreground">/{plan.interval}</span>
        </div>

        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {isCurrentPlan ? (
          <Button className="w-full" variant="outline" disabled>
            {subscriptionStatus === "trialing" ? "Currently Trialing" : "Current Plan"}
          </Button>
        ) : (
          <Button className="w-full" onClick={handleSubscribe} disabled={isLoading}>
            {isLoading ? "Processing..." : plan.price === 0 ? "Start Free" : "Subscribe"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

