// This is a schema definition for a database
// In a real application, you would use a proper ORM like Prisma

export interface User {
  id: string
  name: string
  email: string
  password?: string // Hashed password
  role: "admin" | "manager" | "cashier" | "staff" | "kitchen" | "waiter" | "housekeeping" | "maintenance"
  businessId: string
  locationId?: string
  subscriptionId?: string
  subscriptionStatus?: "active" | "trialing" | "past_due" | "canceled"
  lastLoginAt?: Date
  preferences?: {
    language?: string
    theme?: string
    notifications?: boolean
  }
  permissions?: string[] // Array of permission keys
  mfaEnabled?: boolean
  mfaMethod?: "app" | "sms" | "email"
  createdAt: Date
  updatedAt: Date
}

export interface Business {
  id: string
  name: string
  type: "retail" | "restaurant" | "hotel" | "grocery" | "salon" | "general"
  address: string
  phone: string
  email: string
  logo?: string
  currency: string
  taxRate: number
  timeZone: string
  ownerId: string
  subscriptionTier?: "free" | "starter" | "professional" | "enterprise"
  settings?: {
    languages: string[]
    defaultLanguage: string
    enableOfflineMode: boolean
    enableLoyaltyProgram: boolean
    enableDigitalReceipts: boolean
    enableAIRecommendations: boolean
    receiptFooter?: string
    receiptHeader?: string
    invoicePrefix?: string
    orderNumberPrefix?: string
  }
  locations?: Location[]
  createdAt: Date
  updatedAt: Date
}

