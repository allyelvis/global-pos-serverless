// Default settings for the advanced settings forms

// POS Terminal Settings
export const defaultPOSTerminalSettings = {
  receiptPrinter: {
    enabled: true,
    printerName: "Default Printer",
    paperSize: "80mm",
    autoPrint: true,
  },
  customerDisplay: {
    enabled: false,
    displayType: "lcd",
  },
  barcodeScanner: {
    enabled: true,
    scannerType: "handheld",
  },
  cashDrawer: {
    enabled: true,
    openAutomatically: true,
  },
  touchscreen: {
    enabled: true,
    calibration: "standard",
  },
  paymentTerminals: {
    enabled: true,
    terminalType: "integrated",
    connectionType: "usb",
  },
  offlineMode: {
    enabled: true,
    syncInterval: 15,
  },
}

// Payment Settings
export const defaultPaymentSettings = {
  methods: [
    {
      id: "method-1",
      name: "Cash",
      type: "cash",
      enabled: true,
      processingFee: 0,
      defaultForCheckout: true,
    },
    {
      id: "method-2",
      name: "Credit Card",
      type: "card",
      enabled: true,
      processingFee: 2.9,
      defaultForCheckout: false,
    },
  ],
  gateways: [
    {
      id: "gateway-1",
      name: "Stripe",
      enabled: true,
      apiKey: "",
      secretKey: "",
    },
  ],
  autoCapture: true,
  requireSignature: true,
  signatureThreshold: 25,
  allowPartialPayments: true,
  allowSplitPayments: true,
  allowRefunds: true,
  refundPeriod: 30,
  receiptOptions: {
    emailReceipt: true,
    printReceipt: true,
    smsReceipt: false,
  },
}

// Inventory Settings
export const defaultInventorySettings = {
  trackInventory: true,
  lowStockThreshold: 10,
  outOfStockBehavior: "show-unavailable",
  inventoryCountFrequency: "monthly",
  barcodeSystem: {
    type: "upc",
    prefix: "",
    autoGenerate: true,
  },
  multiLocation: {
    enabled: false,
    allowTransfers: true,
    requireApproval: true,
  },
  suppliers: {
    trackSuppliers: true,
    autoReorder: false,
    reorderThreshold: 25,
  },
  batchTracking: {
    enabled: false,
    trackExpiryDates: false,
    warnBeforeExpiry: false,
    expiryWarningDays: 7,
  },
  costCalculation: "fifo",
}

// Pricing Settings
export const defaultPricingSettings = {
  enableMultiplePriceLevels: false,
  priceLevels: [
    {
      id: "price-level-1",
      name: "Retail",
      type: "percentage",
      value: 0,
      enabled: true,
    },
    {
      id: "price-level-2",
      name: "Wholesale",
      type: "percentage",
      value: -15,
      enabled: true,
    },
  ],
  roundingMethod: "nearest",
  roundingPrecision: 0.01,
  enableBulkPricing: true,
  enableSeasonalPricing: false,
  enableDynamicPricing: false,
  dynamicPricingSettings: {
    minAdjustmentPercent: -10,
    maxAdjustmentPercent: 10,
    adjustBasedOn: ["inventory", "demand"],
  },
  enablePromotions: true,
  promotionSettings: {
    allowStackingPromotions: false,
    maxPromotionsPerProduct: 1,
  },
}

// Customer Settings
export const defaultCustomerSettings = {
  enableCustomerAccounts: true,
  requirePhoneNumber: false,
  requireEmail: true,
  enableLoyaltyProgram: true,
  loyaltySettings: {
    pointsPerCurrency: 1,
    pointsExpiryDays: 365,
    minimumPointsRedemption: 100,
    tiers: [
      {
        id: "tier-1",
        name: "Bronze",
        minimumPoints: 0,
        discountPercentage: 0,
        pointsMultiplier: 1,
        enabled: true,
      },
      {
        id: "tier-2",
        name: "Silver",
        minimumPoints: 1000,
        discountPercentage: 5,
        pointsMultiplier: 1.25,
        enabled: true,
      },
      {
        id: "tier-3",
        name: "Gold",
        minimumPoints: 5000,
        discountPercentage: 10,
        pointsMultiplier: 1.5,
        enabled: true,
      },
    ],
  },
  customerGroups: {
    enabled: true,
    allowCustomPricing: true,
  },
  feedback: {
    collectFeedback: true,
    feedbackMethod: "email",
    sendSurveyAfterPurchase: true,
    daysAfterPurchase: 3,
  },
  marketing: {
    allowEmailMarketing: true,
    allowSmsMarketing: false,
    defaultOptIn: false,
  },
}

