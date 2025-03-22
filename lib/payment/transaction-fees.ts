"use server"

import { getSubscriptionByBusinessId, getSubscriptionPlanById } from "../db/subscriptions"

// Calculate transaction fee based on subscription plan
export async function calculateTransactionFee(
  businessId: string,
  amount: number,
): Promise<{ fee: number; rate: number }> {
  try {
    // Get the business's subscription
    const subscription = await getSubscriptionByBusinessId(businessId)

    // Default fee rate for no subscription (highest)
    let feeRate = 0.029 // 2.9%

    if (subscription) {
      const plan = await getSubscriptionPlanById(subscription.planId)

      if (plan) {
        // Adjust fee rate based on plan
        switch (plan.name) {
          case "Free":
            feeRate = 0.029 // 2.9%
            break
          case "Starter":
            feeRate = 0.025 // 2.5%
            break
          case "Professional":
            feeRate = 0.019 // 1.9%
            break
          case "Enterprise":
            feeRate = 0.015 // 1.5%
            break
          default:
            feeRate = 0.029 // 2.9%
        }
      }
    }

    // Calculate fee (percentage of amount)
    const fee = amount * feeRate

    // Return fee and rate
    return { fee, rate: feeRate }
  } catch (error) {
    console.error("Failed to calculate transaction fee:", error)
    // Default to highest fee rate if there's an error
    return { fee: amount * 0.029, rate: 0.029 }
  }
}

