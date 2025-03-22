import { getAllSubscriptionPlans } from "@/lib/db/subscriptions"
import { SubscriptionPlanCard } from "@/components/subscriptions/subscription-plan-card"
import { getCurrentUser } from "@/lib/db/users"
import { getBusinessById } from "@/lib/db/business"
import { getSubscriptionByBusinessId } from "@/lib/db/subscriptions"
import { redirect } from "next/navigation"

export default async function SubscriptionsPage() {
  const plans = await getAllSubscriptionPlans()
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const business = await getBusinessById(user.businessId)
  if (!business) {
    redirect("/setup")
  }

  const currentSubscription = business.subscriptionId ? await getSubscriptionByBusinessId(business.businessId) : null

  const currentPlanId = currentSubscription?.planId

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Subscription Plans</h1>
      <p className="text-muted-foreground mb-8">
        Choose the plan that best fits your business needs. All plans include our core POS features.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <SubscriptionPlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={plan.id === currentPlanId}
            subscriptionStatus={currentSubscription?.status}
          />
        ))}
      </div>

      <div className="mt-12 bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Need a custom plan?</h2>
        <p className="mb-4">
          If you need a tailored solution for your business with custom features or integrations, contact our sales team
          for a personalized quote.
        </p>
        <a
          href="mailto:sales@globalpos.com"
          className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Contact Sales
        </a>
      </div>
    </div>
  )
}