// Employee Settings
export const defaultEmployeeSettings = {
  trackEmployeeHours: true,
  requireClockInOut: true,
  allowEmployeeDiscount: true,
  employeeDiscountPercent: 10,
  requireManagerApproval: true,
  securitySettings: {
    requirePinForLogin: true,
    pinLength: 4,
    requirePasswordReset: true,
    passwordResetDays: 90,
  },
  commissionSettings: {
    enableCommission: false,
    commissionType: "percentage",
    commissionRate: 5,
  },
  scheduleSettings: {
    enableScheduling: true,
    allowEmployeeSwap: true,
    requireManagerApproval: true,
    notifyScheduleChanges: true,
  },
}

// Restaurant Settings
export const defaultRestaurantSettings = {
  enableTableManagement: true,
  tableLayout: {
    autoAssignTables: false,
    showTableStatus: true,
  },
  kitchenDisplay: {
    enabled: true,
    autoSortOrders: true,
    displayCookingTime: true,
    alertOverdueOrders: true,
  },
  orderSettings: {
    allowSplitBills: true,
    requireItemModifiers: false,
    allowCustomModifiers: true,
    enableCourses: true,
  },
  menuSettings: {
    showNutritionInfo: false,
    showAllergenInfo: true,
    enableSpecials: true,
    enableSeasonalItems: true,
  },
  reservations: {
    enabled: true,
    allowOnlineReservations: true,
    reservationTimeSlotMinutes: 30,
    requireDeposit: false,
    depositAmount: 0,
  },
}

// Hotel Settings
export const defaultHotelSettings = {
  roomManagement: {
    enableRoomManagement: true,
    showRoomStatus: true,
    autoAssignRooms: false,
  },
  checkInOut: {
    standardCheckInTime: "15:00",
    standardCheckOutTime: "11:00",
    allowEarlyCheckIn: true,
    allowLateCheckOut: true,
    earlyCheckInFee: 25,
    lateCheckOutFee: 25,
  },
  reservations: {
    allowOnlineReservations: true,
    requireDeposit: true,
    depositPercentage: 20,
    cancellationPolicyDays: 2,
    cancellationFee: 50,
  },
  guestServices: {
    enableRoomService: true,
    enableHousekeeping: true,
    enableConcierge: true,
    enableMiniBar: true,
  },
  billing: {
    chargePerRoom: true,
    chargePerGuest: false,
    allowRoomCharges: true,
    requireCreditCardOnFile: true,
  },
}

// Retail/Grocery Settings
export const defaultRetailGrocerySettings = {
  barcodeScanning: {
    enabled: true,
    scannerType: "handheld",
    autoGenerateBarcodes: true,
  },
  weighingScale: {
    enabled: true,
    scaleType: "integrated",
    autoDetectWeight: true,
    requireWeightVerification: true,
  },
  shelfLabels: {
    enabled: true,
    showPricePerUnit: true,
    showDiscounts: true,
    enableDigitalLabels: false,
  },
  selfCheckout: {
    enabled: false,
    requireAttendantApproval: true,
    allowCashPayments: false,
    weightVerification: true,
  },
  productCategories: {
    enableDepartments: true,
    enableSubcategories: true,
    enableAttributes: true,
    enableVariants: true,
  },
  inventoryManagement: {
    trackInventory: true,
    lowStockAlerts: true,
    enableAutoReorder: false,
    trackExpiryDates: true,
    enableFIFO: true,
  },
  pricingOptions: {
    enableBulkPricing: true,
    enableQuantityDiscounts: true,
    enableMemberPricing: true,
    enableTimedPromotions: true,
  },
}