export interface Location {
  id: string
  name: string
  address: string
  phone?: string
  email?: string
  businessId: string
  isMainLocation: boolean
  settings?: {
    taxRate?: number
    currency?: string
    timeZone?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  cost?: number
  sku: string
  barcode?: string
  qrCode?: string
  categoryId: string
  businessId: string
  locationId?: string
  stock: number
  lowStockThreshold?: number
  image?: string
  isActive: boolean
  type: "standard" | "variable" | "digital" | "service" | "weighted"
  unit?: "each" | "kg" | "g" | "lb" | "oz" | "l" | "ml"
  attributes?: ProductAttribute[]
  variants?: ProductVariant[]
  taxRate?: number
  taxExempt?: boolean
  tags?: string[]
  supplierIds?: string[]
  expiryDate?: Date
  batchNumber?: string
  createdAt: Date
  updatedAt: Date
}

export interface ProductAttribute {
  id: string
  name: string
  values: string[]
  productId: string
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  barcode?: string
  price: number
  cost?: number
  stock: number
  attributes: { [key: string]: string }
  image?: string
}

export interface Category {
  id: string
  name: string
  description?: string
  businessId: string
  parentId?: string
  image?: string
  isActive: boolean
  sortOrder?: number
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  orderNumber: string
  customerId?: string
  userId: string
  businessId: string
  locationId?: string
  status: "pending" | "processing" | "completed" | "cancelled" | "refunded" | "partially_refunded"
  paymentStatus: "pending" | "paid" | "partially_paid" | "refunded" | "failed"
  paymentMethod:
    | "cash"
    | "credit_card"
    | "debit_card"
    | "mobile_payment"
    | "cryptocurrency"
    | "gift_card"
    | "store_credit"
    | "split"
  subtotal: number
  tax: number
  discount: number
  total: number
  notes?: string
  source: "pos" | "online" | "mobile" | "kiosk" | "phone"
  deliveryMethod?: "pickup" | "delivery" | "dine_in" | "takeaway"
  deliveryStatus?: "pending" | "preparing" | "out_for_delivery" | "delivered"
  deliveryAddress?: string
  deliveryFee?: number
  tableNumber?: string
  guestCount?: number
  splitPayments?: SplitPayment[]
  refunds?: Refund[]
  createdAt: Date
  updatedAt: Date
}

export interface SplitPayment {
  id: string
  orderId: string
  amount: number
  paymentMethod: string
  status: "pending" | "completed" | "failed"
  reference?: string
}

export interface Refund {
  id: string
  orderId: string
  amount: number
  reason: string
  status: "pending" | "completed" | "failed"
  processedBy: string
  processedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  variantId?: string
  name: string
  quantity: number
  price: number
  cost?: number
  discount: number
  tax: number
  total: number
  notes?: string
  modifiers?: OrderItemModifier[]
  status?: "pending" | "preparing" | "ready" | "delivered" | "cancelled"
  refunded?: boolean
  refundedQuantity?: number
  createdAt: Date
  updatedAt: Date
}

export interface OrderItemModifier {
  id: string
  orderItemId: string
  modifierId: string
  name: string
  price: number
  quantity: number
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  businessId: string
  loyaltyPoints?: number
  loyaltyTier?: string
  totalSpent?: number
  lastPurchase?: Date
  birthdate?: Date
  notes?: string
  tags?: string[]
  marketingConsent?: boolean
  paymentMethods?: CustomerPaymentMethod[]
  createdAt: Date
  updatedAt: Date
}

export interface CustomerPaymentMethod {
  id: string
  customerId: string
  type: "credit_card" | "debit_card" | "bank_account" | "digital_wallet"
  lastFour: string
  expiryDate?: string
  isDefault: boolean
  token?: string
}

export interface Transaction {
  id: string
  orderId: string
  amount: number
  paymentMethod:
    | "cash"
    | "credit_card"
    | "debit_card"
    | "mobile_payment"
    | "cryptocurrency"
    | "gift_card"
    | "store_credit"
  status: "pending" | "completed" | "failed" | "refunded" | "partially_refunded"
  reference?: string
  businessId: string
  locationId?: string
  processorFee?: number
  gatewayResponse?: string
  refundedAmount?: number
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  businessId: string
  planId: string
  status: "active" | "trialing" | "past_due" | "canceled"
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  customerId?: string
  paymentMethodId?: string
  createdAt: Date
  updatedAt: Date
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: "month" | "year"
  features: string[]
  limits: {
    users: number
    products: number
    transactions: number
    locations: number
  }
  transactionFeePercent: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  userId: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface Supplier {
  id: string
  name: string
  contactName?: string
  email?: string
  phone?: string
  address?: string
  businessId: string
  paymentTerms?: string
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  businessId: string
  locationId?: string
  status: "draft" | "sent" | "received" | "cancelled" | "partially_received"
  expectedDeliveryDate?: Date
  receivedDate?: Date
  subtotal: number
  tax: number
  total: number
  notes?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface PurchaseOrderItem {
  id: string
  purchaseOrderId: string
  productId: string
  quantity: number
  receivedQuantity: number
  price: number
  total: number
}

export interface Inventory {
  id: string
  productId: string
  locationId: string
  quantity: number
  reservedQuantity?: number
  reorderPoint?: number
  reorderQuantity?: number
  lastStockCheck?: Date
  createdAt: Date
  updatedAt: Date
}

export interface InventoryTransaction {
  id: string
  productId: string
  locationId: string
  quantity: number
  type: "purchase" | "sale" | "return" | "adjustment" | "transfer"
  referenceId?: string
  referenceType?: "order" | "purchase_order" | "stock_adjustment" | "transfer"
  notes?: string
  createdBy: string
  createdAt: Date
}

export interface StockTransfer {
  id: string
  referenceNumber: string
  fromLocationId: string
  toLocationId: string
  status: "pending" | "in_transit" | "completed" | "cancelled"
  notes?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface StockTransferItem {
  id: string
  stockTransferId: string
  productId: string
  quantity: number
  receivedQuantity?: number
}

// Restaurant-specific interfaces
export interface Table {
  id: string
  number: string
  name?: string
  capacity: number
  status: "available" | "occupied" | "reserved" | "maintenance"
  locationId: string
  businessId: string
  floorPlanX?: number
  floorPlanY?: number
  shape?: "circle" | "square" | "rectangle"
  width?: number
  height?: number
  createdAt: Date
  updatedAt: Date
}

export interface Reservation {
  id: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  partySize: number
  reservationDate: Date
  duration: number // in minutes
  status: "confirmed" | "seated" | "completed" | "cancelled" | "no_show"
  tableId?: string
  notes?: string
  businessId: string
  locationId: string
  createdAt: Date
  updatedAt: Date
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  cost?: number
  categoryId: string
  businessId: string
  image?: string
  preparationTime?: number // in minutes
  calories?: number
  allergens?: string[]
  dietary?: string[] // vegan, vegetarian, gluten-free, etc.
  isAvailable: boolean
  modifierGroups?: string[] // IDs of modifier groups
  createdAt: Date
  updatedAt: Date
}

export interface ModifierGroup {
  id: string
  name: string
  businessId: string
  required: boolean
  multiSelect: boolean
  minSelections?: number
  maxSelections?: number
  modifiers: Modifier[]
  createdAt: Date
  updatedAt: Date
}

export interface Modifier {
  id: string
  name: string
  price: number
  modifierGroupId: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Recipe {
  id: string
  menuItemId: string
  businessId: string
  ingredients: RecipeIngredient[]
  instructions?: string
  preparationTime?: number
  cookingTime?: number
  yield?: number
  createdAt: Date
  updatedAt: Date
}

export interface RecipeIngredient {
  id: string
  recipeId: string
  ingredientId: string
  quantity: number
  unit: string
}

export interface Ingredient {
  id: string
  name: string
  description?: string
  cost: number
  unit: string
  stock: number
  lowStockThreshold?: number
  businessId: string
  supplierId?: string
  createdAt: Date
  updatedAt: Date
}

// Hotel-specific interfaces
export interface Room {
  id: string
  number: string
  type: string
  capacity: number
  rate: number
  status: "available" | "occupied" | "maintenance" | "cleaning"
  businessId: string
  locationId: string
  amenities?: string[]
  floor?: number
  description?: string
  images?: string[]
  lastCleaned?: Date
  createdAt: Date
  updatedAt: Date
}

export interface RoomType {
  id: string
  name: string
  description?: string
  baseRate: number
  capacity: number
  businessId: string
  amenities?: string[]
  images?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface RoomBooking {
  id: string
  roomId: string
  customerId?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  checkInDate: Date
  checkOutDate: Date
  adults: number
  children: number
  status: "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show"
  totalAmount: number
  paidAmount: number
  notes?: string
  businessId: string
  locationId: string
  createdAt: Date
  updatedAt: Date
}

export interface HotelService {
  id: string
  name: string
  description?: string
  price: number
  category: "room_service" | "spa" | "laundry" | "transport" | "other"
  businessId: string
  locationId: string
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ServiceBooking {
  id: string
  serviceId: string
  roomBookingId?: string
  customerId?: string
  customerName: string
  scheduledDate: Date
  duration?: number
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  price: number
  notes?: string
  businessId: string
  locationId: string
  createdAt: Date
  updatedAt: Date
}

// Retail-specific interfaces
export interface GiftCard {
  id: string
  code: string
  initialValue: number
  currentValue: number
  expiryDate?: Date
  isActive: boolean
  customerId?: string
  businessId: string
  locationId?: string
  createdAt: Date
  updatedAt: Date
}

export interface LoyaltyProgram {
  id: string
  name: string
  description?: string
  pointsPerCurrency: number
  minimumPointsRedemption: number
  pointValueInCurrency: number
  tiers?: LoyaltyTier[]
  businessId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface LoyaltyTier {
  id: string
  name: string
  loyaltyProgramId: string
  minimumPoints: number
  benefits: string[]
  multiplier: number
  createdAt: Date
  updatedAt: Date
}

export interface LoyaltyTransaction {
  id: string
  customerId: string
  orderId?: string
  points: number
  type: "earn" | "redeem" | "expire" | "adjust"
  description?: string
  businessId: string
  locationId?: string
  createdAt: Date
}

export interface Promotion {
  id: string
  name: string
  description?: string
  type: "percentage" | "fixed_amount" | "buy_x_get_y" | "bundle"
  value: number
  minimumPurchase?: number
  startDate: Date
  endDate: Date
  applicableProducts?: string[] // Product IDs
  applicableCategories?: string[] // Category IDs
  couponCode?: string
  usageLimit?: number
  usageCount: number
  businessId: string
  locationId?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Grocery-specific interfaces
export interface WeightedProduct extends Product {
  pricePerUnit: number
  unit: "kg" | "g" | "lb" | "oz"
}

export interface ProductBatch {
  id: string
  productId: string
  batchNumber: string
  expiryDate: Date
  quantity: number
  cost: number
  locationId: string
  receivedDate: Date
  createdAt: Date
  updatedAt: Date
}

// AI and Analytics interfaces
export interface SalesForecasting {
  id: string
  businessId: string
  locationId?: string
  productId?: string
  categoryId?: string
  forecastDate: Date
  predictedSales: number
  confidenceLevel: number
  factors: string[]
  createdAt: Date
}

export interface CustomerRecommendation {
  id: string
  customerId: string
  productId: string
  score: number
  reason: string
  businessId: string
  createdAt: Date
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string
  details: string
  ipAddress?: string
  userAgent?: string
  businessId: string
  createdAt: Date
}

export interface SystemSettings {
  id: string
  businessId: string
  theme: "light" | "dark" | "system"
  language: string
  autoLogoutMinutes: number
  enableOfflineMode: boolean
  enableInventoryAlerts: boolean
  enableCustomerLoyalty: boolean
  enableEmailReceipts: boolean
  enableSMSNotifications: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Integration {
  id: string
  businessId: string
  type: "payment" | "accounting" | "ecommerce" | "delivery" | "marketing" | "other"
  provider: string
  isActive: boolean
  config: Record<string, any>
  lastSyncAt?: Date
  createdAt: Date
  updatedAt: Date
}

