import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Business, Subscription, SubscriptionPlan } from "@/lib/types"

interface BillingInfoProps {
  business: Business
  subscription: Subscription | null
  plan: SubscriptionPlan | null
}

export function BillingInfo({ business, subscription, plan }: BillingInfoProps) {
  // Format the period end date
  const formattedPeriodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  // Determine subscription status display
  const getStatusDisplay = () => {
    if (!subscription) return { label: "No Subscription", color: "bg-gray-500" }

    switch (subscription.status) {
      case "active":
        return { label: "Active", color: "bg-green-500" }
      case "trialing":
        return { label: "Trial", color: "bg-blue-500" }
      case "past_due":
        return { label: "Past Due", color: "bg-yellow-500" }
      case "canceled":
        return { label: "Canceled", color: "bg-red-500" }
      case "incomplete":
        return { label: "Incomplete", color: "bg-orange-500" }
      default:
        return { label: "Unknown", color: "bg-gray-500" }
    }
  }

  const status = getStatusDisplay()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Details</CardTitle>
        <CardDescription>Your current plan and billing information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Current Plan</h3>
          <p className="text-xl font-semibold">{plan?.name || "No Plan"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <div className="flex items-center mt-1">
            <span className={`h-2.5 w-2.5 rounded-full ${status.color} mr-2`}></span>
            <span>{status.label}</span>
          </div>
        </div>

        {subscription && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Billing Period</h3>
            <p>
              {subscription.cancelAtPeriodEnd ? `Cancels on ${formattedPeriodEnd}` : `Renews on ${formattedPeriodEnd}`}
            </p>
          </div>
        )}

        {plan && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
            <p className="text-xl font-semibold">
              ${plan.price}/{plan.interval}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/dashboard/subscriptions">{plan ? "Change Plan" : "Choose a Plan"}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

