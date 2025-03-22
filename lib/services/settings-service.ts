"use server"

import { getRedisClient } from "../db/redis-client"
import type { GlobalPOSSettings } from "../types/settings"
import { getCurrentUser } from "../db/users"
import { getBusinessById } from "../db/business"

// Settings key prefix in Redis
const SETTINGS_KEY_PREFIX = "settings:"

// Get settings for a business
export async function getBusinessSettings(businessId: string): Promise<GlobalPOSSettings | null> {
  try {
    const redis = getRedisClient()
    const settingsKey = `${SETTINGS_KEY_PREFIX}${businessId}`

    const settingsJson = await redis.get(settingsKey)
    if (!settingsJson) {
      return null
    }

    return JSON.parse(settingsJson) as GlobalPOSSettings
  } catch (error) {
    console.error("Failed to get business settings:", error)
    return null
  }
}

// Save settings for a business
export async function saveBusinessSettings(businessId: string, settings: GlobalPOSSettings): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const settingsKey = `${SETTINGS_KEY_PREFIX}${businessId}`

    await redis.set(settingsKey, JSON.stringify(settings))
    return true
  } catch (error) {
    console.error("Failed to save business settings:", error)
    return false
  }
}

// Get settings for the current user's business
export async function getCurrentBusinessSettings(): Promise<GlobalPOSSettings | null> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return null
    }

    return getBusinessSettings(user.businessId)
  } catch (error) {
    console.error("Failed to get current business settings:", error)
    return null
  }
}

// Initialize default settings for a business
export async function initializeDefaultSettings(businessId: string): Promise<GlobalPOSSettings | null> {
  try {
    const business = await getBusinessById(businessId)
    if (!business) {
      throw new Error("Business not found")
    }

    // Create default settings based on business type
    const defaultSettings: GlobalPOSSettings = {
      general: {
        businessProfile: {
          name: business.name,
          address: business.address,
          logo: "",
          contactDetails: {
            phone: business.phone,
            email: business.email,
            website: "",
          },
        },
        industryType: business.type as any,
        locations: [
          {
            id: "main",
            name: "Main Location",
            address: business.address,
            isMainLocation: true,
            timeZone: business.timeZone,
            operatingHours: {
              monday: { open: "09:00", close: "18:00" },
              tuesday: { open: "09:00", close: "18:00" },
              wednesday: { open: "09:00", close: "18:00" },
              thursday: { open: "09:00", close: "18:00" },
              friday: { open: "09:00", close: "18:00" },
              saturday: { open: "10:00", close: "16:00" },
              sunday: { open: "00:00", close: "00:00" },
            },
          },
        ],
        timeZone: business.timeZone,
        operatingHours: {
          monday: { open: "09:00", close: "18:00" },
          tuesday: { open: "09:00", close: "18:00" },
          wednesday: { open: "09:00", close: "18:00" },
          thursday: { open: "09:00", close: "18:00" },
          friday: { open: "09:00", close: "18:00" },
          saturday: { open: "10:00", close: "16:00" },
          sunday: { open: "00:00", close: "00:00" },
        },
        language: "en",
        localization: {
          dateFormat: "MM/DD/YYYY",
          timeFormat: "12h",
          numberFormat: "1,234.56",
          firstDayOfWeek: "sunday",
        },
        currency: {
          code: business.currency,
          symbol: getCurrencySymbol(business.currency),
          position: "before",
          decimalPlaces: 2,
        },
        tax: {
          enabled: true,
          defaultRate: business.taxRate,
          taxInclusive: false,
          additionalTaxes: [],
        },
        dataBackup: {
          frequency: "daily",
          time: "02:00",
          retentionPeriod: 30,
          cloudSync: true,
        },
        systemUpdates: {
          autoUpdate: true,
          updateTime: "03:00",
          notifyBeforeUpdate: true,
        },
      },
      posTerminal: getDefaultPOSTerminalSettings(),
      payment: getDefaultPaymentSettings(),
      inventory: getDefaultInventorySettings(),
      pricing: getDefaultPricingSettings(),
      customer: getDefaultCustomerSettings(),
      employee: getDefaultEmployeeSettings(),
      taxation: getDefaultTaxationSettings(),
      reporting: getDefaultReportingSettings(),
      integration: getDefaultIntegrationSettings(),
      security: getDefaultSecuritySettings(),
    }

    // Add industry-specific settings
    switch (business.type) {
      case "restaurant":
        defaultSettings.restaurant = getDefaultRestaurantSettings()
        break
      case "hotel":
        defaultSettings.hotel = getDefaultHotelSettings()
        break
      case "retail":
      case "grocery":
        defaultSettings.retailGrocery = getDefaultRetailGrocerySettings()
        break
    }

    // Save the default settings
    const success = await saveBusinessSettings(businessId, defaultSettings)
    if (!success) {
      throw new Error("Failed to save default settings")
    }

    return defaultSettings
  } catch (error) {
    console.error("Failed to initialize default settings:", error)
    return null
  }
}

