// Settings types for the Global POS System

// General Settings
export interface GeneralSettings {
  businessProfile: {
    name: string
    address: string
    logo?: string
    contactDetails: {
      phone: string
      email: string
      website?: string
    }
  }
  industryType: "retail" | "restaurant" | "grocery" | "hotel" | "salon" | "general"
  locations: {
    id: string
    name: string
    address: string
    isMainLocation: boolean
    timeZone: string
    operatingHours: {
      [day: string]: { open: string; close: string }
    }
  }[]
  timeZone: string
  operatingHours: {
    [day: string]: { open: string; close: string }
  }
  language: string
  localization: {
    dateFormat: string
    timeFormat: string
    numberFormat: string
    firstDayOfWeek: "sunday" | "monday" | "saturday"
  }
  currency: {
    code: string
    symbol: string
    position: "before" | "after"
    decimalPlaces: number
  }
  tax: {
    enabled: boolean
    defaultRate: number
    taxInclusive: boolean
    additionalTaxes: {
      name: string
      rate: number
      appliesTo: string[]
    }[]
  }
  dataBackup: {
    frequency: "daily" | "weekly" | "monthly"
    time: string
    retentionPeriod: number
    cloudSync: boolean
  }
  systemUpdates: {
    autoUpdate: boolean
    updateTime: string
    notifyBeforeUpdate: boolean
  }
}

// POS Terminal & UI Settings
export interface POSTerminalSettings {
  touchscreenMode: boolean
  keyboardShortcuts: {
    [action: string]: string
  }
  dashboard: {
    widgets: {
      id: string
      type: string
      position: number
      enabled: boolean
    }[]
    layout: "grid" | "list" | "compact"
  }
  theme: {
    mode: "light" | "dark" | "system"
    primaryColor: string
    accentColor: string
    customCSS?: string
  }
  quickAccessButtons: {
    id: string
    label: string
    action: string
    icon: string
    position: number
  }[]
  receiptLayout: {
    showLogo: boolean
    headerText?: string
    footerText?: string
    showBarcode: boolean
    showTaxDetails: boolean
    fontSize: "small" | "medium" | "large"
    paperSize: "58mm" | "80mm" | "a4"
  }
  offlineMode: {
    enabled: boolean
    syncFrequency: number
    maxOfflinePeriod: number
  }
  peripherals: {
    printers: {
      id: string
      name: string
      type: "receipt" | "label" | "kitchen"
      connection: "usb" | "network" | "bluetooth"
      address?: string
      defaultPrinter: boolean
    }[]
    barcodeScanner: {
      enabled: boolean
      connectionType: "usb" | "bluetooth" | "keyboard"
      prefix?: string
      suffix?: string
    }
    cashDrawer: {
      enabled: boolean
      openOnSale: boolean
      openOnRefund: boolean
      connectionType: "printer" | "direct" | "network"
    }
    weighingScale: {
      enabled: boolean
      connectionType: "usb" | "serial" | "bluetooth" | "network"
      address?: string
      unitOfMeasure: "kg" | "g" | "lb" | "oz"
    }
    customerDisplay: {
      enabled: boolean
      connectionType: "usb" | "hdmi" | "network"
      showPrices: boolean
      showPromotions: boolean
    }
  }
  multiScreen: {
    enabled: boolean
    screens: {
      id: string
      name: string
      type: "pos" | "kitchen" | "customer" | "manager"
    }[]
  }
}

// Payment Configuration
export interface PaymentSettings {
  methods: {
    cash: {
      enabled: boolean
      allowChangeCalculation: boolean
      denominations: number[]
    }
    card: {
      enabled: boolean
      acceptedTypes: ("visa" | "mastercard" | "amex" | "discover" | "other")[]
      requireSignature: boolean
      signatureThreshold: number
    }
    digitalWallets: {
      enabled: boolean
      acceptedWallets: ("apple" | "google" | "samsung" | "paypal" | "other")[]
    }
    cryptocurrency: {
      enabled: boolean
      acceptedCoins: ("bitcoin" | "ethereum" | "litecoin" | "other")[]
    }
    storeCredit: {
      enabled: boolean
      expiryPeriod: number
    }
    giftCard: {
      enabled: boolean
      allowPartialRedemption: boolean
      expiryPeriod: number
    }
  }
  splitPayments: {
    enabled: boolean
    maxSplits: number
  }
  partialPayments: {
    enabled: boolean
    minimumAmount: number
  }
  tipManagement: {
    enabled: boolean
    suggestedPercentages: number[]
    allowCustomTip: boolean
    tipPooling: boolean
  }
  serviceCharges: {
    enabled: boolean
    defaultRate: number
    applyToTakeout: boolean
  }
  rounding: {
    enabled: boolean
    rule: "nearest" | "up" | "down"
    precision: number
  }
  paymentGateways: {
    [provider: string]: {
      enabled: boolean
      apiKey?: string
      secretKey?: string
      testMode: boolean
      supportedMethods: string[]
    }
  }
  qrCodePayments: {
    enabled: boolean
    generateAutomatically: boolean
    displayOnReceipt: boolean
  }
  refundPolicy: {
    allowRefunds: boolean
    refundPeriod: number
    requireApproval: boolean
    allowPartialRefunds: boolean
    refundToOriginalMethod: boolean
  }
}

