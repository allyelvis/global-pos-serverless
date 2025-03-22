"use server"

import { revalidatePath } from "next/cache"
import { type PaymentMethod, PaymentService } from "@/lib/services/payment-service"
import { createOrder } from "@/lib/db/orders"
import { updateProduct } from "@/lib/db/products"
import { generateId } from "@/lib/utils"
import { logger } from "@/lib/logger"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface PaymentDetails {
  cardNumber?: string
  cardExpiry?: string
  cardCvc?: string
  checkNumber?: string
  bankAccount?: string
  bankRouting?: string
  paypalEmail?: string
  mobileNumber?: string
  notes?: string
}

interface ProcessPaymentRequest {
  items: CartItem[]
  total: number
  paymentMethod: PaymentMethod
  currency: string
  customerId?: string
  paymentDetails?: PaymentDetails
}

export async function processPayment(request: ProcessPaymentRequest) {
  try {
    logger.info(`Processing payment for order with ${request.items.length} items`)

    // Generate order ID
    const orderId = generateId()

    // Process payment through payment service
    const paymentResult = await PaymentService.processPayment({
      amount: request.total,
      currency: request.currency,
      method: request.paymentMethod,
      orderId,
      customerEmail: request.paymentDetails?.paypalEmail,
      description: `Order with ${request.items.length} items`,
      metadata: {
        items: request.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
        })),
      },
    })

    if (paymentResult.success) {
      // Create order in database
      const orderItems = request.items.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        discount: 0,
        tax: item.price * item.quantity * 0.1, // Assuming 10% tax
        total: item.price * item.quantity * 1.1,
      }))

      const order = await createOrder(
        {
          customerId: request.customerId || "guest",
          userId: "system", // This would be the actual user ID in a real app
          businessId: "default", // This would be the actual business ID
          status: "completed",
          paymentStatus: paymentResult.status === "completed" ? "paid" : "pending",
          paymentMethod: request.paymentMethod,
          subtotal: request.total,
          tax: request.total * 0.1, // Assuming 10% tax
          discount: 0,
          total: request.total * 1.1,
          source: "pos",
        },
        orderItems,
      )

      // Update product inventory
      for (const item of request.items) {
        await updateProduct(item.id, {
          stock: { decrement: item.quantity },
        })
      }

      // Revalidate POS page
      revalidatePath("/dashboard/pos")

      return {
        success: true,
        orderId: order?.id || orderId,
        transactionId: paymentResult.transactionId,
        message: "Payment processed successfully",
      }
    } else {
      return {
        success: false,
        message: paymentResult.message,
      }
    }
  } catch (error: any) {
    logger.error("Payment processing error:", error)

    return {
      success: false,
      message: error.message || "An error occurred while processing payment",
    }
  }
}

export async function voidTransaction(transactionId: string, reason: string) {
  try {
    // In a real implementation, this would call the payment gateway to void the transaction
    logger.info(`Voiding transaction ${transactionId}: ${reason}`)

    // Revalidate POS page
    revalidatePath("/dashboard/pos")

    return {
      success: true,
      message: "Transaction voided successfully",
    }
  } catch (error: any) {
    logger.error("Transaction void error:", error)

    return {
      success: false,
      message: error.message || "An error occurred while voiding transaction",
    }
  }
}

export async function issueRefund(orderId: string, amount: number, reason: string) {
  try {
    // In a real implementation, this would call the payment gateway to issue a refund
    logger.info(`Issuing refund for order ${orderId}: ${amount} - ${reason}`)

    const refundResult = await PaymentService.processRefund({
      transactionId: orderId,
      amount,
      reason,
    })

    // Revalidate POS page
    revalidatePath("/dashboard/pos")

    return {
      success: refundResult.success,
      refundId: refundResult.refundId,
      message: refundResult.message,
    }
  } catch (error: any) {
    logger.error("Refund error:", error)

    return {
      success: false,
      message: error.message || "An error occurred while processing refund",
    }
  }
}