// Helper function to get currency symbol
function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CNY: "¥",
    INR: "₹",
    // Add more as needed
  }

  return symbols[currencyCode] || currencyCode
}

// Define settings types
interface POSTerminalSettings {
  touchscreenMode: boolean
  keyboardShortcuts: any
  dashboard: any
  theme: any
  quickAccessButtons: any
  receiptLayout: any
  offlineMode: any
  peripherals: any
  multiScreen: any
}

interface PaymentSettings {
  methods: any
  splitPayments: any
  partialPayments: any
  tipManagement: any
  serviceCharges: any
  rounding: any
  paymentGateways: any
  qrCodePayments: any
  refundPolicy: any
}

interface InventorySettings {
  stockAlerts: any
  reorderRules: any
  batchTracking: any
  barcodeManagement: any
  supplierManagement: any
  productCategories: any
  multiLocation: any
  stockAdjustments: any
}

interface PricingSettings {
  dynamicPricing: any
  priceTiers: any
  bulkDiscounts: any
  customDiscounts: any
  loyaltyPoints: any
  coupons: any
  promotions: any
}

interface CustomerSettings {
  profiles: any
  loyalty: any
  customerGroups: any
  feedback: any
  marketing: any
  giftCards: any
}

interface EmployeeSettings {
  roles: any
  scheduling: any
  performance: any
  security: any
  session: any
}

interface RestaurantSettings {
  tableManagement: any
  kitchenDisplay: any
  menu: any
  onlineOrdering: any
  orderModifiers: any
  happyHour: any
}

interface HotelSettings {
  rooms: any
  ratePlans: any
  checkInOut: any
  billing: any
  housekeeping: any
  bookings: any
  multiProperty: any
}

interface RetailGrocerySettings {
  selfCheckout: any
  weighingScale: any
  pluCodes: any
  shelfLabels: any
  supplierOrders: any
  stockRotation: any
}

interface TaxationSettings {
  taxConfiguration: any
  taxRates: any
  taxExemptions: any
  regionalTax: any
  invoicing: any
  auditLogs: any
}

interface ReportingSettings {
  dashboard: any
  salesReports: any
  inventoryReports: any
  financialReports: any
  employeeReports: any
  customerReports: any
  exportOptions: any
}

interface IntegrationSettings {
  ecommerce: any
  accounting: any
  crm: any
  delivery: any
  iot: any
}

interface SecuritySettings {
  roleSecurity: any
  twoFactor: any
  auditTrails: any
  dataBackup: any
  accessControl: any
}

