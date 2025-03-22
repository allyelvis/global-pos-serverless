import { Progress } from "@/components/ui/progress"
import type { SubscriptionPlan } from "@/lib/types"

interface UsageStatsProps {
  plan: SubscriptionPlan | null
}

export function UsageStats({ plan }: UsageStatsProps) {
  // Mock usage data - in a real app, you would fetch this from your database
  const usageData = {
    users: 2,
    products: 75,
    transactions: 250,
    locations: 1,
  }

  if (!plan) {
    return <div className="text-center py-8 text-muted-foreground">No subscription plan selected.</div>
  }

  // Calculate percentages
  const calculatePercentage = (used: number, limit: number) => {
    return Math.min(Math.round((used / limit) * 100), 100)
  }

  const userPercentage = calculatePercentage(usageData.users, plan.limits.users)
  const productPercentage = calculatePercentage(usageData.products, plan.limits.products)
  const transactionPercentage = calculatePercentage(usageData.transactions, plan.limits.transactions)
  const locationPercentage = calculatePercentage(usageData.locations, plan.limits.locations)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Users</span>
          <span className="text-sm text-muted-foreground">
            {usageData.users} / {plan.limits.users}
          </span>
        </div>
        <Progress value={userPercentage} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Products</span>
          <span className="text-sm text-muted-foreground">
            {usageData.products} / {plan.limits.products}
          </span>
        </div>
        <Progress value={productPercentage} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Transactions</span>
          <span className="text-sm text-muted-foreground">
            {usageData.transactions} / {plan.limits.transactions}
          </span>
        </div>
        <Progress value={transactionPercentage} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Locations</span>
          <span className="text-sm text-muted-foreground">
            {usageData.locations} / {plan.limits.locations}
          </span>
        </div>
        <Progress value={locationPercentage} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-4 border rounded-lg text-center">
          <span className="text-sm font-medium block">Custom Fields</span>
          <span className={plan.limits.customFields ? "text-green-500" : "text-red-500"}>
            {plan.limits.customFields ? "Enabled" : "Disabled"}
          </span>
        </div>

        <div className="p-4 border rounded-lg text-center">
          <span className="text-sm font-medium block">API Access</span>
          <span className={plan.limits.apiAccess ? "text-green-500" : "text-red-500"}>
            {plan.limits.apiAccess ? "Enabled" : "Disabled"}
          </span>
        </div>

        <div className="p-4 border rounded-lg text-center">
          <span className="text-sm font-medium block">White Label</span>
          <span className={plan.limits.whiteLabel ? "text-green-500" : "text-red-500"}>
            {plan.limits.whiteLabel ? "Enabled" : "Disabled"}
          </span>
        </div>

        <div className="p-4 border rounded-lg text-center">
          <span className="text-sm font-medium block">Priority Support</span>
          <span className={plan.limits.prioritySupport ? "text-green-500" : "text-red-500"}>
            {plan.limits.prioritySupport ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>
    </div>
  )
}

