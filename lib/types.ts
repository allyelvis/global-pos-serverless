// Base entity interface
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// User entity
export interface User extends BaseEntity {
  name: string
  email: string
  password: string
  role: "admin" | "manager" | "cashier"
  businessId: string
  image?: string
  subscriptionId?: string
  customerId?: string
}

// OAuth Account entity
export interface OAuthAccount extends BaseEntity {
  userId: string
  provider: string
  providerAccountId: string
  providerData: Record<string, any>
}

// Business entity
export interface Business extends BaseEntity {
  name: string
  type: "retail" | "restaurant" | "salon" | "hotel" | "grocery"
  address: string
  phone: string
  email: string
  logo?: string
  currency: string
  taxRate: number
  timeZone: string
  subscriptionId?: string
  subscriptionStatus?: "active" | "trialing" | "past_due" | "canceled" | "incomplete"
  subscriptionPeriodEnd?: string
}

// Subscription Plan entity
export interface SubscriptionPlan extends BaseEntity {
  name: string
  description: string
  price: number
  interval: "month" | "year"
  currency: string
  features: string[]
  isActive: boolean
  stripePriceId?: string
  limits: {
    users: number
    products: number
    transactions: number
    locations: number
    customFields: boolean
    apiAccess: boolean
    whiteLabel: boolean
    prioritySupport: boolean
  }
}

// Subscription entity
export interface Subscription extends BaseEntity {
  businessId: string
  planId: string
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete"
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId?: string
  stripeCustomerId?: string
}

// Product entity
export interface Product extends BaseEntity {
  name: string
  description?: string
  price: number
  cost?: number
  sku: string
  barcode?: string
  categoryId: string
  businessId?: string
  stock: number
  lowStockThreshold?: number
  image?: string
  isActive: boolean
}

// Category entity
export interface Category extends BaseEntity {
  name: string
  description?: string
  businessId: string
}

// Order entity
export interface Order extends BaseEntity {
  orderNumber: string
  customerId?: string
  userId: string
  businessId: string
  status: "pending" | "completed" | "cancelled" | "refunded"
  paymentMethod: "cash" | "credit_card" | "debit_card" | "mobile_payment"
  subtotal: number
  tax: number
  discount: number
  total: number
  currency: string
  notes?: string
  processingFee?: number
}

// Order item entity
export interface OrderItem extends BaseEntity {
  orderId: string
  productId: string
  quantity: number
  price: number
  discount: number
  total: number
}

// Customer entity
export interface Customer extends BaseEntity {
  name: string
  email?: string
  phone?: string
  address?: string
  businessId: string
  joinDate: string
  totalSpent: number
  lastPurchase: string
  loyaltyPoints: number
  notes?: string
}

// Transaction entity
export interface Transaction extends BaseEntity {
  orderId: string
  amount: number
  paymentMethod: "cash" | "credit_card" | "debit_card" | "mobile_payment"
  status: "pending" | "completed" | "failed" | "refunded"
  reference?: string
  businessId: string
  currency: string
  processingFee?: number
}

// Session entity
export interface Session {
  id: string
  userId: string
  createdAt: string
  expiresAt: string
}

// Business Settings
export interface BusinessSettings {
  id: string
  businessId: string
  currency: string
  taxRate: number
  timeZone: string
  enableInventoryAlerts: boolean
  enableCustomerLoyalty: boolean
  enableEmailReceipts: boolean
  enableSMSNotifications: boolean
  receiptFooter: string
  createdAt: string
  updatedAt: string
}

// Invoice entity
export interface Invoice extends BaseEntity {
  businessId: string
  subscriptionId: string
  amount: number
  currency: string
  status: "draft" | "open" | "paid" | "uncollectible" | "void"
  dueDate: string
  paidDate?: string
  stripeInvoiceId?: string
  items: InvoiceItem[]
}

// Invoice Item entity
export interface InvoiceItem {
  description: string
  amount: number
  quantity: number
}

// Add-on entity
export interface Addon extends BaseEntity {
  name: string
  description: string
  price: number
  interval: "month" | "year" | "one_time"
  currency: string
  isActive: boolean
  category: "integration" | "feature" | "service"
  stripePriceId?: string
}

// Business Add-on entity
export interface BusinessAddon extends BaseEntity {
  businessId: string
  addonId: string
  status: "active" | "canceled"
  currentPeriodEnd?: string
}