// Default settings helpers
function getDefaultPOSTerminalSettings(): POSTerminalSettings {
  return {
    touchscreenMode: true,
    keyboardShortcuts: {
      newSale: "F2",
      payment: "F3",
      cancel: "Escape",
      search: "Ctrl+F",
    },
    dashboard: {
      widgets: [
        { id: "sales-today", type: "sales", position: 1, enabled: true },
        { id: "recent-orders", type: "orders", position: 2, enabled: true },
        { id: "low-stock", type: "inventory", position: 3, enabled: true },
      ],
      layout: "grid",
    },
    theme: {
      mode: "system",
      primaryColor: "#3b82f6",
      accentColor: "#10b981",
    },
    quickAccessButtons: [
      { id: "new-sale", label: "New Sale", action: "newSale", icon: "plus", position: 1 },
      { id: "refund", label: "Refund", action: "refund", icon: "undo", position: 2 },
      { id: "reports", label: "Reports", action: "reports", icon: "chart", position: 3 },
    ],
    receiptLayout: {
      showLogo: true,
      headerText: "Thank you for your purchase!",
      footerText: "Please come again!",
      showBarcode: true,
      showTaxDetails: true,
      fontSize: "medium",
      paperSize: "80mm",
    },
    offlineMode: {
      enabled: true,
      syncFrequency: 5,
      maxOfflinePeriod: 24,
    },
    peripherals: {
      printers: [
        {
          id: "receipt-printer",
          name: "Receipt Printer",
          type: "receipt",
          connection: "usb",
          defaultPrinter: true,
        },
      ],
      barcodeScanner: {
        enabled: true,
        connectionType: "usb",
      },
      cashDrawer: {
        enabled: true,
        openOnSale: true,
        openOnRefund: true,
        connectionType: "printer",
      },
      weighingScale: {
        enabled: false,
        connectionType: "usb",
        unitOfMeasure: "kg",
      },
      customerDisplay: {
        enabled: false,
        connectionType: "usb",
        showPrices: true,
        showPromotions: true,
      },
    },
    multiScreen: {
      enabled: false,
      screens: [{ id: "main", name: "Main POS", type: "pos" }],
    },
  }
}

function getDefaultPaymentSettings(): PaymentSettings {
  return {
    methods: {
      cash: {
        enabled: true,
        allowChangeCalculation: true,
        denominations: [1, 5, 10, 20, 50, 100],
      },
      card: {
        enabled: true,
        acceptedTypes: ["visa", "mastercard", "amex", "discover"],
        requireSignature: true,
        signatureThreshold: 25,
      },
      digitalWallets: {
        enabled: true,
        acceptedWallets: ["apple", "google", "samsung", "paypal"],
      },
      cryptocurrency: {
        enabled: false,
        acceptedCoins: ["bitcoin", "ethereum"],
      },
      storeCredit: {
        enabled: true,
        expiryPeriod: 365,
      },
      giftCard: {
        enabled: true,
        allowPartialRedemption: true,
        expiryPeriod: 365,
      },
    },
    splitPayments: {
      enabled: true,
      maxSplits: 4,
    },
    partialPayments: {
      enabled: true,
      minimumAmount: 5,
    },
    tipManagement: {
      enabled: true,
      suggestedPercentages: [10, 15, 20],
      allowCustomTip: true,
      tipPooling: false,
    },
    serviceCharges: {
      enabled: false,
      defaultRate: 10,
      applyToTakeout: false,
    },
    rounding: {
      enabled: true,
      rule: "nearest",
      precision: 0.05,
    },
    paymentGateways: {
      stripe: {
        enabled: true,
        testMode: true,
        supportedMethods: ["card", "apple_pay", "google_pay"],
      },
      paypal: {
        enabled: true,
        testMode: true,
        supportedMethods: ["paypal"],
      },
    },
    qrCodePayments: {
      enabled: true,
      generateAutomatically: true,
      displayOnReceipt: true,
    },
    refundPolicy: {
      allowRefunds: true,
      refundPeriod: 30,
      requireApproval: true,
      allowPartialRefunds: true,
      refundToOriginalMethod: true,
    },
  }
}