// Inventory & Stock Management
export interface InventorySettings {
  stockAlerts: {
    enabled: boolean
    lowStockThreshold: number
    notificationMethods: ("email" | "sms" | "app" | "dashboard")[]
    recipients: string[]
  }
  reorderRules: {
    autoReorder: boolean
    reorderPoint: number
    reorderQuantity: number
    preferredSuppliers: string[]
  }
  batchTracking: {
    enabled: boolean
    enforceExpiry: boolean
    expiryNotificationDays: number
  }
  barcodeManagement: {
    format: "ean13" | "upc" | "code128" | "qr" | "custom"
    prefix?: string
    generateAutomatically: boolean
    printLabels: boolean
  }
  supplierManagement: {
    requirePurchaseOrders: boolean
    autoGeneratePO: boolean
    approvalRequired: boolean
  }
  productCategories: {
    maxDepth: number
    attributesEnabled: boolean
  }
  multiLocation: {
    enabled: boolean
    allowTransfers: boolean
    requireApproval: boolean
  }
  stockAdjustments: {
    requireReason: boolean
    approvalRequired: boolean
    allowNegativeStock: boolean
  }
}

// Pricing, Discounts & Promotions
export interface PricingSettings {
  dynamicPricing: {
    enabled: boolean
    rules: {
      id: string
      name: string
      conditions: any[]
      adjustment: {
        type: "percentage" | "fixed"
        value: number
      }
    }[]
  }
  priceTiers: {
    enabled: boolean
    tiers: {
      id: string
      name: string
      minimumQuantity: number
      adjustment: {
        type: "percentage" | "fixed"
        value: number
      }
    }[]
  }
  bulkDiscounts: {
    enabled: boolean
    thresholds: {
      quantity: number
      discount: number
    }[]
  }
  customDiscounts: {
    enabled: boolean
    maxDiscount: number
    requireApproval: boolean
    approvalThreshold: number
  }
  loyaltyPoints: {
    enabled: boolean
    pointsPerCurrency: number
    redemptionValue: number
    minimumPointsRedemption: number
  }
  coupons: {
    enabled: boolean
    allowMultiple: boolean
    stackable: boolean
  }
  promotions: {
    enabled: boolean
    scheduledPromotions: boolean
    limitPerCustomer: boolean
  }
}

// Customer Management & Loyalty
export interface CustomerSettings {
  profiles: {
    requiredFields: string[]
    optionalFields: string[]
    gdprCompliance: boolean
    dataRetentionPeriod: number
  }
  loyalty: {
    enabled: boolean
    programName: string
    pointsExpiry: number
    tiers: {
      id: string
      name: string
      minimumPoints: number
      benefits: string[]
      multiplier: number
    }[]
  }
  customerGroups: {
    enabled: boolean
    defaultGroup: string
    groups: {
      id: string
      name: string
      discountRate: number
      specialPricing: boolean
    }[]
  }
  feedback: {
    enabled: boolean
    requestAfterPurchase: boolean
    incentivizeReviews: boolean
    incentiveAmount: number
  }
  marketing: {
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
    defaultOptIn: boolean
    frequencyCap: number
  }
  giftCards: {
    enabled: boolean
    expiryPeriod: number
    minimumAmount: number
    maximumAmount: number
    allowRecharge: boolean
  }
}

