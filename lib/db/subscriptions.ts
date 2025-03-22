"use server"

import { revalidatePath } from "next/cache"
import redis from "./redis"
import type { SubscriptionPlan, Subscription, Business, Invoice } from "../types"
import { generateId } from "../utils"

const SUBSCRIPTION_PLANS_KEY = "subscription_plans"
const SUBSCRIPTIONS_KEY = "subscriptions"
const INVOICES_KEY = "invoices"

// Get all subscription plans
export async function getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const plansMap = (await redis.hgetall(SUBSCRIPTION_PLANS_KEY)) || {}
    const plans = Object.values(plansMap).map((item) => JSON.parse(item as string)) as SubscriptionPlan[]
    return plans.filter((plan) => plan.isActive).sort((a, b) => a.price - b.price)
  } catch (error) {
    console.error("Failed to fetch subscription plans:", error)
    return []
  }
}

// Get subscription plan by ID
export async function getSubscriptionPlanById(id: string): Promise<SubscriptionPlan | null> {
  try {
    const plan = await redis.hget(SUBSCRIPTION_PLANS_KEY, id)
    return plan ? (JSON.parse(plan) as SubscriptionPlan) : null
  } catch (error) {
    console.error(`Failed to fetch subscription plan ${id}:`, error)
    return null
  }
}