function getDefaultInventorySettings(): InventorySettings {
  return {
    stockAlerts: {
      enabled: true,
      lowStockThreshold: 10,
      notificationMethods: ["email", "dashboard"],
      recipients: [],
    },
    reorderRules: {
      autoReorder: false,
      reorderPoint: 5,
      reorderQuantity: 20,
      preferredSuppliers: [],
    },
    batchTracking: {
      enabled: false,
      enforceExpiry: false,
      expiryNotificationDays: 7,
    },
    barcodeManagement: {
      format: "ean13",
      generateAutomatically: true,
      printLabels: true,
    },
    supplierManagement: {
      requirePurchaseOrders: true,
      autoGeneratePO: false,
      approvalRequired: true,
    },
    productCategories: {
      maxDepth: 3,
      attributesEnabled: true,
    },
    multiLocation: {
      enabled: false,
      allowTransfers: true,
      requireApproval: true,
    },
    stockAdjustments: {
      requireReason: true,
      approvalRequired: true,
      allowNegativeStock: false,
    },
  }
}

function getDefaultPricingSettings(): PricingSettings {
  return {
    dynamicPricing: {
      enabled: false,
      rules: [],
    },
    priceTiers: {
      enabled: false,
      tiers: [],
    },
    bulkDiscounts: {
      enabled: true,
      thresholds: [
        { quantity: 10, discount: 5 },
        { quantity: 20, discount: 10 },
        { quantity: 50, discount: 15 },
      ],
    },
    customDiscounts: {
      enabled: true,
      maxDiscount: 20,
      requireApproval: true,
      approvalThreshold: 10,
    },
    loyaltyPoints: {
      enabled: true,
      pointsPerCurrency: 1,
      redemptionValue: 0.01,
      minimumPointsRedemption: 100,
    },
    coupons: {
      enabled: true,
      allowMultiple: false,
      stackable: false,
    },
    promotions: {
      enabled: true,
      scheduledPromotions: true,
      limitPerCustomer: true,
    },
  }
}

function getDefaultCustomerSettings(): CustomerSettings {
  return {
    profiles: {
      requiredFields: ["name", "email"],
      optionalFields: ["phone", "address", "birthdate"],
      gdprCompliance: true,
      dataRetentionPeriod: 730, // 2 years
    },
    loyalty: {
      enabled: true,
      programName: "Rewards Program",
      pointsExpiry: 365, // 1 year
      tiers: [
        {
          id: "bronze",
          name: "Bronze",
          minimumPoints: 0,
          benefits: ["Basic rewards"],
          multiplier: 1,
        },
        {
          id: "silver",
          name: "Silver",
          minimumPoints: 1000,
          benefits: ["5% discount", "Free shipping"],
          multiplier: 1.25,
        },
        {
          id: "gold",
          name: "Gold",
          minimumPoints: 5000,
          benefits: ["10% discount", "Free shipping", "Priority support"],
          multiplier: 1.5,
        },
      ],
    },
    customerGroups: {
      enabled: true,
      defaultGroup: "retail",
      groups: [
        {
          id: "retail",
          name: "Retail",
          discountRate: 0,
          specialPricing: false,
        },
        {
          id: "wholesale",
          name: "Wholesale",
          discountRate: 15,
          specialPricing: true,
        },
        {
          id: "vip",
          name: "VIP",
          discountRate: 10,
          specialPricing: false,
        },
      ],
    },
    feedback: {
      enabled: true,
      requestAfterPurchase: true,
      incentivizeReviews: true,
      incentiveAmount: 5,
    },
    marketing: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: false,
      defaultOptIn: false,
      frequencyCap: 7, // days
    },
    giftCards: {
      enabled: true,
      expiryPeriod: 365, // 1 year
      minimumAmount: 10,
      maximumAmount: 500,
      allowRecharge: true,
    },
  }
}