// Taxation Settings
export const defaultTaxationSettings = {
  enableTaxation: true,
  taxInclusivePricing: false,
  calculateTaxBasedOn: "shipping",
  roundTaxAtSubtotalLevel: true,
  displayTaxTotalsOnReceipts: true,
  taxRates: [
    {
      id: "tax-rate-1",
      name: "Standard Rate",
      rate: 8.5,
      isDefault: true,
      applyToShipping: true,
      enabled: true,
    },
    {
      id: "tax-rate-2",
      name: "Reduced Rate",
      rate: 5,
      isDefault: false,
      applyToShipping: false,
      enabled: true,
    },
  ],
  taxExemptions: [
    {
      id: "tax-exemption-1",
      name: "Non-Profit",
      code: "NP-001",
      requireVerification: true,
      enabled: true,
    },
  ],
  digitalTaxes: {
    enableDigitalTaxes: false,
    collectVATForDigitalGoods: false,
    digitalGoodsTaxRate: 20,
  },
  taxReporting: {
    generateTaxReports: true,
    reportFrequency: "monthly",
    includeExemptSales: true,
  },
}

// Reporting Settings
export const defaultReportingSettings = {
  dashboardSettings: {
    refreshInterval: 5,
    defaultDateRange: "this-week",
    showSalesGraph: true,
    showInventoryStatus: true,
    showTopProducts: true,
    showRecentOrders: true,
  },
  salesReporting: {
    enableSalesReports: true,
    includeTaxInReports: true,
    includeDiscountsInReports: true,
    trackSalesByEmployee: true,
    trackSalesByLocation: true,
  },
  inventoryReporting: {
    enableInventoryReports: true,
    trackStockLevels: true,
    trackInventoryValue: true,
    trackInventoryMovement: true,
    alertLowStock: true,
  },
  customerReporting: {
    enableCustomerReports: true,
    trackCustomerSpending: true,
    trackCustomerVisits: true,
    trackCustomerAcquisition: true,
    enableCustomerSegmentation: true,
  },
  scheduledReports: [
    {
      id: "report-1",
      name: "Weekly Sales Summary",
      type: "sales",
      frequency: "weekly",
      format: "pdf",
      recipients: [],
      enabled: true,
    },
  ],
  exportOptions: {
    enableExport: true,
    availableFormats: ["pdf", "csv", "excel"],
    includeHeadersInExport: true,
    enableScheduledExports: true,
  },
}

// Integration Settings
export const defaultIntegrationSettings = {
  paymentGateways: {
    enablePaymentGateways: true,
    gateways: [
      {
        id: "integration-1",
        name: "Stripe",
        enabled: true,
        apiKey: "",
        apiSecret: "",
        apiUrl: "https://api.stripe.com",
        syncFrequency: 60,
        lastSynced: null,
      },
    ],
  },
  ecommerce: {
    enableEcommerce: false,
    platforms: [],
  },
  accounting: {
    enableAccounting: false,
    systems: [],
  },
  shipping: {
    enableShipping: false,
    providers: [],
  },
  marketing: {
    enableMarketing: false,
    platforms: [],
  },
  apiSettings: {
    enablePublicAPI: false,
    requireAuthentication: true,
    rateLimitRequests: 100,
    webhookURL: "",
  },
}

// Security Settings
export const defaultSecuritySettings = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiryDays: 90,
    preventPasswordReuse: true,
    previousPasswordsToCheck: 3,
  },
  loginSecurity: {
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    requireCaptcha: true,
    enableTwoFactor: false,
    twoFactorMethod: "app",
  },
  sessionSecurity: {
    sessionTimeout: 30,
    enforceOneSessionPerUser: false,
    requireReauthForSensitiveActions: true,
    rememberMeDuration: 14,
  },
  ipSecurity: {
    enableIPWhitelist: false,
    whitelistedIPs: [],
    blockForeignIPs: false,
  },
  dataProtection: {
    enableDataEncryption: true,
    encryptionLevel: "high",
    enableDataBackup: true,
    backupFrequency: "daily",
    backupRetention: 30,
  },
  auditLogging: {
    enableAuditLogs: true,
    logUserActions: true,
    logSystemEvents: true,
    logRetentionDays: 90,
  },
}

// Combined default settings
export const defaultAdvancedSettings = {
  posTerminal: defaultPOSTerminalSettings,
  payment: defaultPaymentSettings,
  inventory: defaultInventorySettings,
  pricing: defaultPricingSettings,
  customer: defaultCustomerSettings,
  employee: defaultEmployeeSettings,
  restaurant: defaultRestaurantSettings,
  hotel: defaultHotelSettings,
  retailGrocery: defaultRetailGrocerySettings,
  taxation: defaultTaxationSettings,
  reporting: defaultReportingSettings,
  integration: defaultIntegrationSettings,
  security: defaultSecuritySettings,
}