// Create a subscription plan
export async function createSubscriptionPlan(
  planData: Omit<SubscriptionPlan, "id" | "createdAt" | "updatedAt">,
): Promise<SubscriptionPlan | null> {
  try {
    const id = generateId()

    const plan: SubscriptionPlan = {
      id,
      ...planData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(SUBSCRIPTION_PLANS_KEY, id, JSON.stringify(plan))
    revalidatePath("/dashboard/subscriptions")
    return plan
  } catch (error) {
    console.error("Failed to create subscription plan:", error)
    return null
  }
}

// Update a subscription plan
export async function updateSubscriptionPlan(
  id: string,
  planData: Partial<SubscriptionPlan>,
): Promise<SubscriptionPlan | null> {
  try {
    const existingPlan = await getSubscriptionPlanById(id)
    if (!existingPlan) return null

    const updatedPlan: SubscriptionPlan = {
      ...existingPlan,
      ...planData,
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(SUBSCRIPTION_PLANS_KEY, id, JSON.stringify(updatedPlan))
    revalidatePath("/dashboard/subscriptions")
    return updatedPlan
  } catch (error) {
    console.error(`Failed to update subscription plan ${id}:`, error)
    return null
  }
}

// Delete a subscription plan
export async function deleteSubscriptionPlan(id: string): Promise<boolean> {
  try {
    await redis.hdel(SUBSCRIPTION_PLANS_KEY, id)
    revalidatePath("/dashboard/subscriptions")
    return true
  } catch (error) {
    console.error(`Failed to delete subscription plan ${id}:`, error)
    return false
  }
}

// Get subscription by ID
export async function getSubscriptionById(id: string): Promise<Subscription | null> {
  try {
    const subscription = await redis.hget(SUBSCRIPTIONS_KEY, id)
    return subscription ? (JSON.parse(subscription) as Subscription) : null
  } catch (error) {
    console.error(`Failed to fetch subscription ${id}:`, error)
    return null
  }
}

// Get subscription by business ID
export async function getSubscriptionByBusinessId(businessId: string): Promise<Subscription | null> {
  try {
    const subscriptionsMap = (await redis.hgetall(SUBSCRIPTIONS_KEY)) || {}
    const subscriptions = Object.values(subscriptionsMap).map((item) => JSON.parse(item as string)) as Subscription[]
    return subscriptions.find((sub) => sub.businessId === businessId) || null
  } catch (error) {
    console.error(`Failed to fetch subscription for business ${businessId}:`, error)
    return null
  }
}

// Create a subscription
export async function createSubscription(
  subscriptionData: Omit<Subscription, "id" | "createdAt" | "updatedAt">,
): Promise<Subscription | null> {
  try {
    const id = generateId()

    const subscription: Subscription = {
      id,
      ...subscriptionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(SUBSCRIPTIONS_KEY, id, JSON.stringify(subscription))

    // Update business with subscription ID
    const businessKey = "businesses"
    const businessData = await redis.hget(businessKey, subscription.businessId)

    if (businessData) {
      const business = JSON.parse(businessData as string) as Business
      business.subscriptionId = id
      business.subscriptionStatus = subscription.status
      business.subscriptionPeriodEnd = subscription.currentPeriodEnd
      business.updatedAt = new Date().toISOString()

      await redis.hset(businessKey, subscription.businessId, JSON.stringify(business))
    }

    revalidatePath("/dashboard/billing")
    return subscription
  } catch (error) {
    console.error("Failed to create subscription:", error)
    return null
  }
}

// Update a subscription
export async function updateSubscription(
  id: string,
  subscriptionData: Partial<Subscription>,
): Promise<Subscription | null> {
  try {
    const existingSubscription = await getSubscriptionById(id)
    if (!existingSubscription) return null

    const updatedSubscription: Subscription = {
      ...existingSubscription,
      ...subscriptionData,
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(SUBSCRIPTIONS_KEY, id, JSON.stringify(updatedSubscription))

    // Update business with subscription status
    if (subscriptionData.status) {
      const businessKey = "businesses"
      const businessData = await redis.hget(businessKey, updatedSubscription.businessId)

      if (businessData) {
        const business = JSON.parse(businessData as string) as Business
        business.subscriptionStatus = updatedSubscription.status
        if (subscriptionData.currentPeriodEnd) {
          business.subscriptionPeriodEnd = updatedSubscription.currentPeriodEnd
        }
        business.updatedAt = new Date().toISOString()

        await redis.hset(businessKey, updatedSubscription.businessId, JSON.stringify(business))
      }
    }

    revalidatePath("/dashboard/billing")
    return updatedSubscription
  } catch (error) {
    console.error(`Failed to update subscription ${id}:`, error)
    return null
  }
}

// Cancel a subscription
export async function cancelSubscription(id: string, cancelAtPeriodEnd = true): Promise<Subscription | null> {
  try {
    const existingSubscription = await getSubscriptionById(id)
    if (!existingSubscription) return null

    const updatedSubscription: Subscription = {
      ...existingSubscription,
      cancelAtPeriodEnd,
      updatedAt: new Date().toISOString(),
    }

    // If not canceling at period end, update status immediately
    if (!cancelAtPeriodEnd) {
      updatedSubscription.status = "canceled"
    }

    await redis.hset(SUBSCRIPTIONS_KEY, id, JSON.stringify(updatedSubscription))

    // Update business with subscription status
    const businessKey = "businesses"
    const businessData = await redis.hget(businessKey, updatedSubscription.businessId)

    if (businessData) {
      const business = JSON.parse(businessData as string) as Business
      if (!cancelAtPeriodEnd) {
        business.subscriptionStatus = "canceled"
      }
      business.updatedAt = new Date().toISOString()

      await redis.hset(businessKey, updatedSubscription.businessId, JSON.stringify(business))
    }

    revalidatePath("/dashboard/billing")
    return updatedSubscription
  } catch (error) {
    console.error(`Failed to cancel subscription ${id}:`, error)
    return null
  }
}

// Get invoices by business ID
export async function getInvoicesByBusinessId(businessId: string): Promise<Invoice[]> {
  try {
    const invoicesMap = (await redis.hgetall(INVOICES_KEY)) || {}
    const invoices = Object.values(invoicesMap).map((item) => JSON.parse(item as string)) as Invoice[]
    return invoices
      .filter((invoice) => invoice.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error(`Failed to fetch invoices for business ${businessId}:`, error)
    return []
  }
}

// Create an invoice
export async function createInvoice(
  invoiceData: Omit<Invoice, "id" | "createdAt" | "updatedAt">,
): Promise<Invoice | null> {
  try {
    const id = generateId()

    const invoice: Invoice = {
      id,
      ...invoiceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(INVOICES_KEY, id, JSON.stringify(invoice))
    revalidatePath("/dashboard/billing")
    return invoice
  } catch (error) {
    console.error("Failed to create invoice:", error)
    return null
  }
}

// Update an invoice
export async function updateInvoice(id: string, invoiceData: Partial<Invoice>): Promise<Invoice | null> {
  try {
    const existingInvoice = await redis.hget(INVOICES_KEY, id)
    if (!existingInvoice) return null

    const invoice = JSON.parse(existingInvoice as string) as Invoice
    const updatedInvoice: Invoice = {
      ...invoice,
      ...invoiceData,
      updatedAt: new Date().toISOString(),
    }

    await redis.hset(INVOICES_KEY, id, JSON.stringify(updatedInvoice))
    revalidatePath("/dashboard/billing")
    return updatedInvoice
  } catch (error) {
    console.error(`Failed to update invoice ${id}:`, error)
    return null
  }
}

// Seed initial subscription plans if none exist
export async function seedSubscriptionPlansIfEmpty(): Promise<void> {
  try {
    const plansCount = await redis.hlen(SUBSCRIPTION_PLANS_KEY)

    if (plansCount === 0) {
      const initialPlans: Array<Omit<SubscriptionPlan, "id" | "createdAt" | "updatedAt">> = [
        {
          name: "Free",
          description: "Basic features for small businesses just getting started",
          price: 0,
          interval: "month",
          currency: "USD",
          features: ["Up to 100 products", "1 user account", "Basic reporting", "Standard support", "Single location"],
          isActive: true,
          limits: {
            users: 1,
            products: 100,
            transactions: 100,
            locations: 1,
            customFields: false,
            apiAccess: false,
            whiteLabel: false,
            prioritySupport: false,
          },
        },
        {
          name: "Starter",
          description: "Essential features for growing businesses",
          price: 29.99,
          interval: "month",
          currency: "USD",
          features: [
            "Up to 500 products",
            "3 user accounts",
            "Advanced reporting",
            "Email support",
            "Up to 2 locations",
            "Custom fields",
          ],
          isActive: true,
          limits: {
            users: 3,
            products: 500,
            transactions: 1000,
            locations: 2,
            customFields: true,
            apiAccess: false,
            whiteLabel: false,
            prioritySupport: false,
          },
        },
        {
          name: "Professional",
          description: "Advanced features for established businesses",
          price: 79.99,
          interval: "month",
          currency: "USD",
          features: [
            "Unlimited products",
            "10 user accounts",
            "Advanced analytics",
            "Priority support",
            "Up to 5 locations",
            "API access",
            "Custom fields",
            "White labeling",
          ],
          isActive: true,
          limits: {
            users: 10,
            products: 10000,
            transactions: 10000,
            locations: 5,
            customFields: true,
            apiAccess: true,
            whiteLabel: true,
            prioritySupport: true,
          },
        },
        {
          name: "Enterprise",
          description: "Complete solution for large businesses",
          price: 199.99,
          interval: "month",
          currency: "USD",
          features: [
            "Unlimited everything",
            "Unlimited users",
            "Enterprise analytics",
            "24/7 dedicated support",
            "Unlimited locations",
            "Advanced API access",
            "Custom development",
            "White labeling",
            "Custom integrations",
          ],
          isActive: true,
          limits: {
            users: 100,
            products: 100000,
            transactions: 100000,
            locations: 100,
            customFields: true,
            apiAccess: true,
            whiteLabel: true,
            prioritySupport: true,
          },
        },
      ]

      for (const plan of initialPlans) {
        await createSubscriptionPlan(plan)
      }

      console.log("Seeded initial subscription plans")
    }
  } catch (error) {
    console.error("Failed to seed subscription plans:", error)
  }
}