function getDefaultEmployeeSettings(): EmployeeSettings {
  return {
    roles: [
      {
        id: "admin",
        name: "Administrator",
        permissions: ["*"],
        description: "Full access to all system features",
      },
      {
        id: "manager",
        name: "Manager",
        permissions: [
          "dashboard.view",
          "pos.access",
          "products.manage",
          "orders.manage",
          "customers.manage",
          "reports.view",
        ],
        description: "Manage daily operations and staff",
      },
      {
        id: "cashier",
        name: "Cashier",
        permissions: ["pos.access", "orders.create", "orders.view"],
        description: "Process sales and handle customer transactions",
      },
      {
        id: "staff",
        name: "Staff",
        permissions: ["pos.access", "orders.view", "customers.view"],
        description: "General staff with limited access",
      },
    ],
    scheduling: {
      enabled: true,
      allowSelfScheduling: false,
      requireApproval: true,
      overtimeRules: {
        threshold: 40,
        rate: 1.5,
      },
    },
    performance: {
      trackSales: true,
      commissionStructure: {
        enabled: false,
        defaultRate: 5,
        tieredCommission: [],
      },
    },
    security: {
      cashDrawerRestrictions: true,
      requirePasswordForVoids: true,
      requirePasswordForRefunds: true,
      requirePasswordForDiscounts: true,
    },
    session: {
      autoLogout: 30, // minutes
      forceLogoutOnShiftEnd: true,
      allowMultipleLogins: false,
    },
  }
}

function getDefaultRestaurantSettings(): RestaurantSettings {
  return {
    tableManagement: {
      enabled: true,
      layout: {},
      reservations: true,
      waitlist: true,
      autoAssign: false,
    },
    kitchenDisplay: {
      enabled: true,
      stations: [
        {
          id: "hot",
          name: "Hot Kitchen",
          categories: ["mains", "appetizers"],
        },
        {
          id: "cold",
          name: "Cold Kitchen",
          categories: ["salads", "desserts"],
        },
        {
          id: "bar",
          name: "Bar",
          categories: ["drinks", "cocktails"],
        },
      ],
      colorCoding: {
        new: "#10b981",
        preparing: "#3b82f6",
        ready: "#f59e0b",
        delayed: "#ef4444",
      },
      alertTimes: {
        warning: 10, // minutes
        critical: 15, // minutes
      },
    },
    menu: {
      categories: [
        { id: "appetizers", name: "Appetizers", sortOrder: 1 },
        { id: "mains", name: "Main Courses", sortOrder: 2 },
        { id: "desserts", name: "Desserts", sortOrder: 3 },
        { id: "drinks", name: "Drinks", sortOrder: 4 },
      ],
      modifierGroups: [
        {
          id: "cooking-temp",
          name: "Cooking Temperature",
          required: true,
          multiSelect: false,
          minSelections: 1,
          maxSelections: 1,
        },
        {
          id: "toppings",
          name: "Toppings",
          required: false,
          multiSelect: true,
          minSelections: 0,
          maxSelections: 5,
        },
      ],
      coursing: true,
      specialDiets: ["vegetarian", "vegan", "gluten-free", "dairy-free"],
      allergens: ["nuts", "dairy", "gluten", "shellfish", "soy"],
    },
    onlineOrdering: {
      enabled: true,
      platforms: ["website", "third-party"],
      preparationTimeBuffer: 15, // minutes
      minimumOrderAmount: 15,
    },
    orderModifiers: {
      enabled: true,
      pricingOptions: "fixed",
    },
    happyHour: {
      enabled: true,
      schedule: [
        {
          dayOfWeek: 1, // Monday
          startTime: "16:00",
          endTime: "18:00",
          discounts: [],
        },
        {
          dayOfWeek: 2, // Tuesday
          startTime: "16:00",
          endTime: "18:00",
          discounts: [],
        },
        {
          dayOfWeek: 3, // Wednesday
          startTime: "16:00",
          endTime: "18:00",
          discounts: [],
        },
        {
          dayOfWeek: 4, // Thursday
          startTime: "16:00",
          endTime: "18:00",
          discounts: [],
        },
        {
          dayOfWeek: 5, // Friday
          startTime: "16:00",
          endTime: "18:00",
          discounts: [],
        },
      ],
    },
  }
}

