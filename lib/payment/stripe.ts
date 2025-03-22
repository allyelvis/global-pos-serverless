"use server"
import { getCurrentUser } from "../db/users"
import { getBusinessById } from "../db/business"
import { getSubscriptionPlanById, createSubscription, updateSubscription, createInvoice } from "../db/subscriptions"

// Mock Stripe integration - in a real app, you would use the Stripe SDK
export async function createCheckoutSession(planId: string): Promise<{ url: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("User not authenticated")
    }

    const business = await getBusinessById(user.businessId)
    if (!business) {
      throw new Error("Business not found")
    }

    const plan = await getSubscriptionPlanById(planId)
    if (!plan) {
      throw new Error("Subscription plan not found")
    }

    // In a real implementation, you would create a Stripe checkout session here
    // For now, we'll simulate it by creating a subscription directly

    // Create a subscription
    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1) // 1 month trial

    const subscription = await createSubscription({
      businessId: business.id,
      planId: plan.id,
      status: "trialing",
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: `sub_${Math.random().toString(36).substring(2, 15)}`,
      stripeCustomerId: `cus_${Math.random().toString(36).substring(2, 15)}`,
    })

    if (!subscription) {
      throw new Error("Failed to create subscription")
    }

    // Create an invoice for the trial period
    await createInvoice({
      businessId: business.id,
      subscriptionId: subscription.id,
      amount: 0, // Free trial
      currency: plan.currency,
      status: "paid",
      dueDate: now.toISOString(),
      paidDate: now.toISOString(),
      stripeInvoiceId: `inv_${Math.random().toString(36).substring(2, 15)}`,
      items: [
        {
          description: `${plan.name} Plan - Trial Period`,
          amount: plan.price,
          quantity: 1,
        },
      ],
    })

    // In a real app, return the checkout URL
    // For now, we'll redirect to the billing page
    return { url: "/dashboard/billing?success=true" }
  } catch (error) {
    console.error("Failed to create checkout session:", error)
    throw error
  }
}

export async function createPortalSession(): Promise<{ url: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("User not authenticated")
    }

    // In a real app, you would create a Stripe customer portal session
    // For now, we'll redirect to the billing page
    return { url: "/dashboard/billing" }
  } catch (error) {
    console.error("Failed to create portal session:", error)
    throw error
  }
}

export async function handleSubscriptionUpdated(
  subscriptionId: string,
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete",
  customerId: string,
): Promise<void> {
  try {
    // Update the subscription in the database
    await updateSubscription(subscriptionId, { status })
  } catch (error) {
    console.error("Failed to handle subscription update:", error)
    throw error
  }
}

export async function handleInvoicePaid(
  subscriptionId: string,
  invoiceId: string,
  amount: number,
  currency: string,
): Promise<void> {
  try {
    const subscription = await updateSubscription(subscriptionId, { status: "active" })
    if (!subscription) {
      throw new Error("Subscription not found")
    }

    // Create an invoice record
    await createInvoice({
      businessId: subscription.businessId,
      subscriptionId: subscription.id,
      amount,
      currency,
      status: "paid",
      dueDate: new Date().toISOString(),
      paidDate: new Date().toISOString(),
      stripeInvoiceId: invoiceId,
      items: [
        {
          description: "Monthly subscription",
          amount,
          quantity: 1,
        },
      ],
    })
  } catch (error) {
    console.error("Failed to handle invoice paid:", error)
    throw error
  }
}

