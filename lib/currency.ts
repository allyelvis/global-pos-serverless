// Define supported currencies
export interface Currency {
  code: string
  symbol: string
  name: string
  decimalPlaces: number
  symbolPosition: "before" | "after"
}

// List of supported currencies
export const currencies: Record<string, Currency> = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    decimalPlaces: 2,
    symbolPosition: "before",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    decimalPlaces: 2,
    symbolPosition: "before",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    decimalPlaces: 2,
    symbolPosition: "before",
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    decimalPlaces: 0,
    symbolPosition: "before",
  },
  CNY: {
    code: "CNY",
    symbol: "¥",
    name: "Chinese Yuan",
    decimalPlaces: 2,
    symbolPosition: "before",
  },
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    decimalPlaces: 2,
    symbolPosition: "before",
  },
  AUD: {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    decimalPlaces: 2,
    symbolPosition: "before",
  },
  CAD: {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    decimalPlaces: 2,
    symbolPosition: "before",
  },
  SGD: {
    code: "SGD",
    symbol: "S$",
    name: "Singapore Dollar",
    decimalPlaces: 2,
    symbolPosition: "before",
  },
  MXN: {
    code: "MXN",
    symbol: "Mex$",
    name: "Mexican Peso",
    decimalPlaces: 2,
    symbolPosition: "before",
  },
}

// Exchange rates (relative to USD)
// In a real application, these would be fetched from an API
export const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150.23,
  CNY: 7.19,
  INR: 83.12,
  AUD: 1.52,
  CAD: 1.36,
  SGD: 1.34,
  MXN: 16.75,
}

// Format amount according to currency
export function formatCurrencyAmount(amount: number, currencyCode: string): string {
  const currency = currencies[currencyCode] || currencies.USD

  const formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  }).format(amount)

  return currency.symbolPosition === "before"
    ? `${currency.symbol}${formattedAmount}`
    : `${formattedAmount} ${currency.symbol}`
}

// Convert amount from one currency to another
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount
  }

  // Convert to USD first (as base currency)
  const amountInUSD = amount / exchangeRates[fromCurrency]

  // Then convert from USD to target currency
  return amountInUSD * exchangeRates[toCurrency]
}

// Get exchange rate between two currencies
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  return exchangeRates[toCurrency] / exchangeRates[fromCurrency]
}

/**
 * Format a number as currency
 * @param value - The number to format
 * @param currency - The currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Convert currency using provided exchange rates
 * @param value - The amount to convert
 * @param fromCurrency - The source currency code
 * @param toCurrency - The target currency code
 * @param exchangeRates - Object containing exchange rates
 * @returns Converted amount
 */
export function convertCurrencyWithRates(
  value: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: Record<string, number>,
): number {
  if (fromCurrency === toCurrency) return value

  const fromRate = exchangeRates[fromCurrency] || 1
  const toRate = exchangeRates[toCurrency] || 1

  return (value / fromRate) * toRate
}

/**
 * Get currency symbol
 * @param currencyCode - The currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CNY: "¥",
    INR: "₹",
    AUD: "A$",
    CAD: "C$",
    CHF: "Fr",
    HKD: "HK$",
    SGD: "S$",
    // Add more as needed
  }

  return symbols[currencyCode] || currencyCode
}