function getDefaultHotelSettings(): HotelSettings {
  return {
    rooms: {
      types: [
        {
          id: "standard",
          name: "Standard Room",
          capacity: 2,
          baseRate: 100,
          description: "Standard room with one queen bed",
        },
        {
          id: "deluxe",
          name: "Deluxe Room",
          capacity: 2,
          baseRate: 150,
          description: "Deluxe room with one king bed",
        },
        {
          id: "suite",
          name: "Suite",
          capacity: 4,
          baseRate: 250,
          description: "Suite with separate living area and bedroom",
        },
      ],
      amenities: ["wifi", "tv", "minibar", "safe", "aircon"],
      maintenanceStatus: ["clean", "dirty", "maintenance", "out-of-order"],
    },
    ratePlans: [
      {
        id: "standard",
        name: "Standard Rate",
        description: "Standard flexible rate",
        adjustmentType: "percentage",
        adjustmentValue: 0,
        restrictions: [],
      },
      {
        id: "advance",
        name: "Advance Purchase",
        description: "Non-refundable rate with 15% discount",
        adjustmentType: "percentage",
        adjustmentValue: -15,
        restrictions: ["non-refundable"],
      },
      {
        id: "weekend",
        name: "Weekend Special",
        description: "Special weekend rate",
        adjustmentType: "percentage",
        adjustmentValue: -10,
        restrictions: ["weekend-only"],
      },
    ],
    checkInOut: {
      standardCheckInTime: "15:00",
      standardCheckOutTime: "11:00",
      earlyCheckInFee: 25,
      lateCheckOutFee: 25,
      allowEarlyCheckIn: true,
      allowLateCheckOut: true,
    },
    billing: {
      integratedBilling: true,
      roomChargeCategories: ["room", "restaurant", "minibar", "spa", "other"],
      autoPostCharges: true,
      cityTax: 5,
    },
    housekeeping: {
      trackStatus: true,
      cleaningSchedule: "daily",
      assignmentMethod: "automatic",
    },
    bookings: {
      cancellationPolicy: {
        freeCancellationHours: 24,
        cancellationFee: 100,
      },
      depositRequired: true,
      depositAmount: 50,
      overbookingAllowed: false,
      overbookingLimit: 0,
    },
    multiProperty: {
      enabled: false,
      centralReservation: false,
      crossPropertyCharges: false,
    },
  }
}

function getDefaultRetailGrocerySettings(): RetailGrocerySettings {
  return {
    selfCheckout: {
      enabled: false,
      requireApproval: true,
      weightVerification: true,
      itemLimit: 15,
    },
    weighingScale: {
      enabled: true,
      tareWeight: 0,
      printLabels: true,
      barcodeFormat: "2CCCCCMMMMMK",
    },
    pluCodes: {
      enabled: true,
      format: "PPPPP",
      autoGenerate: true,
    },
    shelfLabels: {
      enabled: true,
      format: "standard",
      includePricePerUnit: true,
      includeBarcode: true,
    },
    supplierOrders: {
      autoGenerate: false,
      approvalRequired: true,
      orderDays: [1, 3, 5], // Monday, Wednesday, Friday
    },
    stockRotation: {
      method: "FIFO",
      enforceMethod: true,
      expiryAlertDays: 7,
    },
  }
}

function getDefaultTaxationSettings(): TaxationSettings {
  return {
    taxConfiguration: {
      multiTax: true,
      taxInclusive: false,
      roundingMethod: "nearest",
    },
    taxRates: [
      {
        id: "standard",
        name: "Standard Rate",
        rate: 8.5,
        applies: {
          productCategories: ["*"],
          locationIds: ["*"],
          customerGroups: ["*"],
        },
      },
      {
        id: "reduced",
        name: "Reduced Rate",
        rate: 5,
        applies: {
          productCategories: ["food", "books"],
          locationIds: ["*"],
          customerGroups: ["*"],
        },
      },
      {
        id: "zero",
        name: "Zero Rate",
        rate: 0,
        applies: {
          productCategories: ["essential-goods"],
          locationIds: ["*"],
          customerGroups: ["*"],
        },
      },
    ],
    taxExemptions: {
      enabled: true,
      requireDocumentation: true,
      exemptionTypes: ["non-profit", "reseller", "government"],
    },
    regionalTax: {
      enabled: false,
      regions: [],
    },
    invoicing: {
      format: "detailed",
      autoGenerate: true,
      digitalSignature: false,
      complianceText: "Tax ID: 123456789",
    },
    auditLogs: {
      enabled: true,
      retentionPeriod: 84, // 7 years (months)
      detailLevel: "detailed",
    },
  }
}

