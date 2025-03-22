"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Define available languages
export const AVAILABLE_LANGUAGES = {
  en: { name: "English", flag: "🇺🇸" },
  es: { name: "Español", flag: "🇪🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  zh: { name: "中文", flag: "🇨🇳" },
  ar: { name: "العربية", flag: "🇸🇦" },
  pt: { name: "Português", flag: "🇧🇷" },
  ru: { name: "Русский", flag: "🇷🇺" },
  ja: { name: "日本語", flag: "🇯🇵" },
  hi: { name: "हिन्दी", flag: "🇮🇳" },
}

// Define the context type
type I18nContextType = {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string, params?: Record<string, string>) => string
  dir: "ltr" | "rtl"
  availableLanguages: typeof AVAILABLE_LANGUAGES
}

// Create the context
const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Translation data
type TranslationsType = Record<string, Record<string, string>>

// This would normally be loaded from JSON files or an API
const translations: TranslationsType = {
  en: {
    "common.welcome": "Welcome to Global POS",
    "common.dashboard": "Dashboard",
    "common.products": "Products",
    "common.orders": "Orders",
    "common.customers": "Customers",
    "common.reports": "Reports",
    "common.settings": "Settings",
    "common.logout": "Logout",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success",
    "common.confirm": "Confirm",
    "common.back": "Back",
    "common.next": "Next",
    "common.finish": "Finish",
    "pos.checkout": "Checkout",
    "pos.payment": "Payment",
    "pos.total": "Total",
    "pos.subtotal": "Subtotal",
    "pos.tax": "Tax",
    "pos.discount": "Discount",
    "pos.addItem": "Add Item",
    "pos.removeItem": "Remove Item",
    "pos.clearCart": "Clear Cart",
    "pos.completeOrder": "Complete Order",
    "pos.cancelOrder": "Cancel Order",
    "pos.printReceipt": "Print Receipt",
    "pos.emailReceipt": "Email Receipt",
    "pos.smsReceipt": "SMS Receipt",
    "products.name": "Name",
    "products.price": "Price",
    "products.stock": "Stock",
    "products.category": "Category",
    "products.sku": "SKU",
    "products.barcode": "Barcode",
    "products.cost": "Cost",
    "products.margin": "Margin",
    "products.taxRate": "Tax Rate",
    "products.description": "Description",
    "products.image": "Image",
    "products.addProduct": "Add Product",
    "products.editProduct": "Edit Product",
    "products.deleteProduct": "Delete Product",
    "customers.name": "Name",
    "customers.email": "Email",
    "customers.phone": "Phone",
    "customers.address": "Address",
    "customers.loyalty": "Loyalty Points",
    "customers.group": "Customer Group",
    "customers.lastVisit": "Last Visit",
    "customers.totalSpent": "Total Spent",
    "customers.addCustomer": "Add Customer",
    "customers.editCustomer": "Edit Customer",
    "customers.deleteCustomer": "Delete Customer",
    "orders.id": "Order ID",
    "orders.date": "Date",
    "orders.customer": "Customer",
    "orders.total": "Total",
    "orders.status": "Status",
    "orders.items": "Items",
    "orders.payment": "Payment Method",
    "orders.employee": "Employee",
    "orders.viewOrder": "View Order",
    "orders.editOrder": "Edit Order",
    "orders.cancelOrder": "Cancel Order",
    "orders.refundOrder": "Refund Order",
    "reports.sales": "Sales Report",
    "reports.inventory": "Inventory Report",
    "reports.customers": "Customer Report",
    "reports.employees": "Employee Report",
    "reports.taxes": "Tax Report",
    "reports.period": "Period",
    "reports.export": "Export Report",
    "reports.print": "Print Report",
    "settings.general": "General Settings",
    "settings.pos": "POS Settings",
    "settings.payment": "Payment Settings",
    "settings.tax": "Tax Settings",
    "settings.users": "User Settings",
    "settings.business": "Business Settings",
    "settings.integrations": "Integrations",
    "settings.advanced": "Advanced Settings",
    "login.username": "Username",
    "login.password": "Password",
    "login.forgotPassword": "Forgot Password?",
    "login.signIn": "Sign In",
    "login.register": "Register",
    "register.businessName": "Business Name",
    "register.email": "Email",
    "register.password": "Password",
    "register.confirmPassword": "Confirm Password",
    "register.createAccount": "Create Account",
    "register.alreadyHaveAccount": "Already have an account?",
  },
  es: {
    "common.welcome": "Bienvenido a Global POS",
    "common.dashboard": "Panel",
    "common.products": "Productos",
    "common.orders": "Pedidos",
    "common.customers": "Clientes",
    "common.reports": "Informes",
    "common.settings": "Configuración",
    "common.logout": "Cerrar sesión",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.add": "Añadir",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.sort": "Ordenar",
    "common.loading": "Cargando...",
    "common.error": "Ocurrió un error",
    "common.success": "Éxito",
    "common.confirm": "Confirmar",
    "common.back": "Atrás",
    "common.next": "Siguiente",
    "common.finish": "Finalizar",
    "pos.checkout": "Pagar",
    "pos.payment": "Pago",
    "pos.total": "Total",
    "pos.subtotal": "Subtotal",
    "pos.tax": "Impuesto",
    "pos.discount": "Descuento",
    "pos.addItem": "Añadir artículo",
    "pos.removeItem": "Eliminar artículo",
    "pos.clearCart": "Vaciar carrito",
    "pos.completeOrder": "Completar pedido",
    "pos.cancelOrder": "Cancelar pedido",
    "pos.printReceipt": "Imprimir recibo",
    "pos.emailReceipt": "Enviar recibo por email",
    "pos.smsReceipt": "Enviar recibo por SMS",
    // More translations would be added here
  },
  // Additional languages would be added here
}

// RTL languages
const rtlLanguages = ["ar"]

// Provider component
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState("en")
  const router = useRouter()

  // Initialize language from localStorage if available
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language")
    if (storedLanguage && AVAILABLE_LANGUAGES[storedLanguage as keyof typeof AVAILABLE_LANGUAGES]) {
      setLanguageState(storedLanguage)
    }
  }, [])

  // Set language and store in localStorage
  const setLanguage = (lang: string) => {
    if (AVAILABLE_LANGUAGES[lang as keyof typeof AVAILABLE_LANGUAGES]) {
      setLanguageState(lang)
      localStorage.setItem("language", lang)
      // Refresh the page to apply RTL/LTR changes if needed
      if (
        (rtlLanguages.includes(lang) && !rtlLanguages.includes(language)) ||
        (!rtlLanguages.includes(lang) && rtlLanguages.includes(language))
      ) {
        router.refresh()
      }
    }
  }

  // Translation function
  const t = (key: string, params?: Record<string, string>): string => {
    const translation = translations[language]?.[key] || translations.en[key] || key

    if (params) {
      return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
        return acc.replace(new RegExp(`{{${paramKey}}}`, "g"), paramValue)
      }, translation)
    }

    return translation
  }

  // Determine text direction
  const dir: "ltr" | "rtl" = rtlLanguages.includes(language) ? "rtl" : "ltr"

  const value = {
    language,
    setLanguage,
    t,
    dir,
    availableLanguages: AVAILABLE_LANGUAGES,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// Hook to use the i18n context
export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