// Employee & User Role Management
export interface EmployeeSettings {
  roles: {
    id: string
    name: string
    permissions: string[]
    description: string
  }[]
  scheduling: {
    enabled: boolean
    allowSelfScheduling: boolean
    requireApproval: boolean
    overtimeRules: {
      threshold: number
      rate: number
    }
  }
  performance: {
    trackSales: boolean
    commissionStructure: {
      enabled: boolean
      defaultRate: number
      tieredCommission: {
        threshold: number
        rate: number
      }[]
    }
  }
  security: {
    cashDrawerRestrictions: boolean
    requirePasswordForVoids: boolean
    requirePasswordForRefunds: boolean
    requirePasswordForDiscounts: boolean
  }
  session: {
    autoLogout: number
    forceLogoutOnShiftEnd: boolean
    allowMultipleLogins: boolean
  }
}

// Restaurant-Specific Settings
export interface RestaurantSettings {
  tableManagement: {
    enabled: boolean
    layout: any
    reservations: boolean
    waitlist: boolean
    autoAssign: boolean
  }
  kitchenDisplay: {
    enabled: boolean
    stations: {
      id: string
      name: string
      categories: string[]
    }[]
    colorCoding: {
      new: string
      preparing: string
      ready: string
      delayed: string
    }
    alertTimes: {
      warning: number
      critical: number
    }
  }
  menu: {
    categories: {
      id: string
      name: string
      sortOrder: number
    }[]
    modifierGroups: {
      id: string
      name: string
      required: boolean
      multiSelect: boolean
      minSelections: number
      maxSelections: number
    }[]
    coursing: boolean
    specialDiets: string[]
    allergens: string[]
  }
  onlineOrdering: {
    enabled: boolean
    platforms: string[]
    preparationTimeBuffer: number
    minimumOrderAmount: number
  }
  orderModifiers: {
    enabled: boolean
    pricingOptions: "free" | "fixed" | "percentage"
  }
  happyHour: {
    enabled: boolean
    schedule: {
      dayOfWeek: number
      startTime: string
      endTime: string
      discounts: any[]
    }[]
  }
}

// Hotel PMS & Hospitality Settings
export interface HotelSettings {
  rooms: {
    types: {
      id: string
      name: string
      capacity: number
      baseRate: number
      description: string
    }[]
    amenities: string[]
    maintenanceStatus: string[]
  }
  ratePlans: {
    id: string
    name: string
    description: string
    adjustmentType: "percentage" | "fixed"
    adjustmentValue: number
    restrictions: any[]
  }[]
  checkInOut: {
    standardCheckInTime: string
    standardCheckOutTime: string
    earlyCheckInFee: number
    lateCheckOutFee: number
    allowEarlyCheckIn: boolean
    allowLateCheckOut: boolean
  }
  billing: {
    integratedBilling: boolean
    roomChargeCategories: string[]
    autoPostCharges: boolean
    cityTax: number
  }
  housekeeping: {
    trackStatus: boolean
    cleaningSchedule: "daily" | "on_checkout" | "custom"
    assignmentMethod: "automatic" | "manual"
  }
  bookings: {
    cancellationPolicy: {
      freeCancellationHours: number
      cancellationFee: number
    }
    depositRequired: boolean
    depositAmount: number
    overbookingAllowed: boolean
    overbookingLimit: number
  }
  multiProperty: {
    enabled: boolean
    centralReservation: boolean
    crossPropertyCharges: boolean
  }
}

// Retail & Grocery-Specific Settings
export interface RetailGrocerySettings {
  selfCheckout: {
    enabled: boolean
    requireApproval: boolean
    weightVerification: boolean
    itemLimit: number
  }
  weighingScale: {
    enabled: boolean
    tareWeight: number
    printLabels: boolean
    barcodeFormat: string
  }
  pluCodes: {
    enabled: boolean
    format: string
    autoGenerate: boolean
  }
  shelfLabels: {
    enabled: boolean
    format: "standard" | "electronic" | "custom"
    includePricePerUnit: boolean
    includeBarcode: boolean
  }
  supplierOrders: {
    autoGenerate: boolean
    approvalRequired: boolean
    orderDays: number[]
  }
  stockRotation: {
    method: "FIFO" | "LIFO" | "FEFO"
    enforceMethod: boolean
    expiryAlertDays: number
  }
}