function getDefaultReportingSettings(): ReportingSettings {
  return {
    dashboard: {
      refreshRate: 5, // minutes
      defaultTimeframe: "today",
      kpis: ["sales", "orders", "average-order", "top-products"],
    },
    salesReports: {
      enabled: true,
      scheduledReports: [
        {
          frequency: "daily",
          recipients: [],
          format: "pdf",
        },
        {
          frequency: "weekly",
          recipients: [],
          format: "excel",
        },
      ],
    },
    inventoryReports: {
      enabled: true,
      includeCost: true,
      includeSupplier: true,
    },
    financialReports: {
      enabled: true,
      includeTaxDetails: true,
      includePaymentBreakdown: true,
    },
    employeeReports: {
      enabled: true,
      trackPerformance: true,
      trackAttendance: true,
    },
    customerReports: {
      enabled: true,
      includePersonalData: false,
      segmentationEnabled: true,
    },
    exportOptions: {
      formats: ["csv", "pdf", "excel"],
      scheduling: true,
      compression: true,
    },
  }
}

function getDefaultIntegrationSettings(): IntegrationSettings {
  return {
    ecommerce: {
      platforms: [
        {
          id: "shopify",
          name: "Shopify",
          enabled: false,
          syncFrequency: 15, // minutes
          syncInventory: true,
          syncOrders: true,
          syncCustomers: true,
        },
        {
          id: "woocommerce",
          name: "WooCommerce",
          enabled: false,
          syncFrequency: 15, // minutes
          syncInventory: true,
          syncOrders: true,
          syncCustomers: true,
        },
      ],
    },
    accounting: {
      software: [
        {
          id: "quickbooks",
          name: "QuickBooks",
          enabled: false,
          syncFrequency: 60, // minutes
          syncSales: true,
          syncPurchases: true,
          syncInventory: true,
        },
        {
          id: "xero",
          name: "Xero",
          enabled: false,
          syncFrequency: 60, // minutes
          syncSales: true,
          syncPurchases: true,
          syncInventory: true,
        },
      ],
    },
    crm: {
      platforms: [
        {
          id: "mailchimp",
          name: "Mailchimp",
          enabled: false,
          syncFrequency: 60, // minutes
          syncCustomers: true,
          syncSales: false,
          syncMarketing: true,
        },
        {
          id: "hubspot",
          name: "HubSpot",
          enabled: false,
          syncFrequency: 60, // minutes
          syncCustomers: true,
          syncSales: true,
          syncMarketing: true,
        },
      ],
    },
    delivery: {
      services: [
        {
          id: "ubereats",
          name: "UberEats",
          enabled: false,
          autoAccept: false,
          preparationTimeBuffer: 15, // minutes
        },
        {
          id: "doordash",
          name: "DoorDash",
          enabled: false,
          autoAccept: false,
          preparationTimeBuffer: 15, // minutes
        },
      ],
    },
    iot: {
      devices: [],
    },
  }
}

function getDefaultSecuritySettings(): SecuritySettings {
  return {
    roleSecurity: {
      enforceStrictRoles: true,
      passwordPolicies: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90,
      },
    },
    twoFactor: {
      enabled: false,
      requiredForRoles: ["admin", "manager"],
      methods: ["app", "email"],
    },
    auditTrails: {
      enabled: true,
      detailLevel: "detailed",
      retentionPeriod: 365, // days
    },
    dataBackup: {
      automatic: true,
      frequency: "daily",
      retentionCount: 30,
      encryptBackups: true,
      offSiteStorage: true,
    },
    accessControl: {
      ipWhitelist: [],
      deviceRegistration: false,
      sessionTimeout: 30, // minutes
      concurrentSessions: false,
      maxConcurrentSessions: 1,
    },
  }
}