// Taxation & Compliance Settings
export interface TaxationSettings {
  taxConfiguration: {
    multiTax: boolean
    taxInclusive: boolean
    roundingMethod: "up" | "down" | "nearest"
  }
  taxRates: {
    id: string
    name: string
    rate: number
    applies: {
      productCategories: string[]
      locationIds: string[]
      customerGroups: string[]
    }
  }[]
  taxExemptions: {
    enabled: boolean
    requireDocumentation: boolean
    exemptionTypes: string[]
  }
  regionalTax: {
    enabled: boolean
    regions: {
      id: string
      name: string
      taxRates: {
        name: string
        rate: number
      }[]
    }[]
  }
  invoicing: {
    format: "standard" | "detailed" | "simplified"
    autoGenerate: boolean
    digitalSignature: boolean
    complianceText: string
  }
  auditLogs: {
    enabled: boolean
    retentionPeriod: number
    detailLevel: "basic" | "detailed" | "comprehensive"
  }
}

// Reporting & Analytics Configuration
export interface ReportingSettings {
  dashboard: {
    refreshRate: number
    defaultTimeframe: "today" | "yesterday" | "this_week" | "this_month" | "custom"
    kpis: string[]
  }
  salesReports: {
    enabled: boolean
    scheduledReports: {
      frequency: "daily" | "weekly" | "monthly"
      recipients: string[]
      format: "pdf" | "csv" | "excel"
    }[]
  }
  inventoryReports: {
    enabled: boolean
    includeCost: boolean
    includeSupplier: boolean
  }
  financialReports: {
    enabled: boolean
    includeTaxDetails: boolean
    includePaymentBreakdown: boolean
  }
  employeeReports: {
    enabled: boolean
    trackPerformance: boolean
    trackAttendance: boolean
  }
  customerReports: {
    enabled: boolean
    includePersonalData: boolean
    segmentationEnabled: boolean
  }
  exportOptions: {
    formats: ("csv" | "pdf" | "excel" | "json")[]
    scheduling: boolean
    compression: boolean
  }
}

// API & Integrations
export interface IntegrationSettings {
  ecommerce: {
    platforms: {
      id: string
      name: string
      enabled: boolean
      apiKey?: string
      apiSecret?: string
      syncFrequency: number
      syncInventory: boolean
      syncOrders: boolean
      syncCustomers: boolean
    }[]
  }
  accounting: {
    software: {
      id: string
      name: string
      enabled: boolean
      apiKey?: string
      apiSecret?: string
      syncFrequency: number
      syncSales: boolean
      syncPurchases: boolean
      syncInventory: boolean
    }[]
  }
  crm: {
    platforms: {
      id: string
      name: string
      enabled: boolean
      apiKey?: string
      apiSecret?: string
      syncFrequency: number
      syncCustomers: boolean
      syncSales: boolean
      syncMarketing: boolean
    }[]
  }
  delivery: {
    services: {
      id: string
      name: string
      enabled: boolean
      apiKey?: string
      apiSecret?: string
      autoAccept: boolean
      preparationTimeBuffer: number
    }[]
  }
  iot: {
    devices: {
      id: string
      name: string
      type: string
      enabled: boolean
      connectionDetails: any
    }[]
  }
}

// Security & Backup Settings
export interface SecuritySettings {
  roleSecurity: {
    enforceStrictRoles: boolean
    passwordPolicies: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
      expiryDays: number
    }
  }
  twoFactor: {
    enabled: boolean
    requiredForRoles: string[]
    methods: ("app" | "sms" | "email")[]
  }
  auditTrails: {
    enabled: boolean
    detailLevel: "basic" | "detailed" | "comprehensive"
    retentionPeriod: number
  }
  dataBackup: {
    automatic: boolean
    frequency: "daily" | "weekly" | "monthly"
    retentionCount: number
    encryptBackups: boolean
    offSiteStorage: boolean
  }
  accessControl: {
    ipWhitelist: string[]
    deviceRegistration: boolean
    sessionTimeout: number
    concurrentSessions: boolean
    maxConcurrentSessions: number
  }
}

// Combined Settings Interface
export interface GlobalPOSSettings {
  general: GeneralSettings
  posTerminal: POSTerminalSettings
  payment: PaymentSettings
  inventory: InventorySettings
  pricing: PricingSettings
  customer: CustomerSettings
  employee: EmployeeSettings
  restaurant?: RestaurantSettings
  hotel?: HotelSettings
  retailGrocery?: RetailGrocerySettings
  taxation: TaxationSettings
  reporting: ReportingSettings
  integration: IntegrationSettings
  security: SecuritySettings
}

